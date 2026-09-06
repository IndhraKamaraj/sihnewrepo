/**
 * Railway Data Service Abstraction Layer
 * SIH Problem Statement 26028: Dynamic ETA Intelligence System
 *
 * ARCHITECTURAL CONTRACT:
 * The UI consumes data exclusively through this service contract rather than
 * importing mock arrays directly into components.
 *
 * Pipeline Evolution:
 * Step 01: PrototypeRailwayDataService (Offline operational snapshot dataset)
 * Step 02+: LiveRailwayDataService (REST/WebSocket connection to IR NTES/FOIS/COIS API)
 *           + Dynamic ETA Engine integration pipe.
 */

import {
  Train,
  NetworkStatus,
  TrainFilterOptions,
  DataProvenance,
  TrainStatus,
  ReplayState
} from '../types/train';
import { DynamicETAPrediction } from '../types/eta';
import { DynamicETAEngine } from './DynamicETAEngine';
import { operationalScenarioService } from './OperationalScenarioService';
import {
  PROTOTYPE_TRAINS,
  PROTOTYPE_NETWORK_STATUS,
  PROTOTYPE_KEY_STATIONS
} from '../data/prototypeTrains';

export interface RouteWaypoint {
  waypointIndex: number;
  stopIndex: number;
  type: 'STATION_HALT' | 'DEPARTING' | 'CRUISING' | 'APPROACHING' | 'TERMINUS';
  stationCode?: string;
  stationName?: string;
  distanceFromSourceKm: number;
  speedKmph: number;
  delayMinutes: number;
  locationDescription: string;
  nextStationCode: string;
  nextStationName: string;
  signalAspect: 'GREEN' | 'DOUBLE_YELLOW' | 'YELLOW' | 'RED';
  sectionBlock: string;
  status: TrainStatus;
}

export interface StationOperationalView {
  stationCode: string;
  stationName: string;
  zone: string;
  platforms: number;
  trackThroughputPercent: number;
  approachingTrains: {
    trainNumber: string;
    trainName: string;
    scheduledArrival: string;
    expectedArrival: string;
    delayMinutes: number;
    platform?: string;
    distanceAwayKm: number;
    speedKmph: number;
    status: string;
  }[];
  departingTrains: {
    trainNumber: string;
    trainName: string;
    scheduledDeparture: string;
    status: string;
    platform?: string;
  }[];
}

export interface IRailwayDataService {
  getAllTrains(): Promise<Train[]>;
  getAllTrainsSync(): Train[];
  getTrainByNumber(trainNumber: string): Promise<Train | null>;
  getTrainByNumberSync(trainNumber: string): Train | null;
  getNetworkStatus(): Promise<NetworkStatus>;
  getNetworkStatusSync(): NetworkStatus;
  searchAndFilterTrains(options: TrainFilterOptions): Promise<Train[]>;
  getStationOperationalView(stationCode: string): Promise<StationOperationalView | null>;
  getAllStations(): Promise<typeof PROTOTYPE_KEY_STATIONS>;
  getServiceDataSourceMetadata(): {
    name: string;
    version: string;
    feedType: string;
    isLive: boolean;
    disclaimer: string;
  };

  // Centralized State & Replay / Route Progression Engine (Step 02)
  subscribe(listener: () => void): () => void;
  getWaypointsForTrain(trainNumber: string): RouteWaypoint[];
  getReplayState(trainNumber: string): ReplayState;
  stepTrainForward(trainNumber: string): boolean;
  stepTrainBackward(trainNumber: string): boolean;
  playReplay(trainNumber: string): void;
  pauseReplay(trainNumber?: string): void;
  resetTrainToOrigin(trainNumber: string): void;
  resetTrainToBaseline(trainNumber: string): void;
  resetAllTrainsToBaseline(): void;
  setReplaySpeed(trainNumber: string, speedMultiplier: number): void;
  jumpToWaypoint(trainNumber: string, waypointIndex: number): void;
  jumpToStation(trainNumber: string, stationCode: string): void;
}

class PrototypeRailwayDataService implements IRailwayDataService {
  // Baseline immutable clone of initial snapshot
  private readonly baselineTrains: Train[];
  // Central mutable active trains store
  private trains: Train[];
  private networkStatus: NetworkStatus;

  // Cached route waypoints per train
  private waypointCache: Map<string, RouteWaypoint[]> = new Map();

  // Active replay controller state per train
  private replayStates: Map<
    string,
    {
      isPlaying: boolean;
      speedMultiplier: number;
      currentWaypointIndex: number;
      isReplayActive: boolean;
      timerId: ReturnType<typeof setInterval> | null;
    }
  > = new Map();

  // Reactive listener registry
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Deep clone baseline data
    this.baselineTrains = JSON.parse(JSON.stringify(PROTOTYPE_TRAINS));
    this.trains = JSON.parse(JSON.stringify(PROTOTYPE_TRAINS));
    this.networkStatus = { ...PROTOTYPE_NETWORK_STATUS };

    // Pre-build waypoints and align initial waypoint indices
    for (const train of this.trains) {
      const waypoints = this.buildWaypointsForTrain(train);
      this.waypointCache.set(train.trainNumber, waypoints);

      // Find waypoint closest to initial snapshot distance
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < waypoints.length; i++) {
        const diff = Math.abs(waypoints[i].distanceFromSourceKm - train.position.distanceTravelledKm);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }

