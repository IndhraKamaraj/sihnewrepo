/**
 * Dynamic ETA Intelligence System - ETA Domain Models & Contract
 * SIH Problem Statement 26028: Dynamic ETA Engine
 *
 * This contract defines the interfaces between the operational Train State Layer,
 * the Section-Based Route Traversal Model, and the Dynamic ETA Engine.
 */

import { StationStopStatus, TrainStatus } from './train';
import { HistoricalContext } from './historical';

/**
 * Prediction status derived from calculated delay and difference.
 */
export type ETAPredictionStatus =
  | 'ON_TRACK'
  | 'RECOVERY_EXPECTED'
  | 'MINOR_DELAY'
  | 'SIGNIFICANT_DELAY';

/**
 * Directional trend comparing Dynamic ETA against Baseline ETA.
 */
export type ETATrendDirection =
  | 'RECOVERY'          // Dynamic ETA is earlier than baseline (making up time)
  | 'ADDITIONAL_DELAY'  // Dynamic ETA is later than baseline (accumulating drag)
  | 'ON_TRACK';         // Dynamic ETA matches baseline within ±1 min

/**
 * Structured contributing factor explaining calculation factors.
 */
export interface ETAContributingFactor {
  factorKey: string;
  label: string;
  value: string;
  impactDescription: string;
  category: 'SPEED' | 'DELAY' | 'SECTION' | 'SLACK' | 'SIGNAL' | 'DWELL' | 'HISTORICAL';
}

/**
 * Section-based representation of the remaining route between consecutive stations.
 */
export interface RouteSection {
  sectionIndex: number;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  distanceKm: number;
  
  // Scheduled parameters
  scheduledDepartureTime: string; // "HH:MM"
  scheduledArrivalTime: string;   // "HH:MM"
  scheduledTravelMinutes: number;
  scheduledAverageSpeedKmph: number;

  // Dynamic parameters
  isCurrentActiveSection: boolean;
  status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
  effectiveSpeedKmph: number;
  estimatedTravelMinutes: number;
  operationalAdjustmentMinutes: number; // e.g. -2 min (recovery) or +4 min (cautious approach)
  predictedArrivalTime: string;

  // Active operational scenario condition attributes
  congestionLevel?: CongestionLevel;
  speedRestrictionKmph?: number;
  unscheduledStopMinutes?: number;
  isTrackBlocked?: boolean;
}

/**
 * Operational Scenario Stress Testing types
 */
export type CongestionLevel = 'NORMAL' | 'MODERATE' | 'HEAVY' | 'SEVERE';

export interface SectionScenarioOverride {
  sectionKey: string; // e.g., `${fromStationCode}-${toStationCode}`
  fromStationCode: string;
  toStationCode: string;
  congestion?: CongestionLevel;
  speedRestrictionKmph?: number; // 60, 50, 40 km/h
  unscheduledStopMinutes?: number; // 2, 5, 10 min
  isTrackBlocked?: boolean; // track line block
  blockDelayMinutes?: number; // deterministic delay penalty
}

export interface TrainScenarioState {
  trainNumber: string;
  sectionOverrides: Record<string, SectionScenarioOverride>;
  activeScenarioCount: number;
}

export interface ActiveOperationalFactor {
  conditionType: 'CONGESTION' | 'SPEED_RESTRICTION' | 'UNSCHEDULED_STOP' | 'TRACK_BLOCK';
  sectionKey: string;
  sectionLabel: string;
  detail: string;
  travelTimeImpactMinutes: number;
}

export interface ScenarioImpactSummary {
  isScenarioActive: boolean;
  activeConditionSummary: 'NORMAL' | 'CONGESTED' | 'RESTRICTED' | 'BLOCKED';
  activeFactors: ActiveOperationalFactor[];
  upcomingStationImpactMinutes: number;
  destinationImpactMinutes: number;
  baselineDestinationETA: string;
  scenarioDestinationETA: string;
  destinationDifferenceMinutes: number;
}

/**
 * Predicted arrival/departure timing for a specific station along the route.
 */
export interface StationETAPrediction {
  stopNumber: number;
  stationCode: string;
  stationName: string;
  distanceFromSourceKm: number;
  distanceFromCurrentKm: number;
  
  // Timings
  scheduledArrival: string;    // "HH:MM" or "SOURCE"
  scheduledDeparture: string;  // "HH:MM" or "DEST"
  dayCount: number;
  haltMinutes: number;

  // Predictions
  baselineArrival: string;     // "HH:MM" from Schedule + Current Delay Baseline
  dynamicArrival: string;      // "HH:MM" from Dynamic Traversal Engine
  
  // Delays
  baselineDelayMinutes: number;
  dynamicDelayMinutes: number;
  
  // Difference (Dynamic - Baseline): negative = recovering, positive = expanding delay
  etaDifferenceMinutes: number;
  
  // Status
  status: StationStopStatus;
  isDestination: boolean;
  actualArrivalTimestamp?: string;
}

/**
 * Comprehensive Dynamic ETA Prediction output object.
 * Produced by DynamicETAEngine for consumption by UI and evaluation modules.
 */
export interface DynamicETAPrediction {
  trainNumber: string;
  trainName: string;
  generatedAt: string;         // e.g. "23:45:12 IST"
  
  // Data Provenance
  dataSource: string;          // e.g., "Replay / Test Mode" or "Prototype Snapshot (IR Sector 04)"
  dataProvenanceType: 'VERIFIED' | 'REPLAY / TEST MODE' | 'SIMULATION';
  isLiveFeed: boolean;

  // Destination Predictions
  destinationStationCode: string;
  destinationStationName: string;
  scheduledDestinationETA: string; // "HH:MM"
  baselineDestinationETA: string;  // "HH:MM" (Schedule + Current Delay Baseline)
  dynamicDestinationETA: string;   // "HH:MM" (Dynamic physics/route model)

  // Delays & Variance
  currentAccumulatedDelayMinutes: number;
  predictedDelayMinutes: number;   // Expected delay at destination under dynamic model
  etaDifferenceMinutes: number;    // dynamicDelayMinutes - baselineDelayMinutes
  
  // High-level interpretation
  etaStatus: ETAPredictionStatus;
  etaTrend: ETATrendDirection;
  etaTrendLabel: string;          // e.g., "4 min recovery expected" or "+8 min additional delay"
  
  // Granular predictions
  upcomingStationPredictions: StationETAPrediction[]; // Active & upcoming stations only
  allStationPredictions: StationETAPrediction[];      // Full route stops
  sections: RouteSection[];                          // Remaining route sections

  // Explanation Foundation
  calculationMethod: string;       // "Deterministic Route Section Traversal & Velocity Differential Model"
  contributingFactors: ETAContributingFactor[];

  // Operational Scenario Impact & Stress Testing Synthesis
  scenarioImpact?: ScenarioImpactSummary;

  // Granular Impact Metrics
  congestionImpactMinutes?: number;
  speedRestrictionImpactMinutes?: number;
  unscheduledStopImpactMinutes?: number;
  trackBlockImpactMinutes?: number;
  delayCauseCategory?: string;

  // Historical Delay Intelligence Context
  historicalContext?: HistoricalContext;
  historicalBiasMinutes?: number;

  // Operational Block / Hold State
  operationalHoldState?: 'NORMAL' | 'BLOCKED' | 'HOLD';
  operationalHoldExplanation?: string;
}
