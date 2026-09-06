import React, { useState } from 'react';
import {
  Clock,
  TrendingDown,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldAlert,
  Info,
  Layers,
  Gauge,
  MapPin,
  ChevronDown,
  ChevronUp,
  Radio,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DynamicETAPrediction, ETAPredictionStatus } from '../../types/eta';
import { Train } from '../../types/train';

interface DynamicETAForecastCardProps {
  prediction: DynamicETAPrediction;
  train: Train;
}

export const DynamicETAForecastCard: React.FC<DynamicETAForecastCardProps> = ({
  prediction,
  train
}) => {
  const [showSectionDetails, setShowSectionDetails] = useState(false);
  const [showFactors, setShowFactors] = useState(false);

  const getStatusBadge = (status: ETAPredictionStatus) => {
    switch (status) {
      case 'ON_TRACK':
        return {
          label: 'ON TRACK',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        };
      case 'RECOVERY_EXPECTED':
        return {
          label: 'RECOVERY EXPECTED',
          bg: 'bg-teal-500/10 text-teal-300 border-teal-500/30'
        };
      case 'MINOR_DELAY':
        return {
          label: 'MINOR DELAY',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        };
      case 'SIGNIFICANT_DELAY':
        return {
          label: 'SIGNIFICANT DELAY',
          bg: 'bg-red-500/10 text-red-400 border-red-500/30'
        };
    }
  };

  const statusBadge = getStatusBadge(prediction.etaStatus);

  return (
    <div
      id="dynamic-eta-forecast-container"
      className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-2xl space-y-6 relative overflow-hidden"
    >
      {/* Top Banner & Provenance */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                DYNAMIC ETA FORECAST
              </h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider border ${statusBadge.bg}`}
              >
                {statusBadge.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Deterministic Traversal & Velocity Differential Model · Generated {prediction.generatedAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Data Source:</span>
          <span
            className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
              prediction.dataProvenanceType === 'REPLAY / TEST MODE'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-700'
            }`}
          >
            {prediction.dataSource}
          </span>
        </div>
      </div>

      {/* Operational Hold Banner (Active Track / Line Block) */}
      {prediction.operationalHoldState === 'HOLD' && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 flex items-start gap-3 text-red-300 font-mono text-xs shadow-lg shadow-red-950/40">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold tracking-wider uppercase">
                OPERATIONAL HOLD ENFORCED
              </span>
              <span className="text-white font-bold">Track / Line Block Active</span>
              <span className="text-red-400 text-[11px]">Speed: 0 km/h · Signal: RED</span>
            </div>
            <p className="text-red-200/90 text-xs font-sans leading-relaxed">
              {prediction.operationalHoldExplanation || 'Train movement paused at blocked section entrance. Replay progression is held until block is cleared.'}
            </p>
          </div>
        </div>
      )}

      {/* Upcoming Operational Hold Notice (Approaching Blocked Section) */}
      {prediction.operationalHoldState === 'BLOCKED' && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 flex items-start gap-3 text-amber-300 font-mono text-xs shadow-lg shadow-amber-950/40">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold tracking-wider uppercase">
                UPCOMING TRACK BLOCK AHEAD
              </span>
              <span className="text-white font-bold">Cautionary Advisory</span>
            </div>
            <p className="text-amber-200/90 text-xs font-sans leading-relaxed">
              {prediction.operationalHoldExplanation || 'Track block active on upcoming section. Train will enter operational hold upon arrival at the blocked section entrance.'}
            </p>
          </div>
        </div>
      )}

      {/* Primary 4-Metric Comparison Stage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Metric 1: Dynamic Prediction (Destination) */}
        <div className="rounded-lg border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent p-4 relative">
          <div className="flex items-center justify-between text-[11px] text-amber-400 uppercase tracking-wider mb-1 font-bold">
            <span>Dynamic Prediction</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {prediction.dynamicDestinationETA}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Dest: {prediction.destinationStationCode}</span>
            <span className="text-amber-300 font-bold">
              {prediction.predictedDelayMinutes > 0
                ? `+${prediction.predictedDelayMinutes} min expected`
                : 'On Time'}
            </span>
          </div>
        </div>

        {/* Metric 2: Schedule + Current Delay Baseline */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider mb-1">
            <span>Baseline (Sched + Delay)</span>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-300 tracking-tight">
            {prediction.baselineDestinationETA}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Scheduled: {prediction.scheduledDestinationETA}</span>
            <span>+{prediction.currentAccumulatedDelayMinutes}m baseline</span>
          </div>
        </div>

        {/* Metric 3: Expected Delay at Destination */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider mb-1">
            <span>Expected Delay</span>
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              prediction.predictedDelayMinutes === 0
                ? 'text-emerald-400'
                : prediction.predictedDelayMinutes <= 15
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {prediction.predictedDelayMinutes > 0
              ? `+${prediction.predictedDelayMinutes} min`
              : '0 min'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Current station delay: +{prediction.currentAccumulatedDelayMinutes} min
          </div>
        </div>

        {/* Metric 4: ETA Difference & Trend */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider mb-1">
            <span>Dynamic vs Baseline</span>
            {prediction.etaTrend === 'RECOVERY' ? (
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            ) : prediction.etaTrend === 'ADDITIONAL_DELAY' ? (
              <TrendingUp className="w-4 h-4 text-orange-400" />
            ) : (
              <Activity className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              prediction.etaDifferenceMinutes < 0
                ? 'text-emerald-400'
                : prediction.etaDifferenceMinutes > 0
                ? 'text-orange-400'
                : 'text-slate-300'
            }`}
          >
            {prediction.etaDifferenceMinutes > 0
              ? `+${prediction.etaDifferenceMinutes} min`
              : prediction.etaDifferenceMinutes < 0
              ? `${prediction.etaDifferenceMinutes} min`
              : '0 min'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {prediction.etaTrendLabel}
          </div>
        </div>
      </div>

      {/* LIVE ETA TIMELINE (Ordered Station Progression) */}
      <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Live ETA Forecast Timeline ({prediction.upcomingStationPredictions.length} Upcoming Milestones)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Chronologically validated monotonicity
          </span>
        </div>

        {/* Timeline Items */}
        <div className="space-y-2 pt-1">
          {/* Current Position Marker */}
          <div
            className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-mono border transition-all ${
              prediction.operationalHoldState === 'HOLD'
                ? 'bg-red-500/15 border-red-500/50 shadow-md shadow-red-950/40'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full shrink-0 ${
                prediction.operationalHoldState === 'HOLD'
                  ? 'bg-red-500 animate-pulse ring-2 ring-red-400/50'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold uppercase tracking-wider block text-[10px] ${
                    prediction.operationalHoldState === 'HOLD' ? 'text-red-300' : 'text-amber-300'
                  }`}
                >
                  {prediction.operationalHoldState === 'HOLD'
                    ? 'CURRENT POSITION — OPERATIONAL HOLD ACTIVE'
                    : 'CURRENT OPERATIONAL POSITION'}
                </span>
                {prediction.operationalHoldState === 'HOLD' && (
                  <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-bold">
                    PAUSED
                  </span>
                )}
              </div>
              <span className="text-slate-200 truncate block">
                {train.position.currentLocationDescription}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`font-bold block ${
                  prediction.operationalHoldState === 'HOLD' ? 'text-red-400' : 'text-amber-400'
                }`}
              >
                {train.position.speedKmph} km/h
              </span>
              <span className="text-[10px] text-slate-400">
                Aspect:{' '}
                <strong
                  className={
                    prediction.operationalHoldState === 'HOLD'
                      ? 'text-red-400 font-bold'
                      : 'text-slate-200'
                  }
                >
                  {train.position.signalAspect || 'GREEN'}
                </strong>
              </span>
            </div>
          </div>

          {/* Upcoming Stations in sequence */}
          <div className="divide-y divide-slate-800/60 font-mono text-xs">
            {prediction.upcomingStationPredictions.map((stn, idx) => {
              const isNext = stn.status === 'NEXT';
              const isDest = stn.isDestination;

              return (
                <div
                  key={stn.stationCode}
                  className={`py-3 px-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition rounded ${
                    isNext
                      ? 'bg-blue-500/5 border-l-2 border-blue-400 pl-3'
                      : isDest
                      ? 'bg-slate-900/40 border-l-2 border-amber-400 pl-3'
                      : 'hover:bg-slate-900/20'
                  }`}
                >
                  {/* Left: Station Identity */}
                  <div className="flex items-center gap-3 min-w-[220px]">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isDest
                          ? 'bg-amber-500 text-slate-950'
                          : isNext
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {stn.stopNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{stn.stationCode}</span>
                        <span className="text-slate-400 font-sans truncate max-w-[150px]">
                          {stn.stationName}
                        </span>
                        {isNext && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-bold">
                            NEXT
                          </span>
                        )}
                        {isDest && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                            DESTINATION
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {stn.distanceFromCurrentKm} km away · Scheduled Halt: {stn.haltMinutes}m
                      </span>
                    </div>
                  </div>

                  {/* Right: Comparative Predictions */}
                  <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto text-[11px]">
                    {/* Scheduled */}
                    <div className="text-right">
                      <span className="text-slate-500 text-[9px] uppercase block">Scheduled</span>
                      <span className="text-slate-400">{stn.scheduledArrival}</span>
                    </div>

                    {/* Baseline */}
                    <div className="text-right">
                      <span className="text-slate-500 text-[9px] uppercase block">Baseline ETA</span>
                      <span className="text-slate-300">{stn.baselineArrival}</span>
                    </div>

                    {/* Dynamic Prediction */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-amber-400 text-[9px] uppercase font-bold block">
                        Dynamic ETA
                      </span>
                      <span className="text-white font-bold text-sm">
                        {stn.dynamicArrival}
                      </span>
                    </div>

                    {/* Variance / Difference Badge */}
                    <div className="min-w-[80px] text-right">
                      <span className="text-slate-500 text-[9px] uppercase block">Variance</span>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          stn.etaDifferenceMinutes < 0
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : stn.etaDifferenceMinutes > 0
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {stn.etaDifferenceMinutes > 0
                          ? `+${stn.etaDifferenceMinutes}m`
                          : stn.etaDifferenceMinutes < 0
                          ? `${stn.etaDifferenceMinutes}m`
                          : '0m'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Accordion 1: Section-Based Route Traversal Breakdown */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/40 overflow-hidden">
        <button
          onClick={() => setShowSectionDetails(!showSectionDetails)}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/40 transition font-mono text-xs"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              Section-Based Traversal & Velocity Ledger ({prediction.sections.length} Route Sections)
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>{showSectionDetails ? 'Hide Section Matrix' : 'Inspect Section Matrix'}</span>
            {showSectionDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showSectionDetails && (
          <div className="p-4 border-t border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-3">Section</th>
                  <th className="py-2 px-3">Distance</th>
                  <th className="py-2 px-3">Sched Travel</th>
                  <th className="py-2 px-3">Booking Speed</th>
                  <th className="py-2 px-3">Effective Speed</th>
                  <th className="py-2 px-3">Op. Adjustment</th>
                  <th className="py-2 px-3">Est Travel</th>
                  <th className="py-2 px-3">Pred Arrival</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {prediction.sections.map((sec) => {
                  const isBlocked = !!sec.isTrackBlocked;
                  return (
                    <tr
                      key={`${sec.fromStationCode}-${sec.toStationCode}`}
                      className={`hover:bg-slate-900/30 transition ${
                        isBlocked
                          ? 'bg-red-500/10 border-l-2 border-red-500 text-red-200'
                          : sec.isCurrentActiveSection
                          ? 'bg-amber-500/10 border-l-2 border-amber-500'
                          : sec.status === 'COMPLETED'
                          ? 'opacity-60 bg-slate-950/40'
                          : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-200">
                          {sec.fromStationCode} → {sec.toStationCode}
                        </span>
                        {isBlocked && (
                          <span className="ml-2 px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-bold">
                            BLOCKED (+20m Hold)
                          </span>
                        )}
                        {sec.isCurrentActiveSection && !isBlocked && (
                          <span className="ml-2 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                            ACTIVE
                          </span>
                        )}
                        {sec.status === 'COMPLETED' && (
                          <span className="ml-2 text-slate-500 text-[9px]">PAST</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{sec.distanceKm} km</td>
                      <td className="py-2.5 px-3 text-slate-400">{sec.scheduledTravelMinutes} min</td>
                      <td className="py-2.5 px-3 text-slate-400">{sec.scheduledAverageSpeedKmph} km/h</td>
                      <td className="py-2.5 px-3 font-bold text-amber-400">
                        {isBlocked ? (
                          <span className="text-red-400 font-bold">0 km/h (HOLD)</span>
                        ) : (
                          `${sec.effectiveSpeedKmph} km/h`
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-bold ${
                            isBlocked
                              ? 'text-red-400'
                              : sec.operationalAdjustmentMinutes < 0
                              ? 'text-emerald-400'
                              : sec.operationalAdjustmentMinutes > 0
                              ? 'text-orange-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {sec.operationalAdjustmentMinutes > 0
                            ? `+${sec.operationalAdjustmentMinutes}m`
                            : sec.operationalAdjustmentMinutes < 0
                            ? `${sec.operationalAdjustmentMinutes}m`
                            : '0m'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-200 font-bold">{sec.estimatedTravelMinutes} min</td>
                      <td className="py-2.5 px-3 text-amber-300 font-bold">{sec.predictedArrivalTime}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accordion 2: Prediction Factors & Historical Delay Intelligence */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/40 overflow-hidden">
        <button
          onClick={() => setShowFactors(!showFactors)}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/40 transition font-mono text-xs"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              Prediction Factors & Historical Delay Intelligence
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>{showFactors ? 'Hide Factors' : 'Inspect Explanation Factors'}</span>
            {showFactors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showFactors && (
          <div className="p-4 border-t border-slate-800 space-y-4">
            {/* Calculation Methodology Header */}
            <div className="p-3 rounded bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
              <span className="text-amber-400 font-bold block uppercase text-[10px]">
                Engine Specification
              </span>
              <div>
                <strong>Method:</strong> {prediction.calculationMethod}
              </div>
              <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                Dynamic ETA calculates transit time across remaining route sections using the train&apos;s real-time instantaneous speed, signal aspect restrictions, and timetabled engineering recovery margins, rather than copying static delays to the destination.
              </p>
            </div>

            {/* Historical Delay Intelligence Sub-Panel */}
            {prediction.historicalContext && (
              <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-800/40 space-y-3 font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-800/30 pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-blue-200 uppercase tracking-wider text-xs">
                      Historical Delay Intelligence: Current Section ({prediction.historicalContext.currentSectionLabel || 'Active Section'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {prediction.historicalContext.isCurrentSectionAvailable ? (
                      <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50 text-[10px] font-bold">
                        ACTIVE SECTION: {prediction.historicalContext.currentSectionLabel} · TEST / SIMULATION
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-800/50 text-[10px] font-bold">
                        Unavailable for current section
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Sample Runs</span>
                    <span className="text-white font-bold text-sm">
                      {prediction.historicalContext.isCurrentSectionAvailable
                        ? `${prediction.historicalContext.sampleCount} Runs`
                        : '0'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Median Delay</span>
                    <span className="text-amber-400 font-bold text-sm">
                      {prediction.historicalContext.isCurrentSectionAvailable &&
                      prediction.historicalContext.overallMedianDelayMinutes !== null
                        ? `+${prediction.historicalContext.overallMedianDelayMinutes} min`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">90th Percentile (P90)</span>
                    <span className="text-orange-400 font-bold text-sm">
                      {prediction.historicalContext.isCurrentSectionAvailable &&
                      prediction.historicalContext.overallP90DelayMinutes !== null
                        ? `+${prediction.historicalContext.overallP90DelayMinutes} min`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Variability</span>
                    <span className="text-blue-300 font-bold text-sm">
                      {prediction.historicalContext.isCurrentSectionAvailable
                        ? prediction.historicalContext.dominantVariability
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Section-specific Explanation Text */}
                <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
                  {prediction.historicalContext.explanationText}
                </p>

                {/* Section-by-Section Historical Statistics Table */}
                {prediction.historicalContext.sectionProfiles.length > 0 ? (
                  <div className="overflow-x-auto pt-1">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/40 text-[9px] text-slate-400 uppercase tracking-wider">
                          <th className="py-1.5 px-2.5">Section</th>
                          <th className="py-1.5 px-2.5">History Samples</th>
                          <th className="py-1.5 px-2.5">Median Delay</th>
                          <th className="py-1.5 px-2.5">P90 Delay</th>
                          <th className="py-1.5 px-2.5">Pattern</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-slate-300">
                        {prediction.historicalContext.sectionProfiles.map((sec) => {
                          const isActive = sec.sectionKey === prediction.historicalContext.currentSectionKey;
                          return (
                            <tr
                              key={sec.sectionKey}
                              className={
                                isActive
                                  ? 'bg-amber-500/10 border-l-2 border-amber-400 font-semibold'
                                  : 'hover:bg-slate-900/30'
                              }
                            >
                              <td className="py-1.5 px-2.5 font-bold text-slate-200">
                                {sec.sectionKey}
                                {isActive && (
                                  <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                    CURRENT ACTIVE SECTION
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 px-2.5 text-slate-400">{sec.sampleCount} runs</td>
                              <td className="py-1.5 px-2.5 text-amber-400 font-bold">+{sec.medianDelayMinutes}m</td>
                              <td className="py-1.5 px-2.5 text-orange-400">
                                {sec.percentile90DelayMinutes !== null ? `+${sec.percentile90DelayMinutes}m` : 'N/A'}
                              </td>
                              <td className="py-1.5 px-2.5">
                                <span className="text-[10px] text-slate-300">{sec.delayTendencyLabel}</span>
                                <span className="text-[9px] text-slate-500 ml-1">({sec.variability})</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 italic">
                    No historical simulation records available for this route.
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-900/30 text-[10px] text-slate-400">
                  <span>
                    Data Source: <strong className="text-slate-300">{prediction.historicalContext.dataProvenance}</strong>
                  </span>
                  <span className="italic text-slate-500">
                    Evaluation requires verified historical ground-truth data.
                  </span>
                </div>
              </div>
            )}

            {/* Contributing Factors Cards */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-bold">
                Active Prediction Factors
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {prediction.contributingFactors.map((f) => (
                  <div
                    key={f.factorKey}
                    className="p-3 rounded bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-1"
                  >
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      {f.label}
                    </span>
                    <div className="text-white font-bold">{f.value}</div>
                    <p className="text-[11px] text-slate-400 font-sans leading-snug">
                      {f.impactDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compliance & Data Integrity Notice */}
      <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-[11px] font-mono text-slate-400 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300">DATA INTEGRITY COMPLIANCE: </strong>
          Dynamic predictions update dynamically as train state advances. Values reflect calculated physical and sectional route progression.
          {prediction.dataProvenanceType === 'REPLAY / TEST MODE' && (
            <span className="text-amber-400 font-semibold ml-1">
              Operating under REPLAY / TEST MODE (Simulated Telemetry).
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
