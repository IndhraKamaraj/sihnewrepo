import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Train as TrainIcon,
  MapPin,
  Clock,
  Gauge,
  Compass,
  Radio,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Zap,
  Cpu,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Train, RouteStop, Coach } from '../../types/train';
import { StatusBadge } from '../common/StatusBadge';
import { DataProvenanceCard } from '../common/DataProvenanceCard';
import { ReplayControlBar } from '../common/ReplayControlBar';
import { DynamicETAEngine } from '../../services/DynamicETAEngine';
import { DynamicETAForecastCard } from '../common/DynamicETAForecastCard';
import { OperationalStressTestingCard } from '../features/OperationalStressTestingCard';
import { Sliders } from 'lucide-react';

interface TrainDetailsViewProps {
  train: Train | null;
  onBack: () => void;
  onSelectStation?: (stationCode: string) => void;
  availableTrains?: Train[];
  onSelectTrain?: (trainNumber: string) => void;
}

export const TrainDetailsView: React.FC<TrainDetailsViewProps> = ({
  train,
  onBack,
  onSelectStation,
  availableTrains = [],
  onSelectTrain
}) => {
  const [activeTab, setActiveTab] = useState<'eta' | 'stress' | 'route' | 'composition'>('eta');

  const etaPrediction = useMemo(() => {
    if (!train) return null;
    return DynamicETAEngine.predict(train);
  }, [train]);

  if (!train) {
    return (
      <div className="rounded-lg border border-slate-800 bg-[#0F172A]/40 p-12 text-center space-y-4">
        <TrainIcon className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-semibold text-slate-200">No Train Selected</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please select a train from the Dashboard or Train Explorer to inspect real-time operational telemetry, full route stop sequences, and rake composition.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-mono transition"
        >
          Return to Train Explorer
        </button>
      </div>
    );
  }

  const pctTravelled = Math.round(
    (train.position.distanceTravelledKm / train.totalDistanceKm) * 100
  );

  return (
    <div className="space-y-6">
      {/* Top action / back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono transition border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Explorer</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500">Rake Identifier:</span>
          <span className="font-mono text-xs text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {train.composition.rakeType}
          </span>
        </div>
      </div>

      {/* Interactive Replay / Test Mode Control Bar */}
      <ReplayControlBar
        train={train}
        availableTrains={availableTrains}
        onTrainChange={onSelectTrain}
      />

      {/* Train Identity Banner */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A]/70 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-base sm:text-lg font-bold text-amber-500 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                #{train.trainNumber}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {train.trainName}
              </h2>
              <StatusBadge
                status={train.status}
                delayMinutes={train.position.currentDelayMinutes}
                size="md"
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
              <span className="text-slate-300 font-semibold">
                {train.trainType.replace('_', ' ')}
              </span>
              <span className="text-slate-700">•</span>
              <span>
                Origin: <strong className="text-slate-200">{train.sourceStationName} ({train.sourceStationCode})</strong>
              </span>
              <span className="text-slate-700">→</span>
              <span>
                Terminus: <strong className="text-slate-200">{train.destinationStationName} ({train.destinationStationCode})</strong>
              </span>
              <span className="text-slate-700">•</span>
              <span>
                Distance: <strong className="text-slate-200">{train.totalDistanceKm} km</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto font-mono text-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block font-bold tracking-wider">Scheduled Dep</span>
              <span className="font-bold text-slate-200">{train.departureTime}</span>
            </div>
            <span className="text-slate-600">⟶</span>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block font-bold tracking-wider">Scheduled Arr</span>
              <span className="font-bold text-slate-200">{train.scheduledArrivalTime}</span>
            </div>
            {etaPrediction && (
              <>
                <span className="text-slate-600">⟶</span>
                <div className="text-right px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/40">
                  <span className="text-[9px] text-amber-400 uppercase block font-bold tracking-wider">Dynamic ETA</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">{etaPrediction.dynamicDestinationETA}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        etaPrediction.etaDifferenceMinutes < 0
                          ? 'text-emerald-400'
                          : etaPrediction.etaDifferenceMinutes > 0
                          ? 'text-orange-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {etaPrediction.etaDifferenceMinutes > 0
                        ? `(+${etaPrediction.etaDifferenceMinutes}m)`
                        : etaPrediction.etaDifferenceMinutes < 0
                        ? `(${etaPrediction.etaDifferenceMinutes}m)`
                        : ''}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Current State HUD Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-800/80">
          {/* Tile 1: Speed */}
          <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1 font-bold">
              <Gauge className="w-3 h-3 text-amber-500" /> Speed
            </span>
            <div className="mt-1 font-mono">
              <span className="text-xl font-black text-amber-500">{train.position.speedKmph}</span>
              <span className="text-xs text-slate-500 ml-1">km/h</span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              {train.position.speedKmph > 0 ? 'Section Transit' : 'Halted / Yard'}
            </span>
          </div>

          {/* Tile 2: Delay */}
          <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1 font-bold">
              <Clock className="w-3 h-3 text-orange-400" /> Operational Delay
            </span>
            <div className="mt-1 font-mono">
              {train.position.currentDelayMinutes > 0 ? (
                <span className="text-xl font-bold text-orange-400">
                  +{train.position.currentDelayMinutes}
                  <span className="text-xs ml-0.5">m</span>
                </span>
              ) : (
                <span className="text-xl font-bold text-emerald-400">0m</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block">
              {train.position.currentDelayMinutes === 0 ? 'Right Time' : 'Running Behind'}
            </span>
          </div>

          {/* Tile 3: Next Station */}
          <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1 font-bold">
              <MapPin className="w-3 h-3 text-amber-500" /> Next Station
            </span>
            <div className="mt-1 font-mono">
              <span className="text-sm font-bold text-white block truncate">
                {train.position.nextStationCode}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              {train.position.nextStationName}
            </span>
          </div>

          {/* Tile 4: Distance Travelled */}
          <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Travelled</span>
            <div className="mt-1 font-mono">
              <span className="text-xl font-bold text-slate-200">{train.position.distanceTravelledKm}</span>
              <span className="text-xs text-slate-500 ml-1">km</span>
            </div>
            <span className="text-[10px] text-slate-500 block">{pctTravelled}% completed</span>
          </div>

          {/* Tile 5: Distance Remaining */}
          <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Remaining</span>
            <div className="mt-1 font-mono">
              <span className="text-xl font-bold text-slate-200">{train.position.distanceRemainingKm}</span>
              <span className="text-xs text-slate-500 ml-1">km</span>
            </div>
            <span className="text-[10px] text-slate-500 block">To destination</span>
          </div>

          {/* Tile 6: Signal Aspect */}
          <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Signal Aspect</span>
            <div className="mt-1 font-mono flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  train.position.signalAspect === 'GREEN'
                    ? 'bg-emerald-400 ring-2 ring-emerald-500/30'
                    : train.position.signalAspect === 'YELLOW' || train.position.signalAspect === 'DOUBLE_YELLOW'
                    ? 'bg-amber-400 ring-2 ring-amber-500/30'
                    : 'bg-orange-500 ring-2 ring-orange-500/30'
                }`}
              />
              <span className="text-xs font-bold text-slate-200">
                {train.position.signalAspect || 'CLEAR'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block truncate">
              {train.position.sectionBlock || 'Automatic Block'}
            </span>
          </div>
        </div>

        {/* Current Location Live Description Strip */}
        <div className="flex items-center gap-2 p-3 rounded bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-300">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ring-4 ring-amber-500/20" />
          <span className="text-slate-500 uppercase font-bold text-[10px]">CURRENT TELEMETRY LOCATION:</span>
          <span className="text-slate-200 font-medium truncate flex-1">
            {train.position.currentLocationDescription}
          </span>
          {train.position.currentStationCode && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px]">
              HALTED AT PF
            </span>
          )}
        </div>

        {/* Overall Route Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>
              {train.sourceStationCode} (0 km)
            </span>
            <span className="text-amber-400 font-semibold">
              Route Progress: {pctTravelled}%
            </span>
            <span>
              {train.destinationStationCode} ({train.totalDistanceKm} km)
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                train.status === 'DELAYED'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, pctTravelled))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Data Provenance Card */}
      <DataProvenanceCard provenance={train.provenance} />

      {/* Section Sub-Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('eta')}
          className={`pb-3 border-b-2 font-medium transition flex items-center gap-2 ${
            activeTab === 'eta'
              ? 'border-amber-500 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Dynamic ETA Forecast</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
            Live Engine
          </span>
        </button>

        <button
          onClick={() => setActiveTab('stress')}
          className={`pb-3 border-b-2 font-medium transition flex items-center gap-2 ${
            activeTab === 'stress'
              ? 'border-amber-500 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Stress Testing</span>
          {etaPrediction?.scenarioImpact?.isScenarioActive && (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
              Active ({etaPrediction.scenarioImpact.activeFactors.length})
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('route')}
          className={`pb-3 border-b-2 font-medium transition flex items-center gap-2 ${
            activeTab === 'route'
              ? 'border-amber-500 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Full Route Sequence ({train.route.length} Stops)</span>
        </button>

        <button
          onClick={() => setActiveTab('composition')}
          className={`pb-3 border-b-2 font-medium transition flex items-center gap-2 ${
            activeTab === 'composition'
              ? 'border-amber-500 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Train Composition ({train.composition.totalCoaches} Coaches)</span>
        </button>
      </div>

      {/* Tab 1: Dynamic ETA Forecast (Core Engine Output) */}
      {activeTab === 'eta' && etaPrediction && (
        <div className="space-y-6">
          <DynamicETAForecastCard prediction={etaPrediction} train={train} />
          <OperationalStressTestingCard train={train} currentPrediction={etaPrediction} />
        </div>
      )}

      {/* Tab 2: Operational Stress Testing Focused Tab */}
      {activeTab === 'stress' && etaPrediction && (
        <div className="space-y-6">
          <OperationalStressTestingCard train={train} currentPrediction={etaPrediction} />
          <DynamicETAForecastCard prediction={etaPrediction} train={train} />
        </div>
      )}

      {/* Tab 2: Full Route Sequence */}
      {activeTab === 'route' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Station Sequence & Timetable Progression
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Green = Departed · Amber = Current / Approaching · Slate = Upcoming
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0F172A]/40 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">Stop</th>
                    <th className="py-3 px-4">Station Code & Name</th>
                    <th className="py-3 px-4">Distance</th>
                    <th className="py-3 px-4">Sched. Arr / Dep</th>
                    <th className="py-3 px-4">Dynamic ETA Prediction</th>
                    <th className="py-3 px-4">Actual / Baseline Status</th>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4">Halt</th>
                    <th className="py-3 px-4 text-center">Progression Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {train.route.map((stop) => {
                    const isCompleted = stop.status === 'COMPLETED';
                    const isCurrent = stop.status === 'CURRENT';
                    const isNext = stop.status === 'NEXT';
                    const isTerminus = stop.status === 'TERMINUS';

                    return (
                      <tr
                        key={stop.stationCode}
                        id={`station-stop-${stop.stationCode}`}
                        onClick={() => onSelectStation && onSelectStation(stop.stationCode)}
                        className={`transition cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-500/10 hover:bg-amber-500/20'
                            : isNext
                            ? 'bg-blue-500/10 hover:bg-blue-500/20'
                            : isCompleted
                            ? 'bg-slate-950/40 opacity-75 hover:opacity-100 hover:bg-slate-800/30'
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        {/* Stop # */}
                        <td className="py-3 px-4 text-center font-mono text-slate-500 font-semibold">
                          {stop.stopNumber}
                        </td>

                        {/* Station Code & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold px-2 py-0.5 rounded text-xs border ${
                                isCurrent
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                  : isNext
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                                  : 'bg-slate-950 text-slate-300 border-slate-800'
                              }`}
                            >
                              {stop.stationCode}
                            </span>
                            <span className="font-semibold text-slate-100 text-xs">
                              {stop.stationName}
                            </span>
                          </div>
                        </td>

                        {/* Distance */}
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {stop.distanceFromSourceKm} km
                        </td>

                        {/* Sched Arr/Dep */}
                        <td className="py-3 px-4 font-mono text-slate-300">
                          <div>
                            <span className="text-slate-500 text-[10px]">Arr:</span>{' '}
                            {stop.scheduledArrival}
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px]">Dep:</span>{' '}
                            {stop.scheduledDeparture}
                          </div>
                        </td>

                        {/* Dynamic ETA Prediction */}
                        <td className="py-3 px-4 font-mono">
                          {(() => {
                            const pred = etaPrediction?.allStationPredictions.find(
                              (s) => s.stationCode === stop.stationCode
                            );
                            if (isCompleted) {
                              return (
                                <div>
                                  <span className="text-emerald-400 font-semibold text-xs">
                                    {stop.actualOrCurrentArrival || stop.scheduledArrival}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">Actual / Arrived</span>
                                </div>
                              );
                            }
                            if (pred) {
                              return (
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-amber-300 text-xs">
                                      {pred.dynamicArrival}
                                    </span>
                                    {pred.etaDifferenceMinutes !== 0 && (
                                      <span
                                        className={`text-[10px] font-bold ${
                                          pred.etaDifferenceMinutes > 0
                                            ? 'text-orange-400'
                                            : 'text-emerald-400'
                                        }`}
                                      >
                                        {pred.etaDifferenceMinutes > 0
                                          ? `+${pred.etaDifferenceMinutes}m`
                                          : `${pred.etaDifferenceMinutes}m`}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block font-mono">
                                    Sched: {pred.scheduledArrival}
                                  </span>
                                </div>
                              );
                            }
                            return <span className="text-slate-500 italic">--</span>;
                          })()}
                        </td>

                        {/* Actual / Baseline Status */}
                        <td className="py-3 px-4 font-mono">
                          {(() => {
                            const pred = etaPrediction?.allStationPredictions.find(
                              (s) => s.stationCode === stop.stationCode
                            );
                            if (stop.actualOrCurrentArrival && isCompleted) {
                              return (
                                <div className="text-slate-200">
                                  <span className="text-slate-500 text-[10px]">Act:</span>{' '}
                                  <span className="font-semibold text-emerald-400">
                                    {stop.actualOrCurrentArrival}
                                  </span>
                                </div>
                              );
                            }
                            if (pred) {
                              return (
                                <div>
                                  <div className="text-slate-300 text-xs">
                                    <span className="text-slate-500 text-[10px]">Base: </span>
                                    <span className="font-medium text-slate-300">{pred.baselineArrival}</span>
                                  </div>
                                  {pred.predictedDelayMinutes > 0 ? (
                                    <span className="text-[10px] text-orange-400 block font-semibold">
                                      Delay: +{pred.predictedDelayMinutes}m
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-emerald-400 block font-semibold">
                                      On-Time
                                    </span>
                                  )}
                                </div>
                              );
                            }
                            return <span className="text-slate-500 italic">Not reached</span>;
                          })()}
                        </td>

                        {/* Platform */}
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {stop.platform || 'TBD'}
                        </td>

                        {/* Halt */}
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {stop.haltMinutes > 0 ? `${stop.haltMinutes} min` : 'Pass / Terminus'}
                        </td>

                        {/* Status badge */}
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={stop.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Train Composition (Structural Model) */}
      {activeTab === 'composition' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-800 bg-[#0F172A]/60 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Structural Rake Composition
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total Coaches: <strong className="text-slate-200 font-mono">{train.composition.totalCoaches}</strong> · Type:{' '}
                  <strong className="text-amber-400 font-mono">{train.composition.rakeType}</strong>
                </p>
              </div>

              <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
                Data Source: {train.composition.sourceNote || 'Standard Schema Composition'}
              </div>
            </div>

            {/* Class Summary breakdown */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs font-mono text-slate-400 self-center mr-1">Class Breakdown:</span>
              {Object.entries(train.composition.classSummary).map(([cls, count]) => (
                <span
                  key={cls}
                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5"
                >
                  <span className="font-bold text-amber-500">{count}x</span>
                  <span>{cls}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Coach Sequence Schematic */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Coach Order (Front / Locomotive to Rear):
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Hover or inspect individual coach identifiers
              </span>
            </div>

            <div className="p-4 rounded-lg border border-slate-800 bg-slate-950 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max pb-2">
                {train.composition.coaches.map((coach, index) => {
                  const isEng = coach.isEngine || coach.coachType === 'ENG';
                  const isEOG = coach.coachType === 'EOG';
                  const is1A = coach.coachType === '1A';
                  const is2A = coach.coachType === '2A';
                  const is3A = coach.coachType === '3A' || coach.coachType === '3E';
                  const isCC = coach.coachType === 'CC' || coach.coachType === 'EC';

                  return (
                    <div
                      key={`${coach.coachId}-${index}`}
                      id={`coach-${coach.coachId}`}
                      className={`rounded border p-2 text-center min-w-[76px] transition flex flex-col justify-between ${
                        isEng
                          ? 'bg-red-500/20 border-red-500/50 text-red-300'
                          : isEOG
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : is1A
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                          : is2A
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                          : is3A
                          ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                          : isCC
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-slate-400 mb-1">
                        #{coach.positionFromFront}
                      </div>

                      <div className="font-mono font-bold text-xs truncate">
                        {coach.coachId}
                      </div>

                      <div className="text-[10px] font-mono font-medium opacity-90 truncate mt-1">
                        {coach.coachType}
                      </div>

                      {coach.totalSeatsOrBerths && (
                        <div className="text-[9px] font-mono text-slate-500 mt-1">
                          {coach.totalSeatsOrBerths} berths
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Rails decoration below coaches */}
              <div className="h-1 bg-slate-800 rounded-full mt-1 border-t border-slate-700/50" />
            </div>

            <div className="p-3 rounded bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 font-sans">
              <strong className="text-slate-300">Rake Telemetry Note: </strong>
              The composition above is structured according to Indian Railways standard Marshalling Order (PRS/COIS schema). Future phases will allow direct synchronization with live rake maintenance depot databases.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
