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
    const trainMap = this.scenarios.get(trainNumber);
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
    return this.scenarios.get(trainNumber)?.get(sectionKey);
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
    const trainMap = this.getOrCreateTrainMap(trainNumber);
    const existing = trainMap.get(sectionKey) || {
      sectionKey,
      fromStationCode,
      toStationCode
    };

    if (congestion === 'NORMAL' && !existing.speedRestrictionKmph && !existing.unscheduledStopMinutes && !existing.isTrackBlocked) {
      trainMap.delete(sectionKey);
    } else {
      existing.congestion = congestion;
      trainMap.set(sectionKey, existing);
    }

    this.notify(trainNumber);
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
    const trainMap = this.getOrCreateTrainMap(trainNumber);
    const existing = trainMap.get(sectionKey) || {
      sectionKey,
      fromStationCode,
      toStationCode
    };

    if (!speedKmph && (!existing.congestion || existing.congestion === 'NORMAL') && !existing.unscheduledStopMinutes && !existing.isTrackBlocked) {
      trainMap.delete(sectionKey);
    } else {
      existing.speedRestrictionKmph = speedKmph;
      trainMap.set(sectionKey, existing);
    }

    this.notify(trainNumber);
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
    const trainMap = this.getOrCreateTrainMap(trainNumber);
    const existing = trainMap.get(sectionKey) || {
      sectionKey,
      fromStationCode,
      toStationCode
    };

    if (!stopMinutes && (!existing.congestion || existing.congestion === 'NORMAL') && !existing.speedRestrictionKmph && !existing.isTrackBlocked) {
      trainMap.delete(sectionKey);
    } else {
      existing.unscheduledStopMinutes = stopMinutes;
      trainMap.set(sectionKey, existing);
    }

    this.notify(trainNumber);
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
    const trainMap = this.getOrCreateTrainMap(trainNumber);
    const existing = trainMap.get(sectionKey) || {
      sectionKey,
      fromStationCode,
      toStationCode
    };

    if (!isBlocked && (!existing.congestion || existing.congestion === 'NORMAL') && !existing.speedRestrictionKmph && !existing.unscheduledStopMinutes) {
      trainMap.delete(sectionKey);
    } else {
      existing.isTrackBlocked = isBlocked;
      existing.blockDelayMinutes = isBlocked ? blockDelayMinutes : undefined;
      trainMap.set(sectionKey, existing);
    }

    this.notify(trainNumber);
  }

  /**
   * Reset all scenarios for a specific train
   */
  public resetScenario(trainNumber: string): void {
    if (this.scenarios.has(trainNumber)) {
      this.scenarios.delete(trainNumber);
      this.notify(trainNumber);
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
    const trainMap = this.scenarios.get(trainNumber);
    if (!trainMap) return false;
    return trainMap.size > 0;
  }

  /**
   * Get total count of active scenario conditions for a train
   */
  public getActiveConditionCount(trainNumber: string): number {
    const trainMap = this.scenarios.get(trainNumber);
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

  private getOrCreateTrainMap(trainNumber: string): Map<string, SectionScenarioOverride> {
    let trainMap = this.scenarios.get(trainNumber);
    if (!trainMap) {
      trainMap = new Map();
      this.scenarios.set(trainNumber, trainMap);
    }
    return trainMap;
  }
}

export const operationalScenarioService = new OperationalScenarioServiceImpl();
