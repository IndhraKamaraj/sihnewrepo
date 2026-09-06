import React, { useState } from 'react';
import {
  AlertCircle,
  RotateCcw,
  Train as TrainIcon,
  ChevronRight,
  Radio,
  Sliders,
  Clock,
  Gauge,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Train } from '../../types/train';
import { railwayDataService } from '../../services/RailwayDataService';
import { DynamicETAEngine } from '../../services/DynamicETAEngine';
import { ReplayControlBar } from '../common/ReplayControlBar';
import { OperationalStressTestingCard } from '../features/OperationalStressTestingCard';
import { DynamicETAForecastCard } from '../common/DynamicETAForecastCard';

interface SimulationPlaceholderViewProps {
  trains?: Train[];
  onSelectTrain?: (trainNumber: string) => void;
}

export const SimulationPlaceholderView: React.FC<SimulationPlaceholderViewProps> = ({
  trains = [],
  onSelectTrain
}) => {
  const [selectedTrainNo, setSelectedTrainNo] = useState<string>(
    trains[0]?.trainNumber || '12951'
  );

  const activeTrain =
    trains.find((t) => t.trainNumber === selectedTrainNo) || trains[0];

  const currentPrediction = activeTrain
    ? DynamicETAEngine.predict(activeTrain)
    : null;

  const handleResetAll = () => {
    railwayDataService.resetAllTrainsToBaseline();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6 space-y-3">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 mt-0.5">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white uppercase tracking-wide">
                  Replay & Operational Stress Testing Station
                </h2>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold tracking-wider">
                  REPLAY / TEST MODE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                Advance train telemetry positions or inject physical operational stress conditions (Section Congestion, Speed Restrictions, Unscheduled Stops, and Track Blocks) to evaluate real-time arrival propagation and dynamic ETA adjustments.
              </p>
            </div>
          </div>

          <button
            id="btn-reset-all-baseline"
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs transition hover:text-amber-400 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Trains to Baseline
          </button>
        </div>
      </div>

      {/* Active Train Replay Control Bar */}
      {activeTrain && (
        <ReplayControlBar
          train={activeTrain}
          availableTrains={trains}
          onTrainChange={(trainNo) => setSelectedTrainNo(trainNo)}
        />
      )}

      {/* Primary Functional Operational Stress Testing Controls */}
      {activeTrain && currentPrediction && (
        <div className="space-y-6">
          <OperationalStressTestingCard
            train={activeTrain}
            currentPrediction={currentPrediction}
            onScenarioChange={() => {
              // Triggers instant recalculation through reactive subscriptions
            }}
          />

          {/* Quick Dynamic Forecast Preview for Focused Train */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Live Dynamic Arrival Propagation (Train #{activeTrain.trainNumber})
              </h3>
              {onSelectTrain && (
                <button
                  onClick={() => onSelectTrain(activeTrain.trainNumber)}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-mono"
                >
                  Full Train Route Details <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <DynamicETAForecastCard prediction={currentPrediction} train={activeTrain} />
          </div>
        </div>
      )}

      {/* Network Progression Overview Table */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A]/70 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrainIcon className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Fleet Progression Status ({trains.length} Monitored Trains)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Click any train row to focus and stress test
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Train</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Current Location</th>
                <th className="py-2.5 px-3">Speed</th>
                <th className="py-2.5 px-3">Delay</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Next Station</th>
                <th className="py-2.5 px-3 text-center">Quick Step</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {trains.map((t) => {
                const isFocused = t.trainNumber === activeTrain?.trainNumber;
                const pct = Math.round((t.position.distanceTravelledKm / t.totalDistanceKm) * 100);

                return (
                  <tr
                    key={t.trainNumber}
                    id={`table-train-row-${t.trainNumber}`}
                    onClick={() => setSelectedTrainNo(t.trainNumber)}
                    className={`transition cursor-pointer ${
                      isFocused
                        ? 'bg-amber-500/10 border-l-2 border-amber-500'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Train identifier */}
                    <td className="py-2.5 px-3 font-mono">
                      <span className="font-bold text-amber-400">#{t.trainNumber}</span>
                      <span className="text-slate-200 font-sans font-medium ml-2 block truncate max-w-[140px]">
                        {t.trainName}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {t.trainType.replace('_', ' ')}
                    </td>

                    {/* Current location */}
                    <td className="py-2.5 px-3 text-slate-300 max-w-[200px] truncate" title={t.position.currentLocationDescription}>
                      {t.position.currentLocationDescription}
                    </td>

                    {/* Speed */}
                    <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">
                      {t.position.speedKmph} km/h
                    </td>

                    {/* Delay */}
                    <td className="py-2.5 px-3 font-mono">
                      {t.position.currentDelayMinutes > 0 ? (
                        <span className="text-orange-400 font-bold">
                          +{t.position.currentDelayMinutes}m
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold">0m</span>
                      )}
                    </td>

                    {/* Distance / Progress */}
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                          />
                        </div>
                        <span className="text-slate-400">{pct}%</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {t.position.distanceTravelledKm} / {t.totalDistanceKm} km
                      </span>
                    </td>

                    {/* Next Station */}
                    <td className="py-2.5 px-3 font-mono text-blue-400 font-bold">
                      {t.position.nextStationCode}
                      <span className="text-[10px] text-slate-400 font-normal block">
                        {t.position.distanceRemainingKm} km rem.
                      </span>
                    </td>

                    {/* Quick Step Forward */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          railwayDataService.stepTrainForward(t.trainNumber);
                        }}
                        disabled={t.status === 'TERMINATED'}
                        title="Step this train forward one waypoint"
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-amber-400 font-mono text-[10px] border border-slate-700 transition"
                      >
                        Step +1
                      </button>
                    </td>

                    {/* View Details */}
                    <td className="py-2.5 px-3 text-center">
                      {onSelectTrain && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTrain(t.trainNumber);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 font-mono text-[11px] border border-slate-700 transition inline-flex items-center gap-1"
                        >
                          Inspect <ChevronRight className="w-3 h-3" />
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

      {/* Provenance and Disclaimer Note */}
      <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs font-mono text-slate-400 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300">DATA PROVENANCE & COMPLIANCE DIRECTIVE: </strong>
          All telemetry and operational stress scenarios run under the <strong>REPLAY / TEST MODE</strong> engine. Data is strictly simulated for operational testing and is not connected to live CRIS/FOIS feeds.
        </div>
      </div>
    </div>
  );
};
