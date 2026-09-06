/**
 * Historical Delay Intelligence Domain Models & Contracts
 * SIH Problem Statement 26028: Dynamic Arrival Time Prediction Engine
 *
 * DATA PROVENANCE MANDATE:
 * All historical records in this prototype represent TEST / SIMULATION records
 * generated from recorded simulation runs for route traversal validation.
 * They are NOT verified live Indian Railways telemetry or official IR records.
 */

export type DelayVariability = 'LOW' | 'MODERATE' | 'HIGH' | 'N/A';
export type TimeOfDayContext = 'MORNING_RUSH' | 'OFF_PEAK' | 'EVENING_PEAK' | 'NIGHT';
export type DayOfWeekContext = 'WEEKDAY' | 'WEEKEND';

/**
 * Individual Historical Record representing one recorded simulation run for a section or station.
 */
export interface HistoricalRecord {
  recordId: string;
  trainNumber: string;
  trainName: string;
  routeSection: string;               // e.g. "NDLS-GZB", "TDL-ETW", "MMCT-BVI"
  fromStationCode: string;
  toStationCode: string;
  stationCode?: string;               // Optional station-specific halt record
  observedDelayMinutes: number;       // Actual observed delay in minutes for this run
  runDate: string;                    // ISO date, e.g. "2026-08-14"
  contextIdentifier: string;          // Simulation run ID, e.g. "SIM-RUN-12004-20260814-01"
  timeOfDayContext: TimeOfDayContext;
  dayOfWeekContext: DayOfWeekContext;
  dataProvenance: 'TEST / SIMULATION';
}

/**
 * Calculated statistical summary for a route section, derived mathematically from raw HistoricalRecords.
 */
export interface CalculatedSectionStats {
  sectionKey: string;                 // e.g. "TDL-ETW"
  fromStationCode: string;
  toStationCode: string;
  sampleCount: number;                // Actual number of records evaluated
  minDelayMinutes: number;
  maxDelayMinutes: number;
  medianDelayMinutes: number;
  percentile90DelayMinutes: number | null; // Null if sample size < 4 (graceful handling)
  averageDelayMinutes: number;
  standardDeviationMinutes: number;
  variability: DelayVariability;
  delayTendencyLabel: string;         // e.g. "Low delay tendency", "Moderate delay tendency"
  dataProvenance: 'TEST / SIMULATION';
}

/**
 * Synthesized Historical Context supplied to Dynamic ETA Engine.
 * Calculated mathematically from historical records for the active train and route.
 */
export interface HistoricalContext {
  trainNumber: string;
  corridorName: string;
  totalHistoricalRuns: number;        // Total historical records evaluated
  sampleCount: number;                // Match alias for total runs
  overallMedianDelayMinutes: number | null;  // Calculated section median (null if unavailable)
  overallP90DelayMinutes: number | null; // Calculated section 90th percentile (null if unavailable or <4)
  overallMinDelayMinutes: number | null;
  overallMaxDelayMinutes: number | null;
  dominantVariability: DelayVariability;
  tendencySummary: string;            // e.g. "Moderate delay tendency" or "Unavailable for current section"
  dataProvenance: string;             // e.g. "TEST / SIMULATION" or "TEST / SIMULATION — No matching historical records"
  overallHistoricalDelayBiasMinutes: number; // Bounded, conservative contextual bias for Dynamic ETA
  sectionProfiles: CalculatedSectionStats[]; // Array for UI tables and lists
  sectionStatsMap: Record<string, CalculatedSectionStats>; // Map keyed by sectionKey for fast engine lookup
  explanationText: string;
  hasSufficientData: boolean;
  isCurrentSectionAvailable: boolean; // True if current active section has historical records
  currentSectionKey?: string;         // e.g. "BRC-RTM"
  currentSectionLabel?: string;       // e.g. "BRC → RTM"
  currentSectionStats?: CalculatedSectionStats;
}

/**
 * Model Evaluation Metrics Structure
 * Prepared for ground-truth comparison when historical ground-truth data becomes available.
 */
export interface HistoricalEvaluationSummary {
  trainNumber: string;
  hasGroundTruthData: boolean;
  evaluationDisclaimer: string;       // "Evaluation requires verified historical ground-truth data."
  maeMinutes: number | null;          // Mean Absolute Error
  rmseMinutes: number | null;         // Root Mean Square Error
  medianAbsoluteErrorMinutes: number | null;
  baselineVsDynamicImprovementPercent: number | null;
  sampleEvaluationRunsCount: number;
}

/**
 * Historical Data Provider Interface
 * Enables clean swappability between Test/Simulation data and future verified operational APIs.
 */
export interface IHistoricalDataProvider {
  providerId: string;
  providerName: string;
  dataProvenance: 'TEST / SIMULATION' | 'VERIFIED HISTORICAL DATA';
  isGroundTruthVerified: boolean;
  getRecordsForTrain(trainNumber: string): HistoricalRecord[];
  getRecordsForSection(trainNumber: string, fromStationCode: string, toStationCode: string): HistoricalRecord[];
}

