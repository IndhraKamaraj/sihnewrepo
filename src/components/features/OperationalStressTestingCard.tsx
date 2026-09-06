import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Gauge,
  Sliders,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { Train } from '../../types/train';
import {
  CongestionLevel,
  DynamicETAPrediction,
  RouteSection
} from '../../types/eta';
import { operationalScenarioService } from '../../services/OperationalScenarioService';
import { DynamicETAEngine } from '../../services/DynamicETAEngine';

interface OperationalStressTestingCardProps {
  train: Train;
  currentPrediction: DynamicETAPrediction;
  onScenarioChange?: () => void;
}

export const OperationalStressTestingCard: React.FC<OperationalStressTestingCardProps> = ({
  train,
  currentPrediction,
  onScenarioChange
}) => {
  // Get upcoming sections for this train
  const upcomingSections = currentPrediction.sections.filter(
    (s) => s.status === 'ACTIVE' || s.status === 'UPCOMING'
  );

  // Active section selection
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>(() => {
    return upcomingSections[0]
      ? `${upcomingSections[0].fromStationCode}-${upcomingSections[0].toStationCode}`
      : '';
  });

  // Reset section key when selected train changes
  useEffect(() => {
    if (upcomingSections[0]) {
      setSelectedSectionKey(`${upcomingSections[0].fromStationCode}-${upcomingSections[0].toStationCode}`);
    } else {
      setSelectedSectionKey('');
    }
  }, [train.trainNumber]);

  // Keep selection valid if sections update
  const effectiveSectionKey =
    upcomingSections.some(
      (s) => `${s.fromStationCode}-${s.toStationCode}` === selectedSectionKey
    )
      ? selectedSectionKey
      : upcomingSections[0]
      ? `${upcomingSections[0].fromStationCode}-${upcomingSections[0].toStationCode}`
      : '';

  const activeSection = upcomingSections.find(
    (s) => `${s.fromStationCode}-${s.toStationCode}` === effectiveSectionKey
  );

  // Query current override for selected section
  const currentOverride = effectiveSectionKey
    ? operationalScenarioService.getSectionOverride(train.trainNumber, effectiveSectionKey)
    : undefined;

  const currentCongestion: CongestionLevel = currentOverride?.congestion || 'NORMAL';
  const currentSpeedLimit = currentOverride?.speedRestrictionKmph;
  const currentUnscheduledStop = currentOverride?.unscheduledStopMinutes || 0;
  const isTrackBlocked = !!currentOverride?.isTrackBlocked;

  const scenarioSummary = currentPrediction.scenarioImpact || {
    isScenarioActive: false,
    activeConditionSummary: 'NORMAL',
    activeFactors: [],
    upcomingStationImpactMinutes: 0,
    destinationImpactMinutes: 0,
    baselineDestinationETA: currentPrediction.baselineDestinationETA,
    scenarioDestinationETA: currentPrediction.dynamicDestinationETA,
    destinationDifferenceMinutes: currentPrediction.etaDifferenceMinutes
  };

  // Handlers for Operational Stress Controls
  const handleCongestionChange = (level: CongestionLevel) => {
    if (!activeSection) return;
    operationalScenarioService.setSectionCongestion(
      train.trainNumber,
      effectiveSectionKey,
      activeSection.fromStationCode,
      activeSection.toStationCode,
      level
    );
    onScenarioChange?.();
  };

  const handleSpeedLimitChange = (speed?: number) => {
    if (!activeSection) return;
    operationalScenarioService.setSpeedRestriction(
      train.trainNumber,
      effectiveSectionKey,
      activeSection.fromStationCode,
      activeSection.toStationCode,
      speed
    );
    onScenarioChange?.();
  };

  const handleUnscheduledStopChange = (minutes?: number) => {
    if (!activeSection) return;
    operationalScenarioService.setUnscheduledStop(
      train.trainNumber,
      effectiveSectionKey,
      activeSection.fromStationCode,
      activeSection.toStationCode,
      minutes
    );
    onScenarioChange?.();
  };

  const handleTrackBlockToggle = () => {
    if (!activeSection) return;
    operationalScenarioService.setTrackBlock(
      train.trainNumber,
      effectiveSectionKey,
      activeSection.fromStationCode,
      activeSection.toStationCode,
      !isTrackBlocked,
      20
    );
    onScenarioChange?.();
  };

  const handleResetSection = () => {
    if (!activeSection) return;
    operationalScenarioService.setSectionCongestion(
      train.trainNumber,
      effectiveSectionKey,
      activeSection.fromStationCode,
      activeSection.toStationCode,
      'NORMAL'
    );
    operationalScenarioService.setSpeedRestriction(
      train.trainNumber,
      effectiveSectionKey,
      activeSection.fromStationCode,
      activeSection.toStationCode,
      undefined
    );
    operationalScenarioService.setUnscheduledStop(
      train.trainNumber,
      effectiveSectionKey,
      activeSection.fromStationCode,
      activeSection.toStationCode,
      undefined
    );
    operationalScenarioService.setTrackBlock(
      train.trainNumber,
      effectiveSectionKey,
      activeSection.fromStationCode,
      activeSection.toStationCode,
      false
    );
    onScenarioChange?.();
  };

  const handleResetEntireScenario = () => {
    operationalScenarioService.resetScenario(train.trainNumber);
    onScenarioChange?.();
  };

  const hasAnyActiveScenarios = operationalScenarioService.hasActiveScenario(train.trainNumber);

  return (
    <div
      id={`stress-testing-card-${train.trainNumber}`}
      className="bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl"
    >
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                Operational Stress Testing
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-950 text-blue-300 border border-blue-800/60">
                TRAIN {train.trainNumber}
              </span>
              {hasAnyActiveScenarios && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  SCENARIO ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Inject real physical section disturbances to evaluate dynamic arrival propagation.
            </p>
          </div>
        </div>

        {/* Action: Reset Entire Scenario */}
        <button
          id="btn-reset-entire-scenario"
          onClick={handleResetEntireScenario}
          disabled={!hasAnyActiveScenarios}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            hasAnyActiveScenarios
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 hover:border-slate-500 shadow-sm cursor-pointer'
              : 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
          }`}
          title="Remove all injected operational conditions and restore original baseline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Scenario
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Section Selector Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Target Upcoming Route Section:
            </label>
            {activeSection && (
              <span className="text-xs font-mono text-slate-400">
                {activeSection.distanceKm} km · Scheduled {activeSection.scheduledTravelMinutes}m · Track MPS {activeSection.maxPermissibleSpeedKmph} km/h
              </span>
            )}
          </div>

          {upcomingSections.length === 0 ? (
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-xs text-slate-400">
              Train is at or beyond final terminus. No forward sections available for stress testing.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {upcomingSections.map((sec) => {
                const key = `${sec.fromStationCode}-${sec.toStationCode}`;
                const isSelected = key === effectiveSectionKey;
                const override = operationalScenarioService.getSectionOverride(train.trainNumber, key);
                const isCongested = override?.congestion && override.congestion !== 'NORMAL';
                const isSpeedRestricted = !!override?.speedRestrictionKmph;
                const isStopped = !!override?.unscheduledStopMinutes;
                const isBlocked = !!override?.isTrackBlocked;
                const hasConditions = isCongested || isSpeedRestricted || isStopped || isBlocked;

                return (
                  <button
                    key={key}
                    id={`btn-select-section-${key}`}
                    onClick={() => setSelectedSectionKey(key)}
                    className={`p-2.5 rounded-lg text-left border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-500 text-blue-100 shadow-md ring-1 ring-blue-500/50'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-slate-100">
                        {sec.fromStationCode} → {sec.toStationCode}
                      </span>
                      {sec.isCurrentActiveSection && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-mono">
                      <span>{sec.distanceKm} km</span>
                      {hasConditions ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          Conditions
                        </span>
                      ) : (
                        <span className="text-emerald-500/80">Normal</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Section Controls Grid */}
        {activeSection && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Configuring Section:
                </span>
                <span className="text-sm font-mono font-bold text-blue-300">
                  {activeSection.fromStationCode} ({activeSection.fromStationName}) → {activeSection.toStationCode} ({activeSection.toStationName})
                </span>
              </div>
              <button
                id="btn-reset-section-conditions"
                onClick={handleResetSection}
                className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors"
              >
                Clear this section
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CONTROL A: Section Congestion */}
              <div className="space-y-1.5 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    A. Section Congestion
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {currentCongestion}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {(['NORMAL', 'MODERATE', 'HEAVY', 'SEVERE'] as CongestionLevel[]).map((lvl) => {
                    const isSelected = currentCongestion === lvl;
                    return (
                      <button
                        key={lvl}
                        id={`btn-congestion-${lvl.toLowerCase()}`}
                        onClick={() => handleCongestionChange(lvl)}
                        className={`py-1.5 px-2 rounded text-xs font-medium transition-all ${
                          isSelected
                            ? lvl === 'NORMAL'
                              ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-600 font-bold'
                              : lvl === 'MODERATE'
                              ? 'bg-amber-900/70 text-amber-200 border border-amber-500 font-bold'
                              : lvl === 'HEAVY'
                              ? 'bg-orange-900/80 text-orange-200 border border-orange-500 font-bold'
                              : 'bg-red-900/80 text-red-200 border border-red-500 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                        }`}
                      >
                        {lvl === 'NORMAL' ? 'Normal' : lvl === 'MODERATE' ? 'Moderate' : lvl === 'HEAVY' ? 'Heavy' : 'Severe'}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 pt-0.5">
                  Reduces section velocity; increases traversal time by +25% to +125%.
                </p>
              </div>

              {/* CONTROL B: Speed Restriction */}
              <div className="space-y-1.5 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-blue-400" />
                    B. Speed Restriction
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {currentSpeedLimit ? `${currentSpeedLimit} km/h` : 'None'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 pt-1">
                  <button
                    id="btn-speed-limit-none"
                    onClick={() => handleSpeedLimitChange(undefined)}
                    className={`py-1.5 px-1 rounded text-xs font-medium transition-all text-center ${
                      !currentSpeedLimit
                        ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-600 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                    }`}
                  >
                    Off
                  </button>
                  {[60, 50, 40].map((spd) => {
                    const isSelected = currentSpeedLimit === spd;
                    return (
                      <button
                        key={spd}
                        id={`btn-speed-limit-${spd}`}
                        onClick={() => handleSpeedLimitChange(spd)}
                        className={`py-1.5 px-1 rounded text-xs font-medium transition-all text-center ${
                          isSelected
                            ? 'bg-blue-900/80 text-blue-200 border border-blue-400 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                        }`}
                      >
                        {spd}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 pt-0.5">
                  Imposes caution limit (60/50/40 km/h). Traversal time recalculates physically.
                </p>
              </div>

              {/* CONTROL C: Unscheduled Stop */}
              <div className="space-y-1.5 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    C. Unscheduled Stop
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {currentUnscheduledStop > 0 ? `+${currentUnscheduledStop} min` : 'None'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 pt-1">
                  <button
                    id="btn-unscheduled-stop-none"
                    onClick={() => handleUnscheduledStopChange(undefined)}
                    className={`py-1.5 px-1 rounded text-xs font-medium transition-all text-center ${
                      currentUnscheduledStop === 0
                        ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-600 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                    }`}
                  >
                    0m
                  </button>
                  {[2, 5, 10].map((mins) => {
                    const isSelected = currentUnscheduledStop === mins;
                    return (
                      <button
                        key={mins}
                        id={`btn-unscheduled-stop-${mins}`}
                        onClick={() => handleUnscheduledStopChange(mins)}
                        className={`py-1.5 px-1 rounded text-xs font-medium transition-all text-center ${
                          isSelected
                            ? 'bg-purple-900/80 text-purple-200 border border-purple-400 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                        }`}
                      >
                        +{mins}m
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 pt-0.5">
                  Adds intermediate technical halt; shifts downstream departure timing.
                </p>
              </div>

              {/* CONTROL D: Track / Line Block */}
              <div className="space-y-1.5 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    D. Track / Line Block
                  </label>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      isTrackBlocked ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    {isTrackBlocked ? 'BLOCKED' : 'Open'}
                  </span>
                </div>
                <div className="pt-1">
                  <button
                    id="btn-track-block-toggle"
                    onClick={handleTrackBlockToggle}
                    className={`w-full py-1.5 px-3 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isTrackBlocked
                        ? 'bg-rose-900/90 text-rose-100 border border-rose-500 shadow-md ring-1 ring-rose-500/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {isTrackBlocked ? 'Block Active (+20m Hold)' : 'Inject Track Block'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 pt-0.5">
                  Simulates single-line clearance / maintenance hold (+20 min deterministic delay).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Operational Impact Panel & Scenario Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          {/* Current Conditions & Predicted Impact */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Current Conditions
              </h4>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  scenarioSummary.activeConditionSummary === 'NORMAL'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : scenarioSummary.activeConditionSummary === 'CONGESTED'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : scenarioSummary.activeConditionSummary === 'RESTRICTED'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {scenarioSummary.activeConditionSummary}
              </span>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Upcoming Station Impact:</span>
                <span
                  className={`font-mono font-bold ${
                    scenarioSummary.upcomingStationImpactMinutes > 0
                      ? 'text-amber-400'
                      : scenarioSummary.upcomingStationImpactMinutes < 0
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                  }`}
                >
                  {scenarioSummary.upcomingStationImpactMinutes > 0
                    ? `+${scenarioSummary.upcomingStationImpactMinutes} min`
                    : scenarioSummary.upcomingStationImpactMinutes < 0
                    ? `${scenarioSummary.upcomingStationImpactMinutes} min`
                    : '0 min (On Schedule)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Destination Impact:</span>
                <span
                  className={`font-mono font-bold ${
                    scenarioSummary.destinationImpactMinutes > 0
                      ? 'text-rose-400'
                      : scenarioSummary.destinationImpactMinutes < 0
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                  }`}
                >
                  {scenarioSummary.destinationImpactMinutes > 0
                    ? `+${scenarioSummary.destinationImpactMinutes} min`
                    : scenarioSummary.destinationImpactMinutes < 0
                    ? `${scenarioSummary.destinationImpactMinutes} min`
                    : '0 min'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300 block mb-0.5">
                Dynamic Response:
              </span>
              {scenarioSummary.isScenarioActive
                ? `Injected disturbances immediately recalculated section run times and propagated through ${currentPrediction.upcomingStationPredictions.length} upcoming stations.`
                : 'Operating under nominal route kinematics. No operational stress conditions injected.'}
            </div>
          </div>

          {/* Scenario Comparison: Baseline vs Dynamic Prediction */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Scenario Comparison: Baseline vs Active Scenario
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                To {currentPrediction.destinationStationCode} ({currentPrediction.destinationStationName})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800/80">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Baseline Destination ETA
                </span>
                <span className="text-sm font-mono font-bold text-slate-200 mt-0.5 block">
                  {scenarioSummary.baselineDestinationETA}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  (Sched + {currentPrediction.currentAccumulatedDelayMinutes}m Delay)
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-blue-400 block uppercase font-semibold">
                  Active Dynamic ETA
                </span>
                <span className="text-sm font-mono font-bold text-blue-300 mt-0.5 block">
                  {scenarioSummary.scenarioDestinationETA}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  (Dynamic Physics + Scenarios)
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Model Difference
                </span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  {scenarioSummary.destinationDifferenceMinutes > 0 ? (
                    <TrendingUp className="w-4 h-4 text-rose-400" />
                  ) : scenarioSummary.destinationDifferenceMinutes < 0 ? (
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  )}
                  <span
                    className={`text-sm font-mono font-bold ${
                      scenarioSummary.destinationDifferenceMinutes > 0
                        ? 'text-rose-400'
                        : scenarioSummary.destinationDifferenceMinutes < 0
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {scenarioSummary.destinationDifferenceMinutes > 0
                      ? `+${scenarioSummary.destinationDifferenceMinutes}m`
                      : scenarioSummary.destinationDifferenceMinutes < 0
                      ? `${scenarioSummary.destinationDifferenceMinutes}m`
                      : '0m'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {scenarioSummary.destinationDifferenceMinutes > 0
                    ? 'Delay Expansion'
                    : scenarioSummary.destinationDifferenceMinutes < 0
                    ? 'Recovery Expected'
                    : 'Exact Baseline Match'}
                </span>
              </div>
            </div>

            {/* Active Operational Factors breakdown */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Active Operational Factors ({scenarioSummary.activeFactors.length}):
              </span>
              {scenarioSummary.activeFactors.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No active operational disturbances injected. Running on standard velocity & timetable slack model.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scenarioSummary.activeFactors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-900/90 border border-slate-800 text-xs flex items-start gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-200 truncate">
                            {factor.sectionLabel}
                          </span>
                          <span className="font-mono font-semibold text-rose-400 shrink-0">
                            +{factor.travelTimeImpactMinutes}m
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {factor.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
