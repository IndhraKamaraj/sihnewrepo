/**
 * Core Dynamic ETA Engine
 * SIH Problem Statement 26028: Dynamic Arrival Time Prediction Engine
 *
 * ARCHITECTURAL CONTRACT:
 * - Standalone calculation engine decoupled from UI components.
 * - Deterministic, inspectable, and reproducible.
 * - Computes both the Baseline ETA (Schedule + Current Delay Baseline) and the
 *   Dynamic ETA (Current train physics, section traversal, and active operational stress conditions).
 * - Enforces chronological monotonicity and consistency constraints.
 * - Zero artificial or fabricated accuracy claims.
 */

import { Train } from '../types/train';
import {
  DynamicETAPrediction,
  RouteSection,
  StationETAPrediction,
  ETAPredictionStatus,
  ETATrendDirection,
  ETAContributingFactor,
  ScenarioImpactSummary,
  ActiveOperationalFactor
} from '../types/eta';
import { TrainStateService } from './TrainStateService';
import { operationalScenarioService } from './OperationalScenarioService';
import { HistoricalDelayService } from './HistoricalDelayService';
import {
  parseScheduleTimeToMinutes,
  formatMinutesToTimeString,
  formatETADifference
} from '../utils/timeUtils';

export class DynamicETAEngine {
  /**
   * Primary entry point: Generates a complete DynamicETAPrediction for a given Train.
   */
  public static predict(train: Train): DynamicETAPrediction {
    // 1. Extract structural route sections and destination
    const sections = TrainStateService.buildRouteSections(train);
    const destinationStop = TrainStateService.getDestinationStop(train);
    const currentSection = TrainStateService.getCurrentRouteSection(train, sections);
    const currentDist = Math.max(0, train.position.distanceTravelledKm);
    const currentSpeed = Math.max(0, train.position.speedKmph);
    const currentDelay = Math.max(0, train.position.currentDelayMinutes);
    const mps = TrainStateService.getMaxPermissibleSpeedKmph(train);

    // Query active operational scenario conditions for this train
    const cleanNo = train.trainNumber.trim();
    const scenarioOverrides = operationalScenarioService.getScenarioForTrain(cleanNo);
    const overrideMap = new Map<string, typeof scenarioOverrides[0]>();
    scenarioOverrides.forEach((ov) => {
      const normSection = ov.sectionKey.trim().toUpperCase();
      const normTo = ov.toStationCode.trim().toUpperCase();
      overrideMap.set(normSection, ov);
      overrideMap.set(normTo, ov);
    });

    // 2. Compute Baseline Destination ETA (Schedule + Current Delay Baseline)
    // Conceptually: scheduled arrival + current accumulated delay = baseline ETA
    const schedDestArrMinutes = parseScheduleTimeToMinutes(
      train.scheduledArrivalTime,
      destinationStop.dayCount
    );
    const baselineDestArrMinutes = schedDestArrMinutes + currentDelay;
    const baselineDestinationETA = formatMinutesToTimeString(
      baselineDestArrMinutes,
      false,
      destinationStop.dayCount
    );

    // 3. Compute Section-by-Section Dynamic Travel Times
    const stationPredictions: StationETAPrediction[] = [];
    const allStationPredictions: StationETAPrediction[] = [];
    const activeFactors: ActiveOperationalFactor[] = [];

    let totalCongestionImpact = 0;
    let totalSpeedRestrictionImpact = 0;
    let totalUnscheduledStopImpact = 0;
    let totalTrackBlockImpact = 0;

    // Retrieve synthesized historical delay context for current section and all route sections
    const historicalContext = HistoricalDelayService.getHistoricalContext({
      train,
      currentSection,
      allRouteSections: sections
    });

    const stops = train.route;
    const sourceSchedDepMinutes = parseScheduleTimeToMinutes(
      train.departureTime,
      stops[0]?.dayCount || 1
    );

    let cumulativePropagatedDelay = currentDelay;

    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      const isDestination = i === stops.length - 1;
      const isCompleted = stop.status === 'COMPLETED';

      // Scheduled arrival in absolute minutes
      const schedArrMinutes =
        stop.scheduledArrival === 'SOURCE'
          ? sourceSchedDepMinutes
          : parseScheduleTimeToMinutes(stop.scheduledArrival, stop.dayCount);

      // Baseline prediction = Scheduled + Current Accumulated Delay
      const baselineArrMinutes = isCompleted
        ? parseScheduleTimeToMinutes(stop.actualOrCurrentArrival || stop.scheduledArrival, stop.dayCount)
        : schedArrMinutes + currentDelay;

      const baselineArrivalStr = isCompleted
        ? stop.actualOrCurrentArrival || stop.scheduledArrival
        : formatMinutesToTimeString(baselineArrMinutes, false, stop.dayCount);

      const baselineDelay = isCompleted
        ? stop.currentDelayMinutes || 0
        : currentDelay;

      let dynamicArrMinutes = baselineArrMinutes;
      let dynamicDelayMinutes = baselineDelay;
      let dynamicArrivalStr = baselineArrivalStr;

      if (isCompleted) {
        // Station already passed: lock in verified actual timing
        dynamicArrMinutes = baselineArrMinutes;
        dynamicDelayMinutes = stop.currentDelayMinutes || 0;
        dynamicArrivalStr = stop.actualOrCurrentArrival || stop.scheduledArrival;
      } else {
        // Upcoming or Active Station: Compute dynamic arrival via section traversal
        const incomingSection = sections.find((s) => s.toStationCode === stop.stationCode);

        if (incomingSection) {
          const fromCode = incomingSection.fromStationCode.trim().toUpperCase();
          const toCode = incomingSection.toStationCode.trim().toUpperCase();
          const sectionKey = `${fromCode}-${toCode}`;
          const override = overrideMap.get(sectionKey) || overrideMap.get(toCode);

          // Determine initial physical speed
          let baseSpeed = incomingSection.isCurrentActiveSection
            ? (currentSpeed > 0 ? currentSpeed : incomingSection.scheduledAverageSpeedKmph)
            : incomingSection.scheduledAverageSpeedKmph;

          // Caution signal aspect limitation in active block
          if (incomingSection.isCurrentActiveSection) {
            if (train.position.signalAspect === 'DOUBLE_YELLOW' || train.position.signalAspect === 'YELLOW') {
              baseSpeed = Math.min(baseSpeed, 50);
            }
          }

          let effectiveSpeed = Math.min(mps, Math.max(15, baseSpeed));
          const remainingSectionDistanceKm = incomingSection.isCurrentActiveSection
            ? Math.max(0, stop.distanceFromSourceKm - currentDist)
            : incomingSection.distanceKm;

          // Fraction of scheduled timetable time remaining for this section
          const scheduledFractionRemaining = incomingSection.isCurrentActiveSection && incomingSection.distanceKm > 0
            ? Math.max(1, Math.round((remainingSectionDistanceKm / incomingSection.distanceKm) * incomingSection.scheduledTravelMinutes))
            : incomingSection.scheduledTravelMinutes;

          // If currently running at crawl speed on active section without an explicit override
          let crawlPenalty = 0;
          if (incomingSection.isCurrentActiveSection && currentSpeed > 0 && currentSpeed < 45) {
            const crawlTime = Math.round((remainingSectionDistanceKm / currentSpeed) * 60);
            if (crawlTime > scheduledFractionRemaining) {
              crawlPenalty = crawlTime - scheduledFractionRemaining;
            }
          }

          let congestionPenalty = 0;
          let restrictionPenalty = 0;
          let unscheduledStopPenalty = 0;
          let trackBlockPenalty = 0;

          // =================================================================
          // A. SECTION CONGESTION SCENARIO
          // =================================================================
          if (override?.congestion && override.congestion !== 'NORMAL') {
            let mult = 1.0;
            if (override.congestion === 'MODERATE') mult = 1.25;
            else if (override.congestion === 'HEAVY') mult = 1.65;
            else if (override.congestion === 'SEVERE') mult = 2.25;

            congestionPenalty = Math.max(2, Math.round(scheduledFractionRemaining * (mult - 1)));
            effectiveSpeed = Math.max(12, Math.round(effectiveSpeed / mult));
            totalCongestionImpact += congestionPenalty;

            activeFactors.push({
              conditionType: 'CONGESTION',
              sectionKey,
              sectionLabel: `${incomingSection.fromStationCode} → ${incomingSection.toStationCode}`,
              detail: `${override.congestion} Congestion (Speed dropped to ${effectiveSpeed} km/h)`,
              travelTimeImpactMinutes: congestionPenalty
            });

            incomingSection.congestionLevel = override.congestion;
          }

          // =================================================================
          // B. SPEED RESTRICTION SCENARIO
          // =================================================================
          if (override?.speedRestrictionKmph && override.speedRestrictionKmph > 0) {
            const normalSecSpeed = Math.min(mps, Math.max(incomingSection.scheduledAverageSpeedKmph, 90));
            if (normalSecSpeed > override.speedRestrictionKmph) {
              const normalPhysicalTime = (remainingSectionDistanceKm / normalSecSpeed) * 60;
              effectiveSpeed = override.speedRestrictionKmph;
              const restrictedPhysicalTime = (remainingSectionDistanceKm / effectiveSpeed) * 60;
              restrictionPenalty = Math.max(2, Math.round(restrictedPhysicalTime - normalPhysicalTime));

              totalSpeedRestrictionImpact += restrictionPenalty;

              activeFactors.push({
                conditionType: 'SPEED_RESTRICTION',
                sectionKey,
                sectionLabel: `${incomingSection.fromStationCode} → ${incomingSection.toStationCode}`,
                detail: `Speed restricted to ${override.speedRestrictionKmph} km/h (Limit imposed)`,
                travelTimeImpactMinutes: restrictionPenalty
              });

              incomingSection.speedRestrictionKmph = override.speedRestrictionKmph;
            }
          }

          // =================================================================
          // C. UNSCHEDULED STOP SCENARIO
          // =================================================================
          if (override?.unscheduledStopMinutes && override.unscheduledStopMinutes > 0) {
            unscheduledStopPenalty = override.unscheduledStopMinutes;
            totalUnscheduledStopImpact += unscheduledStopPenalty;

            activeFactors.push({
              conditionType: 'UNSCHEDULED_STOP',
              sectionKey,
              sectionLabel: `${incomingSection.fromStationCode} → ${incomingSection.toStationCode}`,
              detail: `Unscheduled stoppage of ${override.unscheduledStopMinutes} min at block/station`,
              travelTimeImpactMinutes: unscheduledStopPenalty
            });

            incomingSection.unscheduledStopMinutes = override.unscheduledStopMinutes;
          }

          // =================================================================
          // D. TRACK / LINE BLOCK SCENARIO
          // =================================================================
          if (override?.isTrackBlocked) {
            trackBlockPenalty = override.blockDelayMinutes || 20;
            totalTrackBlockImpact += trackBlockPenalty;

            activeFactors.push({
              conditionType: 'TRACK_BLOCK',
              sectionKey,
              sectionLabel: `${incomingSection.fromStationCode} → ${incomingSection.toStationCode}`,
              detail: `Line maintenance block active; single-line crossing hold (+${trackBlockPenalty} min)`,
              travelTimeImpactMinutes: trackBlockPenalty
            });

            incomingSection.isTrackBlocked = true;
          }

          // Historical contextual adjustment (only when no acute real-time operational disturbance is active on section)
          let historicalAdjustment = 0;
          if (
            !override?.congestion &&
            !override?.speedRestrictionKmph &&
            !override?.isTrackBlocked &&
            !override?.unscheduledStopMinutes
          ) {
            const histProfile = historicalContext.sectionStatsMap[sectionKey];
            if (histProfile && histProfile.medianDelayMinutes >= 3 && cumulativePropagatedDelay < 12) {
              historicalAdjustment = Math.min(2, Math.round(histProfile.medianDelayMinutes * 0.25));
            }
          }

          // Timetable engineering slack / recovery potential (when no active restriction and running delayed)
          let slackRecovery = 0;
          if (
            !override?.congestion &&
            !override?.speedRestrictionKmph &&
            !override?.isTrackBlocked &&
            !override?.unscheduledStopMinutes &&
            cumulativePropagatedDelay > 5 &&
            currentSpeed >= 95 &&
            train.position.signalAspect === 'GREEN'
          ) {
            slackRecovery = -Math.min(3, Math.round(incomingSection.scheduledTravelMinutes * 0.05));
          }

          const sectionDisturbances =
            congestionPenalty +
            restrictionPenalty +
            unscheduledStopPenalty +
            trackBlockPenalty;

          const sectionOperationalDiff =
            sectionDisturbances +
            crawlPenalty +
            historicalAdjustment +
            slackRecovery;

          const scenarioTraverseMinutes = Math.max(
            1,
            scheduledFractionRemaining + sectionOperationalDiff
          );

          incomingSection.effectiveSpeedKmph = Math.round(effectiveSpeed);
          incomingSection.estimatedTravelMinutes = Math.round(scenarioTraverseMinutes);
          incomingSection.operationalAdjustmentMinutes = sectionOperationalDiff;

          // Propagate delay downstream
          cumulativePropagatedDelay = Math.max(0, cumulativePropagatedDelay + sectionOperationalDiff);
          dynamicDelayMinutes = cumulativePropagatedDelay;
          dynamicArrMinutes = schedArrMinutes + dynamicDelayMinutes;

          incomingSection.predictedArrivalTime = formatMinutesToTimeString(
            dynamicArrMinutes,
            false,
            stop.dayCount
          );
        }

        // =====================================================================
        // MONOTONICITY & CHRONOLOGICAL CONSISTENCY CHECK
        // Arrival at stop i cannot be earlier than departure at stop i-1 + transit
        // =====================================================================
        if (i > 0) {
          const prevStop = stops[i - 1];
          const prevPred = allStationPredictions[i - 1];
          if (prevPred) {
            const prevDepMinutes = parseScheduleTimeToMinutes(
              prevStop.scheduledDeparture === 'DEST' ? prevStop.scheduledArrival : prevStop.scheduledDeparture,
              prevStop.dayCount
            ) + prevPred.dynamicDelayMinutes;

            const minTransitMinutes = Math.max(
              2,
              Math.round(((stop.distanceFromSourceKm - prevStop.distanceFromSourceKm) / mps) * 60)
            );

            if (dynamicArrMinutes < prevDepMinutes + minTransitMinutes) {
              dynamicArrMinutes = prevDepMinutes + minTransitMinutes;
              dynamicDelayMinutes = Math.max(0, dynamicArrMinutes - schedArrMinutes);
              cumulativePropagatedDelay = dynamicDelayMinutes;
            }
          }
        }

        dynamicArrivalStr = formatMinutesToTimeString(
          dynamicArrMinutes,
          false,
          stop.dayCount
        );
      }

      const diffMinutes = dynamicDelayMinutes - baselineDelay;

      const prediction: StationETAPrediction = {
        stopNumber: stop.stopNumber,
        stationCode: stop.stationCode,
        stationName: stop.stationName,
        distanceFromSourceKm: stop.distanceFromSourceKm,
        distanceFromCurrentKm: Math.max(0, stop.distanceFromSourceKm - currentDist),
        scheduledArrival: stop.scheduledArrival,
        scheduledDeparture: stop.scheduledDeparture,
        dayCount: stop.dayCount,
        haltMinutes: stop.haltMinutes,
        baselineArrival: baselineArrivalStr,
        dynamicArrival: dynamicArrivalStr,
        baselineDelayMinutes: baselineDelay,
        dynamicDelayMinutes,
        etaDifferenceMinutes: diffMinutes,
        status: stop.status,
        isDestination,
        actualArrivalTimestamp: stop.actualOrCurrentArrival
      };

      allStationPredictions.push(prediction);

      if (!isCompleted || stop.status === 'CURRENT') {
        stationPredictions.push(prediction);
      }
    }

