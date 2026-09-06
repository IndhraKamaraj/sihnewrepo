/**
 * Historical Delay Intelligence Service
 * SIH Problem Statement 26028: Dynamic Arrival Time Prediction Engine
 *
 * ARCHITECTURAL SPECIFICATION:
 * - Pure, deterministic statistical calculation engine.
 * - Calculations (sampleCount, median, 90th percentile, min, max, variability)
 *   are computed directly from raw historical simulation records, not hardcoded.
 * - STRICT PROVENANCE: All records are labelled "TEST / SIMULATION".
 * - Pluggable provider architecture (IHistoricalDataProvider) for future data source swappability.
 * - Decoupled from React UI components.
 */

import {
  HistoricalRecord,
  CalculatedSectionStats,
  HistoricalContext,
  HistoricalEvaluationSummary,
  DelayVariability,
  IHistoricalDataProvider
} from '../types/historical';
import { RouteSection } from '../types/eta';
import { Train } from '../types/train';
import { HISTORICAL_TEST_RECORDS } from '../data/historicalDelayTestData';
import { TrainStateService } from './TrainStateService';

export interface HistoricalContextParams {
  train: Train;
  currentSection?: RouteSection | null;
  allRouteSections?: RouteSection[];
}

/**
 * Default Test/Simulation Historical Data Provider.
 * Serves the deterministic simulation dataset.
 */
export class TestHistoricalDataProvider implements IHistoricalDataProvider {
  public readonly providerId = 'TEST_SIMULATION_PROVIDER';
  public readonly providerName = 'Test / Simulation Development Dataset';
  public readonly dataProvenance = 'TEST / SIMULATION' as const;
  public readonly isGroundTruthVerified = false;

  private records: HistoricalRecord[] = [...HISTORICAL_TEST_RECORDS];

  public getRecordsForTrain(trainNumber: string): HistoricalRecord[] {
    const cleanNo = trainNumber.trim();
    return this.records.filter((r) => r.trainNumber.trim() === cleanNo);
  }

  public getRecordsForSection(
    trainNumber: string,
    fromStationCode: string,
    toStationCode: string
  ): HistoricalRecord[] {
    const cleanNo = trainNumber.trim();
    const fromUpper = fromStationCode.trim().toUpperCase();
    const toUpper = toStationCode.trim().toUpperCase();
    const sectionKey = `${fromUpper}-${toUpper}`;

    return this.records.filter(
      (r) =>
        r.trainNumber.trim() === cleanNo &&
        ((r.fromStationCode === fromUpper && r.toStationCode === toUpper) ||
          r.routeSection === sectionKey)
    );
  }

  public getRecordsForStation(trainNumber: string, stationCode: string): HistoricalRecord[] {
    const cleanNo = trainNumber.trim();
    const stnUpper = stationCode.trim().toUpperCase();
    return this.records.filter(
      (r) =>
        r.trainNumber.trim() === cleanNo &&
        (r.stationCode === stnUpper || r.fromStationCode === stnUpper || r.toStationCode === stnUpper)
    );
  }
}

/**
 * Pure Statistical Calculation Utilities
 */
