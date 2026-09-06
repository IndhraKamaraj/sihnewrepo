/**
 * Dynamic ETA Intelligence System - Domain Models & Types
 * SIH Problem Statement 26028
 *
 * Designed to cleanly decouple UI from data sources and support
 * incremental integration of future Dynamic ETA ML/heuristic prediction engines.
 */

export type TrainStatus =
  | 'RUNNING'
  | 'DELAYED'
  | 'APPROACHING'
  | 'ON_TIME'
  | 'TERMINATED'
  | 'SCHEDULED'
  | 'HOLD';

export type StationStopStatus =
  | 'COMPLETED'
  | 'CURRENT'
  | 'NEXT'
  | 'UPCOMING'
  | 'TERMINUS';

export type CoachClass =
  | '1A'  // First AC
  | '2A'  // AC 2-Tier
  | '3A'  // AC 3-Tier
  | '3E'  // AC 3-Tier Economy
  | 'CC'  // AC Chair Car
  | 'EC'  // Executive Chair Car
  | 'SL'  // Sleeper Class
  | '2S'  // Second Sitting / General
  | 'GEN' // Unreserved General
  | 'ENG' // Locomotive
  | 'EOG' // Generator / Brake Van
  | 'PC'; // Pantry Car

export interface Coach {
  coachId: string;         // e.g. "H1", "A1", "B1", "S1", "ENG", "PWR1"
  coachType: CoachClass;
  coachName: string;       // e.g. "AC First Class", "AC 2 Tier Sleeper"
  positionFromFront: number;
  totalSeatsOrBerths?: number;
  isEngine?: boolean;
}

export interface TrainComposition {
  totalCoaches: number;
  rakeType: string;       // e.g., "LHB Rake", "ICF Rake", "Train 18 / Vande Bharat"
  coaches: Coach[];
  classSummary: Record<string, number>;
  sourceNote?: string;
}

export interface Station {
  stationCode: string;     // e.g. "NDLS", "CNB", "PRYJ"
  stationName: string;     // e.g. "New Delhi", "Kanpur Central"
  division?: string;       // e.g. "Delhi", "Prayagraj"
  zone?: string;           // e.g. "NR", "NCR", "WR"
  latitude?: number;
  longitude?: number;
  numberOfPlatforms?: number;
}

export interface RouteStop {
  stopNumber: number;
  stationCode: string;
  stationName: string;
  distanceFromSourceKm: number;
  scheduledArrival: string;    // "HH:MM" or "SOURCE"
  scheduledDeparture: string;  // "HH:MM" or "DEST"
  actualOrCurrentArrival?: string;
  actualOrCurrentDeparture?: string;
  platform?: string;
  haltMinutes: number;
  dayCount: number;
  status: StationStopStatus;
  currentDelayMinutes?: number;
}

export interface TrainPosition {
  currentLocationDescription: string; // e.g. "Approaching Panki Dham, 8 km to CNB"
  currentStationCode?: string;        // If halted at a station
  currentStationName?: string;
  nextStationCode: string;
  nextStationName: string;
  speedKmph: number;
  currentDelayMinutes: number;
  distanceTravelledKm: number;
  distanceRemainingKm: number;
  lastUpdatedTimestamp: string;
  signalAspect?: 'GREEN' | 'DOUBLE_YELLOW' | 'YELLOW' | 'RED';
  sectionBlock?: string;              // e.g. "CNB-PNK Section Up Line"
  operationalBlockStatus?: 'NORMAL' | 'BLOCKED' | 'HOLD';
  operationalHoldReason?: string;
}

export type ProvenanceFeedType =
  | 'STATIC_PROTOTYPE'
  | 'REPLAY_TEST_FEED'
  | 'SIMULATED_FEED'
  | 'LIVE_NTES_FOIS'
  | 'STAGE2_SCENARIO';

export interface DataProvenance {
  sourceName: string;          // e.g., "Prototype Operational Snapshot (IR Sector 04)"
  feedType: ProvenanceFeedType;
  isLiveFeed: boolean;
  snapshotTimestamp: string;
  dataAccuracyDisclaimer: string;
  recordIdentifier: string;
}

export interface ReplayState {
  activeTrainNumber: string | null;
  isPlaying: boolean;
  speedMultiplier: number; // 1, 2, 5, 10
  currentWaypointIndex: number;
  totalWaypoints: number;
  isReplayActive: boolean;
  modeLabel: 'VERIFIED' | 'REPLAY / TEST MODE' | 'SIMULATION';
  lastTickTimestamp?: string;
  isTrainHeld?: boolean;
  operationalHoldReason?: string;
  activeBlockedSection?: string;
}

/**
 * Extensible Train entity.
 * Supports future addition of Dynamic ETA engine payloads without schema breaks.
 */
export interface Train {
  trainNumber: string;         // e.g. "12951"
  trainName: string;           // e.g. "Mumbai Rajdhani Express"
  trainType: 'RAJDHANI' | 'SHATABDI' | 'VANDE_BHARAT' | 'SUPERFAST' | 'MAIL_EXPRESS' | 'DURONTO';
  sourceStationCode: string;
  sourceStationName: string;
  destinationStationCode: string;
  destinationStationName: string;
  departureTime: string;
  scheduledArrivalTime: string;
  totalDistanceKm: number;
  status: TrainStatus;
  
  // Current dynamic state
  position: TrainPosition;
  
  // Structural route and composition
  route: RouteStop[];
  composition: TrainComposition;
  
  // Provenance metadata
  provenance: DataProvenance;

  // =========================================================================
  // FUTURE DYNAMIC ETA ENGINE EXTENSION POINTS (Phase 2 & 3 Architecture Hook)
  // These fields will be populated once the Dynamic ETA Engine is connected.
  // =========================================================================
  futurePredictionContract?: {
    predictedArrival?: string;
    predictedDelayMinutes?: number;
    predictionConfidence?: number;       // 0.0 - 1.0
    predictionRangeMinutes?: [number, number]; // [min, max]
    delayCauseCategory?: string;
    sectionCongestionLevel?: 'LOW' | 'MODERATE' | 'SEVERE';
    historicalSectionSpeedAvgKmph?: number;
    weatherConstraintFactor?: string;
  };
}

export interface NetworkStatus {
  systemOperationalState: 'NOMINAL' | 'DEGRADED_WEATHER' | 'HIGH_CONGESTION';
  activeTrainCount: number;
  trainsRunning: number;
  trainsDelayed: number;
  trainsApproachingDestination: number;
  trainsOnTime: number;
  averageNetworkDelayMinutes: number;
  monitoredCorridors: {
    corridorId: string;
    name: string;
    activeTrains: number;
    punctualityRate: number;
    status: 'OPTIMAL' | 'CONGESTED' | 'MAINTENANCE_HOLD';
  }[];
  telemetrySource: string;
  lastSyncTimestamp: string;
}

export interface TrainFilterOptions {
  searchQuery: string;
  statusFilter: 'ALL' | TrainStatus;
  zoneFilter: string;
  sortBy: 'DELAY_DESC' | 'TRAIN_NO' | 'TRAIN_NAME' | 'SPEED_DESC';
}