    // 4. Destination Predictions & High-level Metric Synthesis
    const destPrediction =
      allStationPredictions[allStationPredictions.length - 1] || {
        dynamicArrival: baselineDestinationETA,
        dynamicDelayMinutes: currentDelay,
        baselineDelayMinutes: currentDelay,
        etaDifferenceMinutes: 0
      };

    const dynamicDestinationETA = destPrediction.dynamicArrival;
    const predictedDelayMinutes = destPrediction.dynamicDelayMinutes;
    const etaDifferenceMinutes = destPrediction.etaDifferenceMinutes;

    // 5. Evaluate Trend and Status
    const trendMeta = formatETADifference(etaDifferenceMinutes);
    const etaTrend: ETATrendDirection = trendMeta.trend;
    const etaTrendLabel = trendMeta.label;

    let etaStatus: ETAPredictionStatus = 'ON_TRACK';
    if (predictedDelayMinutes <= 3) {
      etaStatus = 'ON_TRACK';
    } else if (etaDifferenceMinutes <= -2) {
      etaStatus = 'RECOVERY_EXPECTED';
    } else if (predictedDelayMinutes <= 20) {
      etaStatus = 'MINOR_DELAY';
    } else {
      etaStatus = 'SIGNIFICANT_DELAY';
    }