export class StatisticsCalculator {
  /**
   * Calculates the exact mathematical median of an array of numbers.
   */
  public static calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 !== 0) {
      return sorted[mid];
    }
    return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10;
  }

  /**
   * Calculates the 90th percentile using standard linear interpolation.
   * If sample count < 4, returns null gracefully (no fabricated numbers).
   */
  public static calculate90thPercentile(values: number[]): number | null {
    if (values.length < 4) {
      return null; // Graceful handling for insufficient sample size
    }
    const sorted = [...values].sort((a, b) => a - b);
    const index = 0.9 * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) {
      return sorted[lower];
    }
    const val = sorted[lower] * (1 - weight) + sorted[upper] * weight;
    return Math.round(val * 10) / 10;
  }

  /**
   * Calculates arithmetic mean rounded to 1 decimal place.
   */
  public static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, v) => acc + v, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }

  /**
   * Calculates sample standard deviation rounded to 1 decimal place.
   */
  public static calculateStandardDeviation(values: number[], mean?: number): number {
    if (values.length <= 1) return 0;
    const avg = mean !== undefined ? mean : this.calculateAverage(values);
    const sumSquareDiff = values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0);
    const variance = sumSquareDiff / (values.length - 1);
    return Math.round(Math.sqrt(variance) * 10) / 10;
  }

  /**
   * Derives categorical variability from standard deviation and range.
   */
  public static deriveVariability(
    values: number[],
    stdDev: number,
    median: number
  ): DelayVariability {
    if (values.length === 0) return 'LOW';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min;

    if (stdDev <= 1.4 && spread <= 3) {
      return 'LOW';
    }
    if (stdDev <= 2.8 || spread <= 6) {
      return 'MODERATE';
    }
    return 'HIGH';
  }

  /**
   * Generates a descriptive delay tendency label.
   */
  public static deriveTendencyLabel(median: number, variability: DelayVariability): string {
    if (median <= 1.5) {
      return 'Low delay tendency';
    }
    if (median <= 4.0) {
      return 'Moderate delay tendency';
    }
    return 'High delay tendency';
  }
}

/**
 * Historical Delay Service
 */
export class HistoricalDelayService {
  private static provider: IHistoricalDataProvider = new TestHistoricalDataProvider();

  /**
   * Allows swapping the historical data provider (Requirement 12: Swappability)
   */
  public static setDataProvider(newProvider: IHistoricalDataProvider): void {
    this.provider = newProvider;
  }

  public static getDataProvider(): IHistoricalDataProvider {
    return this.provider;
  }

  /**
   * Queries raw historical records for a train.
   */
  public static getRecordsForTrain(trainNumber: string): HistoricalRecord[] {
    return this.provider.getRecordsForTrain(trainNumber);
  }

  /**
   * Queries raw historical records for a route section.
   */
  public static getRecordsForSection(
    trainNumber: string,
    fromStationCode: string,
    toStationCode: string
  ): HistoricalRecord[] {
    return this.provider.getRecordsForSection(trainNumber, fromStationCode, toStationCode);
  }

  /**
   * Calculates deterministic statistics for a route section from raw historical records.
   */
  public static calculateSectionStats(
    trainNumber: string,
    fromStationCode: string,
    toStationCode: string
  ): CalculatedSectionStats | undefined {
    const records = this.getRecordsForSection(trainNumber, fromStationCode, toStationCode);
    if (records.length === 0) return undefined;

    const fromUpper = fromStationCode.trim().toUpperCase();
    const toUpper = toStationCode.trim().toUpperCase();
    const sectionKey = `${fromUpper}-${toUpper}`;

    const delays = records.map((r) => r.observedDelayMinutes);
    const min = Math.min(...delays);
    const max = Math.max(...delays);
    const median = StatisticsCalculator.calculateMedian(delays);
    const p90 = StatisticsCalculator.calculate90thPercentile(delays);
    const avg = StatisticsCalculator.calculateAverage(delays);
    const stdDev = StatisticsCalculator.calculateStandardDeviation(delays, avg);
    const variability = StatisticsCalculator.deriveVariability(delays, stdDev, median);
    const delayTendencyLabel = StatisticsCalculator.deriveTendencyLabel(median, variability);

    return {
      sectionKey,
      fromStationCode: fromUpper,
      toStationCode: toUpper,
      sampleCount: records.length,
      minDelayMinutes: min,
      maxDelayMinutes: max,
      medianDelayMinutes: median,
      percentile90DelayMinutes: p90,
      averageDelayMinutes: avg,
      standardDeviationMinutes: stdDev,
      variability,
      delayTendencyLabel,
      dataProvenance: 'TEST / SIMULATION'
    };
  }

