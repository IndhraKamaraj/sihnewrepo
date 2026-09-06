import React from 'react';
import {
  BarChart3,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Database,
  Gauge,
  Clock,
  Layers,
  CheckCircle2,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { Train } from '../../types/train';
import { DynamicETAEngine } from '../../services/DynamicETAEngine';
import { operationalScenarioService } from '../../services/OperationalScenarioService';

interface AnalyticsViewProps {
  trains?: Train[];
  onSelectTrain?: (trainNumber: string) => void;
}

export const AnalyticsPlaceholderView: React.FC<AnalyticsViewProps> = ({
  trains = [],
  onSelectTrain
}) => {
  // Generate real predictions for all monitored trains
  const fleetPredictions = trains.map((t) => ({
    train: t,
    prediction: DynamicETAEngine.predict(t)
  }));

  // Aggregate real statistics
  const totalTrains = fleetPredictions.length;
  const recoveringTrains = fleetPredictions.filter(
    (p) => p.prediction.etaDifferenceMinutes < 0
  ).length;
  const expandingDelayTrains = fleetPredictions.filter(
    (p) => p.prediction.etaDifferenceMinutes > 0
  ).length;
  const exactlyMatchingBaseline = fleetPredictions.filter(
    (p) => p.prediction.etaDifferenceMinutes === 0
  ).length;

  const avgDynamicDelay = totalTrains > 0
    ? Math.round(
        fleetPredictions.reduce((acc, p) => acc + p.prediction.predictedDelayMinutes, 0) /
          totalTrains
      )
    : 0;

  const avgBaselineDelay = totalTrains > 0
    ? Math.round(
        fleetPredictions.reduce(
          (acc, p) => acc + p.train.position.currentDelayMinutes,
          0
        ) / totalTrains
      )
    : 0;

  const avgDifference = totalTrains > 0
    ? Math.round(
        fleetPredictions.reduce((acc, p) => acc + p.prediction.etaDifferenceMinutes, 0) /
          totalTrains
      )
    : 0;

  // Real sectional metrics
  const allActiveSections = fleetPredictions.flatMap((p) =>
    p.prediction.sections.filter((s) => s.status === 'ACTIVE' || s.status === 'UPCOMING')
  );

  const totalSections = allActiveSections.length;
  const congestedSections = allActiveSections.filter(
    (s) => s.congestionLevel && s.congestionLevel !== 'NORMAL'
  ).length;
  const speedRestrictedSections = allActiveSections.filter(
    (s) => !!s.speedRestrictionKmph
  ).length;
  const blockedSections = allActiveSections.filter((s) => !!s.isTrackBlocked).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A]/70 p-6 space-y-3">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40 mt-0.5">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white uppercase tracking-wide">
                  Fleet Arrival Intelligence & Evaluation
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono font-bold">
                  REPLAY / TEST MODE EVALUATION
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                Real-time mathematical evaluation of the Dynamic Traversal Model against the Timetable Baseline across all {totalTrains} monitored fleet corridors.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">
              Monitored Corridors
            </span>
            <span className="text-lg font-mono font-bold text-amber-400">
              {totalTrains} Trains · {totalSections} Active Sections
            </span>
          </div>
        </div>
      </div>

      {/* Primary Mathematical KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Fleet Average Delay Baseline */}
        <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/80 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
            Baseline Current Delay
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-slate-100">
              +{avgBaselineDelay}
            </span>
            <span className="text-xs text-slate-400 font-mono">min avg</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Static timetable delay at current train positions
          </p>
        </div>

        {/* KPI 2: Predicted Dynamic Destination Delay */}
        <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/80 space-y-1">
          <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block">
            Predicted Destination Delay
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-blue-300">
              +{avgDynamicDelay}
            </span>
            <span className="text-xs text-slate-400 font-mono">min avg</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Dynamic section traversal and dwell synthesis
          </p>
        </div>

        {/* KPI 3: Fleet Traversal Delta */}
        <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/80 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
            Dynamic Model Variance
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-mono font-bold ${
                avgDifference > 0
                  ? 'text-rose-400'
                  : avgDifference < 0
                  ? 'text-emerald-400'
                  : 'text-slate-200'
              }`}
            >
              {avgDifference > 0 ? `+${avgDifference}` : `${avgDifference}`}
            </span>
            <span className="text-xs text-slate-400 font-mono">min shift</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Net difference between Dynamic and Baseline ETA
          </p>
        </div>

        {/* KPI 4: Active Operational Disturbances */}
        <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/80 space-y-1">
          <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
            Active Disturbance Sections
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-amber-400">
              {congestedSections + speedRestrictedSections + blockedSections}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {totalSections}</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            {congestedSections} Congested · {speedRestrictedSections} Restricted · {blockedSections} Blocked
          </p>
        </div>
      </div>

      {/* Fleet Model Comparison Matrix */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A]/70 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Fleet Arrival Prediction Differential Matrix
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {recoveringTrains} Recovering · {expandingDelayTrains} Delay Expanding · {exactlyMatchingBaseline} Exact Match
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Train</th>
                <th className="py-2.5 px-3">Destination</th>
                <th className="py-2.5 px-3">Current Delay</th>
                <th className="py-2.5 px-3">Baseline Destination ETA</th>
                <th className="py-2.5 px-3">Dynamic Destination ETA</th>
                <th className="py-2.5 px-3 text-center">Variance (Dyn - Base)</th>
                <th className="py-2.5 px-3">Trend Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {fleetPredictions.map(({ train, prediction }) => {
                const diff = prediction.etaDifferenceMinutes;
                return (
                  <tr
                    key={train.trainNumber}
                    className="hover:bg-slate-800/30 transition"
                  >
                    <td className="py-2.5 px-3 font-mono">
                      <span className="font-bold text-amber-400">#{train.trainNumber}</span>
                      <span className="text-slate-300 font-sans font-medium ml-2">
                        {train.trainName}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {prediction.destinationStationCode}
                      <span className="text-[10px] text-slate-500 block">
                        {prediction.destinationStationName}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono">
                      {train.position.currentDelayMinutes > 0 ? (
                        <span className="text-orange-400 font-bold">
                          +{train.position.currentDelayMinutes}m
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold">0m</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {prediction.baselineDestinationETA}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-blue-300">
                      {prediction.dynamicDestinationETA}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-xs inline-flex items-center gap-1 ${
                          diff > 0
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                            : diff < 0
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {diff > 0 ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-rose-400" />
                            +{diff}m
                          </>
                        ) : diff < 0 ? (
                          <>
                            <TrendingDown className="w-3 h-3 text-emerald-400" />
                            {diff}m
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-slate-400" />
                            0m
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="text-[11px] text-slate-300 font-medium">
                        {prediction.etaTrendLabel}
                      </span>
                      {prediction.scenarioImpact?.isScenarioActive && (
                        <span className="block text-[10px] font-mono text-amber-400">
                          Stress scenario active
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {onSelectTrain && (
                        <button
                          onClick={() => onSelectTrain(train.trainNumber)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 font-mono text-[11px] border border-slate-700 transition"
                        >
                          Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* External Data Source Notice & Integrity Directive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-slate-800 bg-[#0F172A]/50 space-y-2">
          <div className="flex items-center gap-2 text-slate-200">
            <Database className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider">
              Benchmark Ground-Truth Integration
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Historical ground-truth actual arrival archives from CRIS/FOIS are not connected to this prototype environment. Consequently, synthetic MAE and RMSE percentages are strictly excluded to avoid fabricating analytical precision.
          </p>
          <span className="inline-block text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Status: Live Evaluation Active (Differential vs Timetable)
          </span>
        </div>

        <div className="p-4 rounded-lg border border-slate-800 bg-[#0F172A]/50 space-y-2">
          <div className="flex items-center gap-2 text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider">
              Mathematical Model Verifiability
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every predicted arrival time displayed is calculated deterministically from section distance, effective permissible velocity, signaling aspects, and active operational stress injections. All calculations are inspectable in the route timeline.
          </p>
          <span className="inline-block text-[10px] font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Model: Deterministic Traversal & Velocity Differential
          </span>
        </div>
      </div>
    </div>
  );
};