    // 6. Operational Scenario Synthesis & Impact Assessment
    const activeBlockOverride = scenarioOverrides.find((ov) => ov.isTrackBlocked);
    let operationalHoldState: 'NORMAL' | 'BLOCKED' | 'HOLD' = 'NORMAL';
    let operationalHoldExplanation: string | undefined = undefined;

    if (activeBlockOverride) {
      const fromStn = activeBlockOverride.fromStationCode.trim().toUpperCase();
      const toStn = activeBlockOverride.toStationCode.trim().toUpperCase();
      const fromStop = stops.find((s) => s.stationCode.trim().toUpperCase() === fromStn);
      const toStop = stops.find((s) => s.stationCode.trim().toUpperCase() === toStn);
      if (fromStop && toStop) {
        if (currentDist >= fromStop.distanceFromSourceKm && currentDist < toStop.distanceFromSourceKm) {
          operationalHoldState = 'HOLD';
          operationalHoldExplanation = `Train held due to active track block on ${fromStn} → ${toStn}.`;
        } else if (currentDist < fromStop.distanceFromSourceKm) {
          operationalHoldState = 'BLOCKED';
          operationalHoldExplanation = `Track block active on upcoming section ${fromStn} → ${toStn} (+${activeBlockOverride.blockDelayMinutes || 20}m hold). Train will hold upon arrival.`;
        } else {
          operationalHoldState = 'NORMAL';
        }
      }
    }