  /**
   * Synthesizes Historical Context for the Dynamic ETA Engine.
   *
   * ARCHITECTURAL COUPLING:
   * Called by DynamicETAEngine to inject transparent, section-specific historical delay
   * context into dynamic arrival propagation without overriding acute real-time disturbances.
   * Follows the CURRENT active route section during traversal and replay.
   */
  public static getHistoricalContext(
    paramsOrTrain: Train | HistoricalContextParams,
    optionalCurrentOrUpcomingSections?: RouteSection | null | RouteSection[]
  ): HistoricalContext {
    let train: Train;
    let currentSection: RouteSection | null = null;
    let allRouteSections: RouteSection[] | undefined = undefined;

    if ('train' in paramsOrTrain) {
      train = paramsOrTrain.train;
      currentSection = paramsOrTrain.currentSection || null;
      allRouteSections = paramsOrTrain.allRouteSections;
    } else {
      train = paramsOrTrain;
      if (Array.isArray(optionalCurrentOrUpcomingSections)) {
        allRouteSections = optionalCurrentOrUpcomingSections;
        currentSection = optionalCurrentOrUpcomingSections.find((s) => s.isCurrentActiveSection) || null;
      } else {
        currentSection = optionalCurrentOrUpcomingSections || null;
      }
    }

    const effectiveRouteSections = allRouteSections || TrainStateService.buildRouteSections(train);

    if (!currentSection) {
      currentSection = TrainStateService.getCurrentRouteSection(train, effectiveRouteSections);
    }

    const cleanNo = train.trainNumber.trim();
    const sectionProfiles: CalculatedSectionStats[] = [];
    const sectionStatsMap: Record<string, CalculatedSectionStats> = {};

    for (const sec of effectiveRouteSections) {
      const stats = this.calculateSectionStats(cleanNo, sec.fromStationCode, sec.toStationCode);
      if (stats) {
        sectionProfiles.push(stats);
        sectionStatsMap[stats.sectionKey] = stats;
      }
    }

    const currentSectionKey = currentSection
      ? `${currentSection.fromStationCode.toUpperCase()}-${currentSection.toStationCode.toUpperCase()}`
      : undefined;
    const currentSectionLabel = currentSection
      ? `${currentSection.fromStationCode} → ${currentSection.toStationCode}`
      : undefined;

    const currentStats = currentSection
      ? this.calculateSectionStats(cleanNo, currentSection.fromStationCode, currentSection.toStationCode)
      : undefined;

    // Corridor Name (dynamic for all trains)
    const corridorName = `${train.sourceStationCode} → ${train.destinationStationCode} (${train.trainName}) Corridor`;

    if (currentStats && currentStats.sampleCount > 0) {
      const isCurrentSectionAvailable = true;
      const sampleCount = currentStats.sampleCount;
      const totalHistoricalRuns = sampleCount;
      const hasSufficientData = sampleCount >= 4;

      const overallMedianDelayMinutes = currentStats.medianDelayMinutes;
      const overallP90DelayMinutes = currentStats.percentile90DelayMinutes;
      const overallMinDelayMinutes = currentStats.minDelayMinutes;
      const overallMaxDelayMinutes = currentStats.maxDelayMinutes;
      const dominantVariability = currentStats.variability;
      const tendencySummary = currentStats.delayTendencyLabel;
      const dataProvenance = 'TEST / SIMULATION';

      // Conservative, bounded delay bias:
      // In absence of acute real-time disturbances, historical section drag adds a modest,
      // bounded bias (capped between 0 and 3 min) rather than overriding real-time state.
      const overallHistoricalDelayBiasMinutes = hasSufficientData
        ? Math.min(3, Math.max(0, Math.round(overallMedianDelayMinutes * 0.35)))
        : 0;

      const p90Label = overallP90DelayMinutes !== null ? `, P90: +${overallP90DelayMinutes} min` : '';
      const explanationText = hasSufficientData
        ? `Historical context for active section ${currentSectionLabel}: ${tendencySummary.toLowerCase()} (median: +${overallMedianDelayMinutes} min${p90Label}, based on ${sampleCount} TEST / SIMULATION sample runs).`
        : `Active section ${currentSectionLabel} has ${sampleCount} sample run(s). Minimum 4 runs required for statistical confidence. Nominal timetable baseline applied.`;

      return {
        trainNumber: cleanNo,
        corridorName,
        totalHistoricalRuns,
        sampleCount,
        overallMedianDelayMinutes,
        overallP90DelayMinutes,
        overallMinDelayMinutes,
        overallMaxDelayMinutes,
        dominantVariability,
        tendencySummary,
        dataProvenance,
        overallHistoricalDelayBiasMinutes,
        sectionProfiles,
        sectionStatsMap,
        explanationText,
        hasSufficientData,
        isCurrentSectionAvailable,
        currentSectionKey,
        currentSectionLabel,
        currentSectionStats: currentStats
      };
    } else {
      // Missing / unavailable historical records for current section (e.g. Kerala Express or unrecorded section)
      // STRICT NON-FABRICATION: Zero records != zero delay. We explicitly show Unavailable and N/A.
      const isCurrentSectionAvailable = false;
      const hasSufficientData = false;
      const sampleCount = 0;
      const totalHistoricalRuns = 0;

      const overallMedianDelayMinutes = null;
      const overallP90DelayMinutes = null;
      const overallMinDelayMinutes = null;
      const overallMaxDelayMinutes = null;
      const dominantVariability: DelayVariability = 'N/A';
      const tendencySummary = 'Unavailable for current section';
      const dataProvenance = 'TEST / SIMULATION — No matching historical records';
      const overallHistoricalDelayBiasMinutes = 0;

      const secName = currentSectionLabel ? ` (${currentSectionLabel})` : '';
      const explanationText = `Historical Context: Unavailable for current section${secName}. No matching historical TEST / SIMULATION records found. Baseline timetable schedule applied without historical bias.`;

      return {
        trainNumber: cleanNo,
        corridorName,
        totalHistoricalRuns,
        sampleCount,
        overallMedianDelayMinutes,
        overallP90DelayMinutes,
        overallMinDelayMinutes,
        overallMaxDelayMinutes,
        dominantVariability,
        tendencySummary,
        dataProvenance,
        overallHistoricalDelayBiasMinutes,
        sectionProfiles,
        sectionStatsMap,
        explanationText,
        hasSufficientData,
        isCurrentSectionAvailable,
        currentSectionKey,
        currentSectionLabel,
        currentSectionStats: undefined
      };
    }
  }

