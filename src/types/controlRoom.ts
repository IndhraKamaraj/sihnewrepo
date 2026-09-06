import { TrainStatus, StationStopStatus } from './train';
import { CongestionLevel, SectionScenarioOverride } from './eta';

export interface ControlRoomOfficer {
  controlCentreId: string;
  controlCentreName: string;
  officerName: string;
  designation: string;
  division: string;
  zone: string;
  shiftCode: string;
  badgeNumber: string;
  isLoggedIn: boolean;
  loginTimestamp?: string;
}

export interface OperationalSectionSummary {
  sectionKey: string;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  distanceKm: number;
  maxPermissibleSpeedKmph: number;
  activeTrains: Array<{
    trainNumber: string;
    trainName: string;
    speedKmph: number;
    delayMinutes: number;
    status: TrainStatus;
  }>;
  operationalCondition: 'NORMAL' | 'MODERATE_CONGESTION' | 'HEAVY_CONGESTION' | 'SPEED_RESTRICTION' | 'LINE_BLOCK';
  conditionDetail?: string;
  isBlocked: boolean;
  speedRestrictionKmph?: number;
}

export interface ControlRoomAlert {
  id: string;
  timestamp: string;
  trainNumber?: string;
  trainName?: string;
  sectionKey?: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'LINE_BLOCK' | 'SIGNIFICANT_DELAY' | 'SPEED_CAUTION' | 'CONGESTION' | 'STATION_DWELL' | 'SYSTEM';
  title: string;
  detail: string;
  recommendedAction: string;
}

export interface RouteStopInput {
  stopNumber: number;
  stationCode: string;
  stationName: string;
  distanceFromSourceKm: number;
  scheduledArrival: string;
  scheduledDeparture: string;
  platform?: string;
  haltMinutes: number;
  dayCount?: number;
}

export interface RegisterNewTrainInput {
  trainNumber: string;
  trainName: string;
  trainType?: 'RAJDHANI' | 'SHATABDI' | 'VANDE_BHARAT' | 'SUPERFAST' | 'MAIL_EXPRESS' | 'DURONTO';
  sourceStationCode: string;
  sourceStationName: string;
  destinationStationCode: string;
  destinationStationName: string;
  departureTime: string;
  scheduledArrivalTime: string;
  totalDistanceKm?: number;
  initialOperationalState?: {
    status?: TrainStatus;
    currentSpeedKmph?: number;
    currentDelayMinutes?: number;
    signalAspect?: 'GREEN' | 'DOUBLE_YELLOW' | 'YELLOW' | 'RED';
    currentLocationDescription?: string;
  };
  route: RouteStopInput[];
}