    const hasBlock = activeFactors.some((f) => f.conditionType === 'TRACK_BLOCK');
    const hasRestriction = activeFactors.some((f) => f.conditionType === 'SPEED_RESTRICTION');
    const hasCongestion = activeFactors.some((f) => f.conditionType === 'CONGESTION');

    let activeConditionSummary: 'NORMAL' | 'CONGESTED' | 'RESTRICTED' | 'BLOCKED' = 'NORMAL';
    if (hasBlock) activeConditionSummary = 'BLOCKED';
    else if (hasRestriction) activeConditionSummary = 'RESTRICTED';
    else if (hasCongestion) activeConditionSummary = 'CONGESTED';

    const nextStationPred = stationPredictions[0];
    const upcomingStationImpactMinutes = nextStationPred
      ? nextStationPred.dynamicDelayMinutes - nextStationPred.baselineDelayMinutes
      : 0;

    const scenarioImpact: ScenarioImpactSummary = {
      isScenarioActive: activeFactors.length > 0,
      activeConditionSummary,
      activeFactors,
      upcomingStationImpactMinutes,
      destinationImpactMinutes: etaDifferenceMinutes,
      baselineDestinationETA,
      scenarioDestinationETA: dynamicDestinationETA,
      destinationDifferenceMinutes: etaDifferenceMinutes
    };