  /**
   * Generates model evaluation summary (Requirement 11: Future Evaluation Readiness).
   *
   * STRICT GROUND TRUTH POLICY:
   * Because verified live ground-truth telemetry is not connected in this prototype,
   * fake MAE/RMSE numbers MUST NOT be fabricated.
   * Clearly outputs the required system disclaimer: "Evaluation requires verified historical ground-truth data."
   */
  public static getEvaluationSummary(trainNumber: string): HistoricalEvaluationSummary {
    const cleanNo = trainNumber.trim();
    const records = this.getRecordsForTrain(cleanNo);

    return {
      trainNumber: cleanNo,
      hasGroundTruthData: false,
      evaluationDisclaimer: 'Evaluation requires verified historical ground-truth data.',
      maeMinutes: null,
      rmseMinutes: null,
      medianAbsoluteErrorMinutes: null,
      baselineVsDynamicImprovementPercent: null,
      sampleEvaluationRunsCount: records.length
    };
  }

  /**
   * Internal verification method (Requirement 9: Testability)
   * Verifies the calculation engine deterministically without displaying debug labels in the judge UI.
   */
  public static verifyCalculations(): {
    passed: boolean;
    testSamplesCount: number;
    testMedian: number;
    testP90: number | null;
    testVariability: DelayVariability;
  } {
    const testSet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const median = StatisticsCalculator.calculateMedian(testSet);
    const p90 = StatisticsCalculator.calculate90thPercentile(testSet);
    const avg = StatisticsCalculator.calculateAverage(testSet);
    const stdDev = StatisticsCalculator.calculateStandardDeviation(testSet, avg);
    const variability = StatisticsCalculator.deriveVariability(testSet, stdDev, median);

    const passed = median === 5.5 && p90 === 9.1 && testSet.length === 10;
    return {
      passed,
      testSamplesCount: testSet.length,
      testMedian: median,
      testP90: p90,
      testVariability: variability
    };
  }
}

export const historicalDelayService = HistoricalDelayService;