      this.replayStates.set(train.trainNumber, {
        isPlaying: false,
        speedMultiplier: 1,
        currentWaypointIndex: closestIdx,
        isReplayActive: false,
        timerId: null
      });

      // Initialize Dynamic ETA Prediction contract
      try {
        const pred = DynamicETAEngine.predict(train);
        train.futurePredictionContract = {
          predictedArrival: pred.dynamicDestinationETA,
          predictedDelayMinutes: pred.predictedDelayMinutes,
          delayCauseCategory: pred.etaTrendLabel,
          sectionCongestionLevel:
            pred.etaStatus === 'SIGNIFICANT_DELAY'
              ? 'SEVERE'
              : pred.etaStatus === 'MINOR_DELAY'
              ? 'MODERATE'
              : 'LOW',
          historicalSectionSpeedAvgKmph: Math.round(
            pred.sections.reduce((acc, s) => acc + s.effectiveSpeedKmph, 0) /
              Math.max(1, pred.sections.length)
          )
        };
      } catch (err) {
        console.error('Initial ETA prediction error for train:', train.trainNumber, err);
      }
    }

    // Subscribe to operational scenario changes to trigger instant Dynamic ETA recalculation and operational hold check
    operationalScenarioService.subscribe((trainNumber) => {
      this.handleOperationalScenarioChange(trainNumber);
    });
  }

  /**
   * Retrieves active track block override for a given train, if any
   */
  public getActiveTrackBlock(trainNumber: string) {
    const cleanNo = trainNumber.trim();
    const overrides = operationalScenarioService.getScenarioForTrain(cleanNo);
    return overrides.find((ov) => ov.isTrackBlocked) || null;
  }

  /**
   * Synchronizes operational hold state when operational scenarios are applied or cleared
   */
  public syncOperationalHoldState(trainNumber: string): void {
    const cleanNo = trainNumber.trim();
    const train = this.trains.find((t) => t.trainNumber === cleanNo);
    if (!train) return;

    const activeBlock = this.getActiveTrackBlock(cleanNo);
    const waypoints = this.getWaypointsForTrain(cleanNo);
    const state = this.replayStates.get(cleanNo);
    const currentWp = state && waypoints[state.currentWaypointIndex] ? waypoints[state.currentWaypointIndex] : null;

    if (activeBlock) {
      const fromStop = train.route.find((s) => s.stationCode === activeBlock.fromStationCode);
      const toStop = train.route.find((s) => s.stationCode === activeBlock.toStationCode);
      if (fromStop && toStop) {
        const currentDist = train.position.distanceTravelledKm;

        if (currentDist >= fromStop.distanceFromSourceKm && currentDist < toStop.distanceFromSourceKm) {
          // Inside or at the threshold of the blocked section: enter HOLD
          train.status = 'HOLD';
          train.position.speedKmph = 0;
          train.position.signalAspect = 'RED';
          train.position.operationalBlockStatus = 'HOLD';
          train.position.operationalHoldReason = `Train held due to active track block on ${fromStop.stationCode} → ${toStop.stationCode}.`;
          train.position.currentLocationDescription = `Held at ${train.position.currentStationCode || fromStop.stationName} (${fromStop.stationCode}) due to active track block on ${fromStop.stationCode} → ${toStop.stationCode}.`;

          if (state && state.isPlaying) {
            this.pauseReplay(cleanNo);
          }
          return;
        } else if (currentDist < fromStop.distanceFromSourceKm) {
          train.position.operationalBlockStatus = 'BLOCKED';
          train.position.operationalHoldReason = `Track block active on upcoming section ${fromStop.stationCode} → ${toStop.stationCode}. Train will hold upon arrival.`;
          // If train was previously held but is now before the section (e.g. stepped back), restore normal status
          if (train.status === 'HOLD' && currentWp) {
            train.status = currentWp.status;
            train.position.speedKmph = currentWp.speedKmph;
            train.position.signalAspect = currentWp.signalAspect;
            train.position.currentLocationDescription = currentWp.locationDescription;
          }
          return;
        }
      }
    }

    // Block cleared or train already passed beyond the block: restore normal state
    train.position.operationalBlockStatus = 'NORMAL';
    train.position.operationalHoldReason = undefined;
    if (train.status === 'HOLD' && currentWp) {
      train.status = currentWp.status;
      train.position.speedKmph = currentWp.speedKmph;
      train.position.signalAspect = currentWp.signalAspect;
      train.position.currentLocationDescription = currentWp.locationDescription;
    }
  }

  /**
   * Responds to operational scenario changes (injection/clearing of blocks, restrictions, etc.)
   */
  public handleOperationalScenarioChange(trainNumber: string): void {
    const cleanNo = trainNumber.trim();
    this.syncOperationalHoldState(cleanNo);
    this.recalculateTrainPrediction(cleanNo);
  }

  /**
   * Recalculates Dynamic ETA prediction contract for a train when operational conditions change
   */
  public recalculateTrainPrediction(trainNumber: string): void {
    const cleanNo = trainNumber.trim();
    const train = this.trains.find((t) => t.trainNumber === cleanNo);
    if (!train) return;
    try {
      const pred = DynamicETAEngine.predict(train);
      train.futurePredictionContract = {
        predictedArrival: pred.dynamicDestinationETA,
        predictedDelayMinutes: pred.predictedDelayMinutes,
        delayCauseCategory: pred.etaTrendLabel,
        sectionCongestionLevel:
          pred.etaStatus === 'SIGNIFICANT_DELAY'
            ? 'SEVERE'
            : pred.etaStatus === 'MINOR_DELAY'
            ? 'MODERATE'
            : 'LOW',
        historicalSectionSpeedAvgKmph: Math.round(
          pred.sections.reduce((acc, s) => acc + s.effectiveSpeedKmph, 0) /
            Math.max(1, pred.sections.length)
        )
      };
    } catch (err) {
      console.error('Dynamic ETA recalculation error for train:', train.trainNumber, err);
    }
    this.notifyListeners();
  }

  // =========================================================================
  // REACTIVE LISTENER SUBSCRIPTIONS
  // =========================================================================
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('RailwayDataService listener error:', err);
      }
    });
  }

  // =========================================================================
  // WAYPOINT GENERATOR FOR ROUTE PROGRESSION
  // =========================================================================
  public getWaypointsForTrain(trainNumber: string): RouteWaypoint[] {
    const cleanNo = trainNumber.trim();
    if (this.waypointCache.has(cleanNo)) {
      return this.waypointCache.get(cleanNo)!;
    }
    const train = this.trains.find((t) => t.trainNumber === cleanNo);
    if (!train) return [];
    const waypoints = this.buildWaypointsForTrain(train);
    this.waypointCache.set(cleanNo, waypoints);
    return waypoints;
  }

  private buildWaypointsForTrain(train: Train): RouteWaypoint[] {
    const waypoints: RouteWaypoint[] = [];
    const stops = train.route;
    if (!stops || stops.length === 0) return [];

    let wpIdx = 0;

    // 1. Origin Station Start Waypoint
    waypoints.push({
      waypointIndex: wpIdx++,
      stopIndex: 0,
      type: 'STATION_HALT',
      stationCode: stops[0].stationCode,
      stationName: stops[0].stationName,
      distanceFromSourceKm: 0,
      speedKmph: 0,
      delayMinutes: 0,
      locationDescription: `Halted at origin ${stops[0].stationName} (${stops[0].platform || 'PF 1'}). Ready for departure.`,
      nextStationCode: stops[1]?.stationCode || stops[0].stationCode,
      nextStationName: stops[1]?.stationName || stops[0].stationName,
      signalAspect: 'DOUBLE_YELLOW',
      sectionBlock: `${stops[0].stationCode} Starter Signal & Platform 1`,
      status: 'SCHEDULED'
    });

    // 2. Inter-station legs & intermediate halts
    for (let i = 0; i < stops.length - 1; i++) {
      const fromStop = stops[i];
      const toStop = stops[i + 1];
      const legDist = Math.max(1, toStop.distanceFromSourceKm - fromStop.distanceFromSourceKm);

      if (legDist <= 40) {
        // Short suburban/terminal sector
        const d1 = Math.round(fromStop.distanceFromSourceKm + 0.45 * legDist);
        waypoints.push({
          waypointIndex: wpIdx++,
          stopIndex: i,
          type: 'DEPARTING',
          distanceFromSourceKm: d1,
          speedKmph: 75,
          delayMinutes: (i * 2) % 6,
          locationDescription: `Departed ${fromStop.stationName}, suburban transit · ${toStop.distanceFromSourceKm - d1} km to ${toStop.stationName}`,
          nextStationCode: toStop.stationCode,
          nextStationName: toStop.stationName,
          signalAspect: 'GREEN',
          sectionBlock: `${fromStop.stationCode}-${toStop.stationCode} Suburban Auto Block`,
          status: 'RUNNING'
        });

        const d2 = Math.round(fromStop.distanceFromSourceKm + 0.88 * legDist);
        waypoints.push({
          waypointIndex: wpIdx++,
          stopIndex: i,
          type: 'APPROACHING',
          distanceFromSourceKm: d2,
          speedKmph: 45,
          delayMinutes: (i * 2) % 6,
          locationDescription: `Approaching outer signals of ${toStop.stationName} · ${toStop.distanceFromSourceKm - d2} km to platform`,
          nextStationCode: toStop.stationCode,
          nextStationName: toStop.stationName,
          signalAspect: 'DOUBLE_YELLOW',
          sectionBlock: `${toStop.stationCode} Outer Approach Block`,
          status: 'RUNNING'
        });
      } else {
        // Main line inter-city sector
        // Stage 1: Accelerating out of station
        const d1 = Math.round(fromStop.distanceFromSourceKm + 0.18 * legDist);
        waypoints.push({
          waypointIndex: wpIdx++,
          stopIndex: i,
          type: 'DEPARTING',
          distanceFromSourceKm: d1,
          speedKmph: Math.min(105, train.trainType === 'VANDE_BHARAT' ? 120 : 95),
          delayMinutes: (i * 2) % 8,
          locationDescription: `Departed ${fromStop.stationName}, accelerating onto main line · ${toStop.distanceFromSourceKm - d1} km to ${toStop.stationName}`,
          nextStationCode: toStop.stationCode,
          nextStationName: toStop.stationName,
          signalAspect: 'GREEN',
          sectionBlock: `${fromStop.stationCode}-${toStop.stationCode} Main Line Up Section`,
          status: 'RUNNING'
        });

        // Stage 2: Full line speed cruising
        const d2 = Math.round(fromStop.distanceFromSourceKm + 0.58 * legDist);
        waypoints.push({
          waypointIndex: wpIdx++,
          stopIndex: i,
          type: 'CRUISING',
          distanceFromSourceKm: d2,
          speedKmph: train.trainType === 'VANDE_BHARAT' ? 130 : 118,
          delayMinutes: Math.max(0, ((i * 2) % 8) - 1),
          locationDescription: `Cruising inter-station corridor at permissible speed · ${toStop.distanceFromSourceKm - d2} km to ${toStop.stationName}`,
          nextStationCode: toStop.stationCode,
          nextStationName: toStop.stationName,
          signalAspect: 'GREEN',
          sectionBlock: `${fromStop.stationCode}-${toStop.stationCode} Automatic Quad Section`,
          status: 'RUNNING'
        });

        // Stage 3: Decelerating on entry approach
        const d3 = Math.round(fromStop.distanceFromSourceKm + 0.90 * legDist);
        waypoints.push({
          waypointIndex: wpIdx++,
          stopIndex: i,
          type: 'APPROACHING',
          distanceFromSourceKm: d3,
          speedKmph: 52,
          delayMinutes: (i * 2) % 8,
          locationDescription: `Decelerating on home signal approach of ${toStop.stationName} · ${toStop.distanceFromSourceKm - d3} km to entry`,
          nextStationCode: toStop.stationCode,
          nextStationName: toStop.stationName,
          signalAspect: 'DOUBLE_YELLOW',
          sectionBlock: `${toStop.stationCode} Home Signal & Yard Approach`,
          status: 'APPROACHING'
        });
      }

      // Station Arrival / Halt (if not terminus)
      if (i + 1 < stops.length - 1) {
        waypoints.push({
          waypointIndex: wpIdx++,
          stopIndex: i + 1,
          type: 'STATION_HALT',
          stationCode: toStop.stationCode,
          stationName: toStop.stationName,
          distanceFromSourceKm: toStop.distanceFromSourceKm,
          speedKmph: 0,
          delayMinutes: (i * 2 + 1) % 8,
          locationDescription: `Halted at ${toStop.stationName} (${toStop.platform || 'PF 1'}) · Scheduled Halt: ${toStop.haltMinutes}m`,
          nextStationCode: stops[i + 2].stationCode,
          nextStationName: stops[i + 2].stationName,
          signalAspect: 'RED',
          sectionBlock: `${toStop.stationCode} Platform Track Circuit`,
          status: 'RUNNING'
        });
      }
    }

    // 3. Final Destination Terminus Waypoint
    const finalStop = stops[stops.length - 1];
    waypoints.push({
      waypointIndex: wpIdx++,
      stopIndex: stops.length - 1,
      type: 'TERMINUS',
      stationCode: finalStop.stationCode,
      stationName: finalStop.stationName,
      distanceFromSourceKm: train.totalDistanceKm,
      speedKmph: 0,
      delayMinutes: 0,
      locationDescription: `Arrived at Terminus ${finalStop.stationName} (${finalStop.platform || 'PF 1'}). Journey Completed.`,
      nextStationCode: finalStop.stationCode,
      nextStationName: `${finalStop.stationName} (Terminated)`,
      signalAspect: 'RED',
      sectionBlock: `${finalStop.stationCode} Buffer Stop / Yard`,
      status: 'TERMINATED'
    });

    return waypoints;
  }

  // =========================================================================
  // APPLY WAYPOINT TO CENTRALIZED TRAIN STATE
  // =========================================================================
  private applyWaypointToTrain(trainNumber: string, waypoint: RouteWaypoint, isReplay = true) {
    const cleanNo = trainNumber.trim();
    const train = this.trains.find((t) => t.trainNumber === cleanNo);
    if (!train) return;

    // 1. Update dynamic position telemetry
    train.position.distanceTravelledKm = waypoint.distanceFromSourceKm;
    train.position.distanceRemainingKm = Math.max(0, train.totalDistanceKm - waypoint.distanceFromSourceKm);
    train.position.speedKmph = waypoint.speedKmph;
    train.position.currentDelayMinutes = waypoint.delayMinutes;
    train.position.currentLocationDescription = waypoint.locationDescription;
    train.position.nextStationCode = waypoint.nextStationCode;
    train.position.nextStationName = waypoint.nextStationName;
    train.position.currentStationCode = waypoint.stationCode;
    train.position.currentStationName = waypoint.stationName;
    train.position.signalAspect = waypoint.signalAspect;
    train.position.sectionBlock = waypoint.sectionBlock;
    train.position.lastUpdatedTimestamp = new Date().toISOString();
    train.status = waypoint.status;

    // Check if active track block holds the train at this waypoint
    const activeBlock = this.getActiveTrackBlock(cleanNo);
    if (activeBlock) {
      const fromStop = train.route.find((s) => s.stationCode === activeBlock.fromStationCode);
      const toStop = train.route.find((s) => s.stationCode === activeBlock.toStationCode);
      if (fromStop && toStop) {
        const d = waypoint.distanceFromSourceKm;
        if (d >= fromStop.distanceFromSourceKm && d < toStop.distanceFromSourceKm) {
          train.status = 'HOLD';
          train.position.speedKmph = 0;
          train.position.signalAspect = 'RED';
          train.position.operationalBlockStatus = 'HOLD';
          train.position.operationalHoldReason = `Train held due to active track block on ${fromStop.stationCode} → ${toStop.stationCode}.`;
          train.position.currentLocationDescription = `Held at ${waypoint.stationCode || fromStop.stationName} (${fromStop.stationCode}) due to active track block on ${fromStop.stationCode} → ${toStop.stationCode}.`;
        } else if (d < fromStop.distanceFromSourceKm) {
          train.position.operationalBlockStatus = 'BLOCKED';
          train.position.operationalHoldReason = `Track block active on upcoming section ${fromStop.stationCode} → ${toStop.stationCode}. Train will hold upon arrival.`;
        } else {
          train.position.operationalBlockStatus = 'NORMAL';
          train.position.operationalHoldReason = undefined;
        }
      }
    } else {
      train.position.operationalBlockStatus = 'NORMAL';
      train.position.operationalHoldReason = undefined;
    }

    // 2. Update Route Stops progression states
    for (let i = 0; i < train.route.length; i++) {
      const stop = train.route[i];
      if (waypoint.distanceFromSourceKm > stop.distanceFromSourceKm) {
        stop.status = 'COMPLETED';
        if (!stop.actualOrCurrentArrival || stop.actualOrCurrentArrival.includes('Est')) {
          stop.actualOrCurrentArrival = stop.scheduledArrival;
        }
        if (!stop.actualOrCurrentDeparture || stop.actualOrCurrentDeparture.includes('Est')) {
          stop.actualOrCurrentDeparture = stop.scheduledDeparture;
        }
      } else if (waypoint.distanceFromSourceKm === stop.distanceFromSourceKm) {
        if (i === train.route.length - 1) {
          stop.status = 'COMPLETED';
        } else {
          stop.status = 'CURRENT';
        }
      } else if (stop.stationCode === waypoint.nextStationCode) {
        stop.status = 'NEXT';
      } else {
        stop.status = i === train.route.length - 1 ? 'TERMINUS' : 'UPCOMING';
      }
    }

    // 3. Clear Data Provenance stamp
    if (isReplay) {
      const nowIST = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      train.provenance = {
        sourceName: 'REPLAY / TEST MODE (Route Progression Simulator)',
        feedType: 'REPLAY_TEST_FEED',
        isLiveFeed: false,
        snapshotTimestamp: `${nowIST} IST (Replay Active)`,
        dataAccuracyDisclaimer:
          'REPLAY / TEST MODE: Operational telemetry generated via route progression replay simulation. Not live railway data.',
        recordIdentifier: `REPLAY-SIM-${train.trainNumber}`
      };
    }

    // 4. Update Dynamic ETA Prediction Contract on state change
    try {
      const pred = DynamicETAEngine.predict(train);
      train.futurePredictionContract = {
        predictedArrival: pred.dynamicDestinationETA,
        predictedDelayMinutes: pred.predictedDelayMinutes,
        delayCauseCategory: pred.etaTrendLabel,
        sectionCongestionLevel:
          pred.etaStatus === 'SIGNIFICANT_DELAY'
            ? 'SEVERE'
            : pred.etaStatus === 'MINOR_DELAY'
            ? 'MODERATE'
            : 'LOW',
        historicalSectionSpeedAvgKmph: Math.round(
          pred.sections.reduce((acc, s) => acc + s.effectiveSpeedKmph, 0) /
            Math.max(1, pred.sections.length)
        )
      };
    } catch (err) {
      console.error('Dynamic ETA recalculation error for train:', train.trainNumber, err);
    }

    this.notifyListeners();
  }

  // =========================================================================
  // DYNAMIC ETA ENGINE ACCESSOR
  // =========================================================================
  public getDynamicETAPrediction(trainNumber: string): DynamicETAPrediction | null {
    const cleanNo = trainNumber.trim();
    const train = this.trains.find((t) => t.trainNumber === cleanNo);
    if (!train) return null;
    return DynamicETAEngine.predict(train);
  }

  // =========================================================================
  // REPLAY & TEST MODE CONTROLS
  // =========================================================================
  public getReplayState(trainNumber: string): ReplayState {
    const cleanNo = trainNumber.trim();
    const waypoints = this.getWaypointsForTrain(cleanNo);
    const state = this.replayStates.get(cleanNo) || {
      isPlaying: false,
      speedMultiplier: 1,
      currentWaypointIndex: 0,
      isReplayActive: false,
      timerId: null
    };

    const activeBlock = this.getActiveTrackBlock(cleanNo);
    const train = this.trains.find((t) => t.trainNumber === cleanNo);
    const isTrainHeld = train?.status === 'HOLD' || train?.position.operationalBlockStatus === 'HOLD';
    const operationalHoldReason = train?.position.operationalHoldReason;
    const activeBlockedSection = activeBlock ? `${activeBlock.fromStationCode} → ${activeBlock.toStationCode}` : undefined;

    return {
      activeTrainNumber: cleanNo,
      isPlaying: state.isPlaying,
      speedMultiplier: state.speedMultiplier,
      currentWaypointIndex: state.currentWaypointIndex,
      totalWaypoints: waypoints.length,
      isReplayActive: state.isReplayActive,
      modeLabel: state.isReplayActive ? 'REPLAY / TEST MODE' : 'VERIFIED',
      lastTickTimestamp: new Date().toISOString(),
      isTrainHeld,
      operationalHoldReason,
      activeBlockedSection
    };
  }

  public stepTrainForward(trainNumber: string): boolean {
    const cleanNo = trainNumber.trim();
    const train = this.trains.find((t) => t.trainNumber === cleanNo);
    const waypoints = this.getWaypointsForTrain(cleanNo);
    const state = this.replayStates.get(cleanNo);
    if (!train || !state || waypoints.length === 0) return false;

    // Check if there is an active track block affecting forward progression
    const activeBlock = this.getActiveTrackBlock(cleanNo);
    if (activeBlock) {
      const fromStop = train.route.find((s) => s.stationCode === activeBlock.fromStationCode);
      const toStop = train.route.find((s) => s.stationCode === activeBlock.toStationCode);
      if (fromStop && toStop) {
        const currentDist = train.position.distanceTravelledKm;

        // Condition 1: Already inside or at entrance of blocked section -> CANNOT ADVANCE FORWARD!
        if (currentDist >= fromStop.distanceFromSourceKm && currentDist < toStop.distanceFromSourceKm) {
          train.status = 'HOLD';
          train.position.speedKmph = 0;
          train.position.signalAspect = 'RED';
          train.position.operationalBlockStatus = 'HOLD';
          train.position.operationalHoldReason = `Train held due to active track block on ${fromStop.stationCode} → ${toStop.stationCode}.`;
          train.position.currentLocationDescription = `Held at ${train.position.currentStationCode || fromStop.stationName} (${fromStop.stationCode}) due to active track block on ${fromStop.stationCode} → ${toStop.stationCode}.`;
          if (state.isPlaying) {
            this.pauseReplay(cleanNo);
          }
          this.recalculateTrainPrediction(cleanNo);
          this.notifyListeners();
          return false;
        }

        // Condition 2: Upcoming step would enter or cross fromStop
        if (state.currentWaypointIndex < waypoints.length - 1) {
          const nextWp = waypoints[state.currentWaypointIndex + 1];
          if (nextWp.distanceFromSourceKm >= fromStop.distanceFromSourceKm && currentDist < fromStop.distanceFromSourceKm) {
            // Find if there is an exact waypoint at fromStop boundary
            const boundaryIdx = waypoints.findIndex(
              (wp) => wp.stationCode === fromStop.stationCode && (wp.type === 'STATION_HALT' || wp.distanceFromSourceKm === fromStop.distanceFromSourceKm)
            );

            if (boundaryIdx !== -1 && boundaryIdx > state.currentWaypointIndex) {
              state.currentWaypointIndex = boundaryIdx;
              state.isReplayActive = true;
              this.applyWaypointToTrain(cleanNo, waypoints[boundaryIdx], true);
            }

            // Train has reached the block entrance: enter HOLD!
            train.status = 'HOLD';
            train.position.speedKmph = 0;
            train.position.signalAspect = 'RED';
            train.position.operationalBlockStatus = 'HOLD';
            train.position.operationalHoldReason = `Train held due to active track block on ${fromStop.stationCode} → ${toStop.stationCode}.`;
            train.position.currentLocationDescription = `Held at ${fromStop.stationName} (${fromStop.stationCode}) due to active track block on ${fromStop.stationCode} → ${toStop.stationCode}.`;
            if (state.isPlaying) {
              this.pauseReplay(cleanNo);
            }
            this.recalculateTrainPrediction(cleanNo);
            this.notifyListeners();
            return false;
          }
        }
      }
    }

    if (state.currentWaypointIndex < waypoints.length - 1) {
      state.currentWaypointIndex++;
      state.isReplayActive = true;
      this.applyWaypointToTrain(cleanNo, waypoints[state.currentWaypointIndex], true);
      return true;
    } else {
      // Reached the end
      if (state.isPlaying) {
        this.pauseReplay(cleanNo);
      }
      return false;
    }
  }

  public stepTrainBackward(trainNumber: string): boolean {
    const cleanNo = trainNumber.trim();
    const waypoints = this.getWaypointsForTrain(cleanNo);
    const state = this.replayStates.get(cleanNo);
    if (!state || waypoints.length === 0) return false;

    if (state.currentWaypointIndex > 0) {
      state.currentWaypointIndex--;
      state.isReplayActive = true;
      this.applyWaypointToTrain(cleanNo, waypoints[state.currentWaypointIndex], true);
      return true;
    }
    return false;
  }

  public playReplay(trainNumber: string): void {
    const cleanNo = trainNumber.trim();
    const train = this.trains.find((t) => t.trainNumber === cleanNo);
    const waypoints = this.getWaypointsForTrain(cleanNo);
    const state = this.replayStates.get(cleanNo);
    if (!state || waypoints.length === 0) return;

    // If train is in HOLD due to active track block, do not initiate playback
    if (train && (train.status === 'HOLD' || train.position.operationalBlockStatus === 'HOLD')) {
      state.isPlaying = false;
      this.notifyListeners();
      return;
    }

    // If at end, loop back to origin first
    if (state.currentWaypointIndex >= waypoints.length - 1) {
      state.currentWaypointIndex = 0;
      this.applyWaypointToTrain(cleanNo, waypoints[0], true);
    }

    if (state.timerId) {
      clearInterval(state.timerId);
    }

    state.isPlaying = true;
    state.isReplayActive = true;

    const intervalMs = Math.max(250, Math.round(2500 / state.speedMultiplier));
    state.timerId = setInterval(() => {
      const advanced = this.stepTrainForward(cleanNo);
      if (!advanced) {
        this.pauseReplay(cleanNo);
      }
    }, intervalMs);

    this.notifyListeners();
  }

  public pauseReplay(trainNumber?: string): void {
    if (trainNumber) {
      const cleanNo = trainNumber.trim();
      const state = this.replayStates.get(cleanNo);
      if (state && state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
        state.isPlaying = false;
      }
    } else {
      // Pause all running replay timers
      this.replayStates.forEach((state) => {
        if (state.timerId) {
          clearInterval(state.timerId);
          state.timerId = null;
          state.isPlaying = false;
        }
      });
    }
    this.notifyListeners();
  }

  public resetTrainToOrigin(trainNumber: string): void {
    const cleanNo = trainNumber.trim();
    this.pauseReplay(cleanNo);
    const waypoints = this.getWaypointsForTrain(cleanNo);
    const state = this.replayStates.get(cleanNo);
    if (!state || waypoints.length === 0) return;

    state.currentWaypointIndex = 0;
    state.isReplayActive = true;
    this.applyWaypointToTrain(cleanNo, waypoints[0], true);
  }

  public resetTrainToBaseline(trainNumber: string): void {
    const cleanNo = trainNumber.trim();
    this.pauseReplay(cleanNo);

    // Find baseline copy
    const baseline = this.baselineTrains.find((t) => t.trainNumber === cleanNo);
    const targetIdx = this.trains.findIndex((t) => t.trainNumber === cleanNo);
    if (!baseline || targetIdx === -1) return;

    // Restore deep copy of baseline train
    this.trains[targetIdx] = JSON.parse(JSON.stringify(baseline));

    // Reset waypoint index to baseline distance
    const waypoints = this.getWaypointsForTrain(cleanNo);
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < waypoints.length; i++) {
      const diff = Math.abs(waypoints[i].distanceFromSourceKm - baseline.position.distanceTravelledKm);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    const state = this.replayStates.get(cleanNo);
    if (state) {
      state.currentWaypointIndex = closestIdx;
      state.isReplayActive = false;
      state.isPlaying = false;
    }

    // Clear active operational stress scenarios for this train
    operationalScenarioService.resetScenario(cleanNo);
    this.recalculateTrainPrediction(cleanNo);

    this.notifyListeners();
  }

  public resetAllTrainsToBaseline(): void {
    this.pauseReplay();
    // Clear all active operational scenarios across the fleet
    operationalScenarioService.resetAllScenarios();

    this.trains = JSON.parse(JSON.stringify(this.baselineTrains));
    for (const train of this.trains) {
      const waypoints = this.getWaypointsForTrain(train.trainNumber);
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < waypoints.length; i++) {
        const diff = Math.abs(waypoints[i].distanceFromSourceKm - train.position.distanceTravelledKm);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }

      const state = this.replayStates.get(train.trainNumber);
      if (state) {
        state.currentWaypointIndex = closestIdx;
        state.isReplayActive = false;
        state.isPlaying = false;
      }
      this.recalculateTrainPrediction(train.trainNumber);
    }
    this.notifyListeners();
  }

  public setReplaySpeed(trainNumber: string, speedMultiplier: number): void {
    const cleanNo = trainNumber.trim();
    const state = this.replayStates.get(cleanNo);
    if (!state) return;

    state.speedMultiplier = speedMultiplier;

    // If already playing, restart interval with new speed
    if (state.isPlaying) {
      if (state.timerId) clearInterval(state.timerId);
      const intervalMs = Math.max(250, Math.round(2500 / speedMultiplier));
      state.timerId = setInterval(() => {
        const advanced = this.stepTrainForward(cleanNo);
        if (!advanced) {
          this.pauseReplay(cleanNo);
        }
      }, intervalMs);
    }

    this.notifyListeners();
  }

  public jumpToWaypoint(trainNumber: string, waypointIndex: number): void {
    const cleanNo = trainNumber.trim();
    const waypoints = this.getWaypointsForTrain(cleanNo);
    const state = this.replayStates.get(cleanNo);
    if (!state || waypointIndex < 0 || waypointIndex >= waypoints.length) return;

    state.currentWaypointIndex = waypointIndex;
    state.isReplayActive = true;
    this.applyWaypointToTrain(cleanNo, waypoints[waypointIndex], true);
  }

  public jumpToStation(trainNumber: string, stationCode: string): void {
    const cleanNo = trainNumber.trim();
    const waypoints = this.getWaypointsForTrain(cleanNo);
    const upperCode = stationCode.toUpperCase();

    const targetIdx = waypoints.findIndex(
      (wp) => wp.stationCode === upperCode && (wp.type === 'STATION_HALT' || wp.type === 'TERMINUS')
    );

    if (targetIdx !== -1) {
      this.jumpToWaypoint(cleanNo, targetIdx);
    }
  }

  // =========================================================================
  // CORE QUERY METHODS
  // =========================================================================
  public async getAllTrains(): Promise<Train[]> {
    return this.getAllTrainsSync();
  }

  public getAllTrainsSync(): Train[] {
    return [...this.trains];
  }

  public async getTrainByNumber(trainNumber: string): Promise<Train | null> {
    return this.getTrainByNumberSync(trainNumber);
  }

  public getTrainByNumberSync(trainNumber: string): Train | null {
    const cleanNo = trainNumber.trim();
    const train = this.trains.find((t) => t.trainNumber === cleanNo);
    return train ? { ...train } : null;
  }

  public async getNetworkStatus(): Promise<NetworkStatus> {
    return this.getNetworkStatusSync();
  }

  public getNetworkStatusSync(): NetworkStatus {
    const activeTrainCount = this.trains.length;
    const trainsRunning = this.trains.filter((t) => t.status === 'RUNNING').length;
    const trainsDelayed = this.trains.filter(
      (t) => t.status === 'DELAYED' || t.position.currentDelayMinutes > 5
    ).length;
    const trainsApproachingDestination = this.trains.filter(
      (t) => t.status === 'APPROACHING' || t.position.distanceRemainingKm < 50
    ).length;
    const trainsOnTime = this.trains.filter((t) => t.position.currentDelayMinutes === 0).length;
    const totalDelay = this.trains.reduce((acc, t) => acc + t.position.currentDelayMinutes, 0);
    const avgDelay = activeTrainCount > 0 ? Number((totalDelay / activeTrainCount).toFixed(1)) : 0;

    return {
      ...this.networkStatus,
      activeTrainCount,
      trainsRunning,
      trainsDelayed,
      trainsApproachingDestination,
      trainsOnTime,
      averageNetworkDelayMinutes: avgDelay
    };
  }

  public async searchAndFilterTrains(options: TrainFilterOptions): Promise<Train[]> {
    const { searchQuery, statusFilter, sortBy } = options;
    const query = searchQuery.toLowerCase().trim();

    let filtered = this.trains.filter((train) => {
      const matchesQuery =
        !query ||
        train.trainNumber.toLowerCase().includes(query) ||
        train.trainName.toLowerCase().includes(query) ||
        train.sourceStationCode.toLowerCase().includes(query) ||
        train.sourceStationName.toLowerCase().includes(query) ||
        train.destinationStationCode.toLowerCase().includes(query) ||
        train.destinationStationName.toLowerCase().includes(query) ||
        train.position.nextStationCode.toLowerCase().includes(query) ||
        train.position.nextStationName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'DELAYED'
          ? train.status === 'DELAYED' || train.position.currentDelayMinutes > 5
          : train.status === statusFilter);

      return matchesQuery && matchesStatus;
    });

    switch (sortBy) {
      case 'DELAY_DESC':
        filtered.sort((a, b) => b.position.currentDelayMinutes - a.position.currentDelayMinutes);
        break;
      case 'SPEED_DESC':
        filtered.sort((a, b) => b.position.speedKmph - a.position.speedKmph);
        break;
      case 'TRAIN_NAME':
        filtered.sort((a, b) => a.trainName.localeCompare(b.trainName));
        break;
      case 'TRAIN_NO':
      default:
        filtered.sort((a, b) => a.trainNumber.localeCompare(b.trainNumber));
        break;
    }

    return filtered;
  }

  public async getStationOperationalView(stationCode: string): Promise<StationOperationalView | null> {
    const upperCode = stationCode.toUpperCase();
    const stationMeta = PROTOTYPE_KEY_STATIONS.find((s) => s.stationCode === upperCode);

    const stationName = stationMeta?.stationName || upperCode;
    const zone = stationMeta?.zone || 'Indian Railways';
    const platforms = stationMeta?.platforms || 8;
    const trackThroughputPercent = stationMeta?.trackThroughputPercent || 85;

    const approachingTrains: StationOperationalView['approachingTrains'] = [];
    const departingTrains: StationOperationalView['departingTrains'] = [];

    for (const train of this.trains) {
      const stopIndex = train.route.findIndex((r) => r.stationCode === upperCode);
      if (stopIndex !== -1) {
        const stop = train.route[stopIndex];
        const currentProgress = train.position.distanceTravelledKm;

        if (
          stop.status === 'CURRENT' ||
          stop.status === 'NEXT' ||
          stop.status === 'UPCOMING' ||
          stop.status === 'TERMINUS'
        ) {
          const distAway = Math.max(0, stop.distanceFromSourceKm - currentProgress);
          approachingTrains.push({
            trainNumber: train.trainNumber,
            trainName: train.trainName,
            scheduledArrival: stop.scheduledArrival,
            expectedArrival:
              stop.actualOrCurrentArrival ||
              (train.position.currentDelayMinutes > 0
                ? `${stop.scheduledArrival} (+${train.position.currentDelayMinutes}m)`
                : stop.scheduledArrival),
            delayMinutes: train.position.currentDelayMinutes,
            platform: stop.platform,
            distanceAwayKm: distAway,
            speedKmph: train.position.speedKmph,
            status: train.status
          });
        }

        if (stop.status === 'COMPLETED' || stop.status === 'CURRENT') {
          departingTrains.push({
            trainNumber: train.trainNumber,
            trainName: train.trainName,
            scheduledDeparture: stop.scheduledDeparture,
            status: stop.status,
            platform: stop.platform
          });
        }
      }
    }

    approachingTrains.sort((a, b) => a.distanceAwayKm - b.distanceAwayKm);

    return {
      stationCode: upperCode,
      stationName,
      zone,
      platforms,
      trackThroughputPercent,
      approachingTrains,
      departingTrains
    };
  }

  public async getAllStations() {
    return PROTOTYPE_KEY_STATIONS;
  }

  public getServiceDataSourceMetadata() {
    return {
      name: 'Prototype Operational Snapshot (IR Sector Monitored Bus)',
      version: 'v1.0-offline-prototype',
      feedType: 'STATIC_PROTOTYPE',
      isLive: false,
      disclaimer:
        'This instance operates on structured offline prototype telemetry. Live Indian Railways CRIS/FOIS API connector will be configured in subsequent stages.'
    };
  }
}

// Export singleton instance of default railway data service
export const railwayDataService: IRailwayDataService = new PrototypeRailwayDataService();
