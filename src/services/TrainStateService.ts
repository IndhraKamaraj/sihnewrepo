/**
 * Train State Service & Route Section Extractor
 * SIH Problem Statement 26028: Dynamic ETA Engine
 *
 * ARCHITECTURAL ROLE:
 * Sits directly between the data layer (RailwayDataService) and the prediction
 * engine (DynamicETAEngine). It extracts, validates, and models the train's
 * current operational state, ordered route stops, and inter-station sections.
 */

import { Train, RouteStop } from '../types/train';
import { RouteSection } from '../types/eta';
import { parseScheduleTimeToMinutes } from '../utils/timeUtils';

export class TrainStateService {
  /**
   * Extracts past completed stops along the train's route.
   */
  public static getPastStops(train: Train): RouteStop[] {
    return train.route.filter((stop) => stop.status === 'COMPLETED');
  }

  /**
   * Extracts the current stop if the train is halted at a station.
   */
  public static getCurrentStop(train: Train): RouteStop | null {
    return train.route.find((stop) => stop.status === 'CURRENT') || null;
  }

  /**
   * Extracts the immediate next upcoming station.
   */
  public static getNextStop(train: Train): RouteStop | null {
    const next = train.route.find((stop) => stop.status === 'NEXT');
    if (next) return next;

    // Fallback: first stop whose distance is strictly greater than distance travelled
    return (
      train.route.find(
        (stop) => stop.distanceFromSourceKm > train.position.distanceTravelledKm
      ) || null
    );
  }

  /**
   * Extracts all upcoming stops ahead of the train (including the next stop and terminus).
   */
  public static getUpcomingStops(train: Train): RouteStop[] {
    const travelled = train.position.distanceTravelledKm;
    return train.route.filter((stop) => {
      if (stop.status === 'COMPLETED') return false;
      return stop.distanceFromSourceKm >= travelled;
    });
  }

  /**
   * Extracts the final destination stop of the train.
   */
  public static getDestinationStop(train: Train): RouteStop {
    return train.route[train.route.length - 1];
  }

  /**
   * Determines the permissible maximum speed (MPS) for a train type in normal operation.
   */
  public static getMaxPermissibleSpeedKmph(train: Train): number {
    switch (train.trainType) {
      case 'VANDE_BHARAT':
        return 130;
      case 'RAJDHANI':
      case 'SHATABDI':
      case 'DURONTO':
        return 130;
      case 'SUPERFAST':
        return 110;
      case 'MAIL_EXPRESS':
      default:
        return 100;
    }
  }

  /**
   * Deconstructs the ordered route into inter-station RouteSections with
   * both scheduled and dynamic runtime parameters.
   */
  public static buildRouteSections(train: Train): RouteSection[] {
    const sections: RouteSection[] = [];
    const stops = train.route;
    const currentDist = Math.max(0, train.position.distanceTravelledKm);
    const mps = this.getMaxPermissibleSpeedKmph(train);

    for (let i = 0; i < stops.length - 1; i++) {
      const fromStop = stops[i];
      const toStop = stops[i + 1];

      const distanceKm = Math.max(
        1,
        toStop.distanceFromSourceKm - fromStop.distanceFromSourceKm
      );

      // Scheduled timing & travel calculation
      const schedDepMinutes = parseScheduleTimeToMinutes(
        fromStop.scheduledDeparture === 'SOURCE'
          ? train.departureTime
          : fromStop.scheduledDeparture,
        fromStop.dayCount
      );

      const schedArrMinutes = parseScheduleTimeToMinutes(
        toStop.scheduledArrival === 'DEST'
          ? train.scheduledArrivalTime
          : toStop.scheduledArrival,
        toStop.dayCount
      );

      const scheduledTravelMinutes = Math.max(
        1,
        schedArrMinutes - schedDepMinutes
      );

      const scheduledAverageSpeedKmph = Math.round(
        (distanceKm / (scheduledTravelMinutes / 60)) * 10
      ) / 10;

      // Section classification based on train's current position
      const isPast = currentDist >= toStop.distanceFromSourceKm;
      const isFuture = currentDist < fromStop.distanceFromSourceKm;
      const isActive = !isPast && !isFuture;

      let sectionStatus: 'COMPLETED' | 'ACTIVE' | 'UPCOMING' = 'UPCOMING';
      if (isPast) {
        sectionStatus = 'COMPLETED';
      } else if (isActive) {
        sectionStatus = 'ACTIVE';
      }

      // Determine effective operational speed
      let effectiveSpeed = scheduledAverageSpeedKmph;
      if (isActive) {
        if (train.position.speedKmph > 0) {
          effectiveSpeed = Math.min(mps, train.position.speedKmph);
        } else {
          // Train halted at station: effective speed when moving will be accelerated to line speed
          effectiveSpeed = Math.min(mps, scheduledAverageSpeedKmph);
        }
      } else if (isFuture) {
        effectiveSpeed = Math.min(mps, scheduledAverageSpeedKmph);
      }

      sections.push({
        sectionIndex: i,
        fromStationCode: fromStop.stationCode,
        fromStationName: fromStop.stationName,
        toStationCode: toStop.stationCode,
        toStationName: toStop.stationName,
        distanceKm,
        scheduledDepartureTime:
          fromStop.scheduledDeparture === 'SOURCE'
            ? train.departureTime
            : fromStop.scheduledDeparture,
        scheduledArrivalTime:
          toStop.scheduledArrival === 'DEST'
            ? train.scheduledArrivalTime
            : toStop.scheduledArrival,
        scheduledTravelMinutes,
        scheduledAverageSpeedKmph,
        isCurrentActiveSection: isActive,
        status: sectionStatus,
        effectiveSpeedKmph: Math.round(effectiveSpeed),
        estimatedTravelMinutes: scheduledTravelMinutes, // Default; overridden by DynamicETAEngine
        operationalAdjustmentMinutes: 0,                // Default; calculated by DynamicETAEngine
        predictedArrivalTime: toStop.scheduledArrival
      });
    }

    return sections;
  }

  /**
   * Authoritatively identifies the active current route section for a given train.
   */
  public static getCurrentRouteSection(train: Train, sections?: RouteSection[]): RouteSection | null {
    const secList = sections || this.buildRouteSections(train);
    if (!secList || secList.length === 0) return null;
    const active = secList.find((s) => s.isCurrentActiveSection);
    if (active) return active;
    const currentDist = Math.max(0, train.position.distanceTravelledKm);
    const destDist = train.totalDistanceKm;
    if (currentDist >= destDist) {
      return secList[secList.length - 1];
    }
    return secList[0];
  }
}