    // 7. Transparent Contributing Factors (Prediction Explanation & Factors)
    // Only display active factors as required
    const contributingFactors: ETAContributingFactor[] = [
      {
        factorKey: 'VELOCITY_PROFILE',
        label: 'Current Speed Profile',
        value: operationalHoldState === 'HOLD' ? '0 km/h (HOLD)' : `${currentSpeed} km/h (MPS: ${mps} km/h)`,
        impactDescription:
          operationalHoldState === 'HOLD'
            ? operationalHoldExplanation || 'Train held at section entry due to active operational block.'
            : currentSpeed >= 95
            ? 'High-speed cruising maintains timetable transit velocity and leverages inter-station slack.'
            : currentSpeed === 0
            ? 'Train halted or dwelling; zero distance progression in current block.'
            : 'Sub-optimal speed (caution approach or yard crawl) adds inter-station travel minutes.',
        category: 'SPEED'
      },
      {
        factorKey: 'CURRENT_DELAY',
        label: 'Accumulated Section Delay',
        value: currentDelay === 0 ? 'On Time (0 min)' : `+${currentDelay} min`,
        impactDescription:
          currentDelay === 0
            ? 'Zero accumulated delay across traversed route blocks.'
            : `Initial baseline offsets future timings by +${currentDelay} min before dynamic velocity adjustments.`,
        category: 'DELAY'
      },
      {
        factorKey: 'ROUTE_REMAINING',
        label: 'Remaining Route Distance',
        value: `${Math.max(0, train.position.distanceRemainingKm)} km (${sections.filter((s) => s.status !== 'COMPLETED').length} sections)`,
        impactDescription: `Dynamic prediction synthesized across ${sections.filter((s) => s.status !== 'COMPLETED').length} upcoming inter-station block sections.`,
        category: 'SECTION'
      },
      {
        factorKey: 'SIGNALING_ASPECT',
        label: 'Active Signaling Aspect',
        value: operationalHoldState === 'HOLD' ? 'RED (HOLD)' : train.position.signalAspect || 'GREEN',
        impactDescription:
          operationalHoldState === 'HOLD'
            ? 'Absolute stop aspect enforced by track block.'
            : train.position.signalAspect === 'GREEN'
            ? 'Proceed at permissible section speed; clear forward block track circuit.'
            : train.position.signalAspect === 'DOUBLE_YELLOW'
            ? 'Caution: Expect next signal at Yellow; train decelerating on station home approach.'
            : 'Restrictive aspect; running speed constrained to yard caution limits.',
        category: 'SIGNAL'
      }
    ];

