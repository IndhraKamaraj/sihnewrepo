/**
 * Operational Scenario Service
 * SIH Problem Statement 26028: Dynamic ETA Intelligence Engine
 *
 * Manages active operational stress conditions (Congestion, Speed Restrictions,
 * Unscheduled Stops, Track/Line Blocks) applied to train routes.
 *
 * Fully reactive: Notifies subscribers on condition change, enabling
 * instant Dynamic ETA recalculation and zero-reload UI updates.
 */

import {
  CongestionLevel,
  SectionScenarioOverride,
  TrainScenarioState
} from '../types/eta';

type ScenarioChangeListener = (trainNumber: string) => void;

class OperationalScenarioServiceImpl {
  // In-memory registry of active scenarios keyed by trainNumber
  private scenarios: Map<string, Map<string, SectionScenarioOverride>> = new Map();
  private listeners: Set<ScenarioChangeListener> = new Set();

  /**
   * Subscribe to scenario mutations
   */
  public subscribe(listener: ScenarioChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(trainNumber: string): void {
    this.listeners.forEach((fn) => {
      try {
        fn(trainNumber);
      } catch (err) {
        console.error('Error in scenario change listener:', err);
      }
    });
  }

  /**
   * Retrieve all section overrides for a train
   */
  public getScenarioForTrain(trainNumber: string): SectionScenarioOverride[] {
    const cleanNo = (trainNumber || '').trim();
    const trainMap = this.scenarios.get(cleanNo);
    if (!trainMap) return [];
    return Array.from(trainMap.values());
  }

  /**
   * Retrieve override for a specific section
   */
  public getSectionOverride(
    trainNumber: string,
    sectionKey: string
  ): SectionScenarioOverride | undefined {
    const cleanNo = (trainNumber || '').trim();
    const cleanKey = (sectionKey || '').trim().toUpperCase();
    return this.scenarios.get(cleanNo)?.get(cleanKey);
  }

  /**
   * Set Congestion for a section
   */
  public setSectionCongestion(
    trainNumber: string,
    sectionKey: string,
    fromStationCode: string,
    toStationCode: string,
    congestion: CongestionLevel
  ): void {
    const cleanNo = (trainNumber || '').trim();
    const cleanKey = (sectionKey || '').trim().toUpperCase();
    const cleanFrom = (fromStationCode || '').trim().toUpperCase();
    const cleanTo = (toStationCode || '').trim().toUpperCase();

    const trainMap = this.getOrCreateTrainMap(cleanNo);
    const existing = trainMap.get(cleanKey) || {
      sectionKey: cleanKey,
      fromStationCode: cleanFrom,
      toStationCode: cleanTo
    };

    if (congestion === 'NORMAL' && !existing.speedRestrictionKmph && !existing.unscheduledStopMinutes && !existing.isTrackBlocked) {
      trainMap.delete(cleanKey);
    } else {
      existing.congestion = congestion;
      existing.fromStationCode = cleanFrom;
      existing.toStationCode = cleanTo;
      trainMap.set(cleanKey, existing);
    }

    this.notify(cleanNo);
  }

  /**
   * Set Speed Restriction for a section (in km/h)
   */
  public setSpeedRestriction(
    trainNumber: string,
    sectionKey: string,
    fromStationCode: string,
    toStationCode: string,
    speedKmph?: number
  ): void {
    const cleanNo = (trainNumber || '').trim();
    const cleanKey = (sectionKey || '').trim().toUpperCase();
    const cleanFrom = (fromStationCode || '').trim().toUpperCase();
    const cleanTo = (toStationCode || '').trim().toUpperCase();

    const trainMap = this.getOrCreateTrainMap(cleanNo);
    const existing = trainMap.get(cleanKey) || {
      sectionKey: cleanKey,
      fromStationCode: cleanFrom,
      toStationCode: cleanTo
    };

    if (!speedKmph && (!existing.congestion || existing.congestion === 'NORMAL') && !existing.unscheduledStopMinutes && !existing.isTrackBlocked) {
      trainMap.delete(cleanKey);
    } else {
      existing.speedRestrictionKmph = speedKmph;
      existing.fromStationCode = cleanFrom;
      existing.toStationCode = cleanTo;
      trainMap.set(cleanKey, existing);
    }

    this.notify(cleanNo);
  }

  /**
   * Set Unscheduled Stop at a section/station (in minutes)
   */
  public setUnscheduledStop(
    trainNumber: string,
    sectionKey: string,
    fromStationCode: string,
    toStationCode: string,
    stopMinutes?: number
  ): void {
    const cleanNo = (trainNumber || '').trim();
    const cleanKey = (sectionKey || '').trim().toUpperCase();
    const cleanFrom = (fromStationCode || '').trim().toUpperCase();
    const cleanTo = (toStationCode || '').trim().toUpperCase();

    const trainMap = this.getOrCreateTrainMap(cleanNo);
    const existing = trainMap.get(cleanKey) || {
      sectionKey: cleanKey,
      fromStationCode: cleanFrom,
      toStationCode: cleanTo
    };

    if (!stopMinutes && (!existing.congestion || existing.congestion === 'NORMAL') && !existing.speedRestrictionKmph && !existing.isTrackBlocked) {
      trainMap.delete(cleanKey);
    } else {
      existing.unscheduledStopMinutes = stopMinutes;
      existing.fromStationCode = cleanFrom;
      existing.toStationCode = cleanTo;
      trainMap.set(cleanKey, existing);
    }

    this.notify(cleanNo);
  }

  /**
   * Set Track / Line Block on a section
   */
  public setTrackBlock(
    trainNumber: string,
    sectionKey: string,
    fromStationCode: string,
    toStationCode: string,
    isBlocked: boolean,
    blockDelayMinutes: number = 20
  ): void {
    const cleanNo = (trainNumber || '').trim();
    const cleanKey = (sectionKey || '').trim().toUpperCase();
    const cleanFrom = (fromStationCode || '').trim().toUpperCase();
    const cleanTo = (toStationCode || '').trim().toUpperCase();

    const trainMap = this.getOrCreateTrainMap(cleanNo);
    const existing = trainMap.get(cleanKey) || {
      sectionKey: cleanKey,
      fromStationCode: cleanFrom,
      toStationCode: cleanTo
    };

    if (!isBlocked && (!existing.congestion || existing.congestion === 'NORMAL') && !existing.speedRestrictionKmph && !existing.unscheduledStopMinutes) {
      trainMap.delete(cleanKey);
    } else {
      existing.isTrackBlocked = isBlocked;
      existing.blockDelayMinutes = isBlocked ? blockDelayMinutes : undefined;
      existing.fromStationCode = cleanFrom;
      existing.toStationCode = cleanTo;
      trainMap.set(cleanKey, existing);
    }

    this.notify(cleanNo);
  }

  /**
   * Reset all scenarios for a specific train
   */
  public resetScenario(trainNumber: string): void {
    const cleanNo = (trainNumber || '').trim();
    if (this.scenarios.has(cleanNo)) {
      this.scenarios.delete(cleanNo);
      this.notify(cleanNo);
    }
  }

  /**
   * Reset all scenarios across all trains
   */
  public resetAllScenarios(): void {
    const trainNumbers = Array.from(this.scenarios.keys());
    this.scenarios.clear();
    trainNumbers.forEach((t) => this.notify(t));
  }

  /**
   * Check if any active scenarios exist for a train
   */
  public hasActiveScenario(trainNumber: string): boolean {
    const cleanNo = (trainNumber || '').trim();
    const trainMap = this.scenarios.get(cleanNo);
    if (!trainMap) return false;
    return trainMap.size > 0;
  }

  /**
   * Get total count of active scenario conditions for a train
   */
  public getActiveConditionCount(trainNumber: string): number {
    const cleanNo = (trainNumber || '').trim();
    const trainMap = this.scenarios.get(cleanNo);
    if (!trainMap) return 0;
    let count = 0;
    trainMap.forEach((override) => {
      if (override.congestion && override.congestion !== 'NORMAL') count++;
      if (override.speedRestrictionKmph) count++;
      if (override.unscheduledStopMinutes && override.unscheduledStopMinutes > 0) count++;
      if (override.isTrackBlocked) count++;
    });
    return count;
  }

  /**
   * Get all active overrides across all trains in the fleet
   */
  public getAllActiveOverrides(): Array<{ trainNumber: string; overrides: SectionScenarioOverride[] }> {
    const results: Array<{ trainNumber: string; overrides: SectionScenarioOverride[] }> = [];
    this.scenarios.forEach((trainMap, trainNo) => {
      const activeOverrides = Array.from(trainMap.values()).filter((ov) => {
        return (
          (ov.congestion && ov.congestion !== 'NORMAL') ||
          (ov.speedRestrictionKmph && ov.speedRestrictionKmph > 0) ||
          (ov.unscheduledStopMinutes && ov.unscheduledStopMinutes > 0) ||
          ov.isTrackBlocked
        );
      });
      if (activeOverrides.length > 0) {
        results.push({ trainNumber: trainNo, overrides: activeOverrides });
      }
    });
    return results;
  }

  private getOrCreateTrainMap(trainNumber: string): Map<string, SectionScenarioOverride> {
    const cleanNo = (trainNumber || '').trim();
    let trainMap = this.scenarios.get(cleanNo);
    if (!trainMap) {
      trainMap = new Map();
      this.scenarios.set(cleanNo, trainMap);
    }
    return trainMap;
  }
}

export const operationalScenarioService = new OperationalScenarioServiceImpl();