    // Add Historical Delay Context
    if (historicalContext.isCurrentSectionAvailable && historicalContext.hasSufficientData) {
      contributingFactors.push({
        factorKey: 'HISTORICAL_DELAY_CONTEXT',
        label: `Historical Delay Context (${historicalContext.currentSectionLabel})`,
        value:
          historicalContext.overallHistoricalDelayBiasMinutes > 0
            ? `+${historicalContext.overallHistoricalDelayBiasMinutes} min Context (${historicalContext.dominantVariability} Variability)`
            : `Aligned with Timetable (${historicalContext.dominantVariability} Variability)`,
        impactDescription: `${historicalContext.explanationText} [Data Provenance: ${historicalContext.dataProvenance}]`,
        category: 'HISTORICAL'
      });
    } else if (historicalContext.isCurrentSectionAvailable && !historicalContext.hasSufficientData) {
      contributingFactors.push({
        factorKey: 'HISTORICAL_DELAY_CONTEXT',
        label: `Historical Delay Context (${historicalContext.currentSectionLabel})`,
        value: `Insufficient Data (${historicalContext.sampleCount} run${historicalContext.sampleCount === 1 ? '' : 's'})`,
        impactDescription: `${historicalContext.explanationText} [Data Provenance: ${historicalContext.dataProvenance}]`,
        category: 'HISTORICAL'
      });
    } else {
      contributingFactors.push({
        factorKey: 'HISTORICAL_DELAY_CONTEXT',
        label: `Historical Delay Context (${historicalContext.currentSectionLabel || 'Active Section'})`,
        value: 'Unavailable for current section',
        impactDescription: `${historicalContext.explanationText} [Data Provenance: ${historicalContext.dataProvenance}]`,
        category: 'HISTORICAL'
      });
    }

    // Append active operational stress conditions (only when active!)
    if (activeFactors.length > 0) {
      activeFactors.forEach((factor) => {
        const isTrackBlock = factor.conditionType === 'TRACK_BLOCK';
        contributingFactors.unshift({
          factorKey: `SCENARIO_${factor.conditionType}_${factor.sectionKey}`,
          label: isTrackBlock
            ? `Track Block: ${factor.sectionLabel} (${operationalHoldState})`
            : `Active Stress: ${factor.sectionLabel}`,
          value: `+${factor.travelTimeImpactMinutes} min Impact`,
          impactDescription:
            isTrackBlock && operationalHoldState === 'HOLD'
              ? `Train held due to active track block on ${factor.sectionLabel}. Progression paused.`
              : factor.detail,
          category: factor.conditionType === 'SPEED_RESTRICTION' ? 'SPEED' : 'SECTION'
        });
      });
    }

    // 8. Strict Data Provenance
    const dataSource = 'Replay / Test Mode (Simulated Telemetry — Not Live Railway Data)';
    const provenanceType = 'REPLAY / TEST MODE';
    const isLive = false;

    const nowIST = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return {
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      generatedAt: `${nowIST} IST`,
      dataSource,
      dataProvenanceType: provenanceType,
      isLiveFeed: isLive,
      destinationStationCode: destinationStop.stationCode,
      destinationStationName: destinationStop.stationName,
      scheduledDestinationETA: train.scheduledArrivalTime,
      baselineDestinationETA,
      dynamicDestinationETA,
      currentAccumulatedDelayMinutes: currentDelay,
      predictedDelayMinutes,
      etaDifferenceMinutes,
      etaStatus,
      etaTrend,
      etaTrendLabel,
      upcomingStationPredictions: stationPredictions,
      allStationPredictions,
      sections,
      calculationMethod:
        'Deterministic Route Section Traversal & Velocity Differential Model (SIH 26028 Core)',
      contributingFactors,
      scenarioImpact,
      congestionImpactMinutes: totalCongestionImpact,
      speedRestrictionImpactMinutes: totalSpeedRestrictionImpact,
      unscheduledStopImpactMinutes: totalUnscheduledStopImpact,
      trackBlockImpactMinutes: totalTrackBlockImpact,
      historicalContext,
      historicalBiasMinutes: historicalContext.overallHistoricalDelayBiasMinutes,
      operationalHoldState,
      operationalHoldExplanation
    };
  }
}
