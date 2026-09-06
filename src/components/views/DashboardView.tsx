import React from 'react';
import {
  Train as TrainIcon,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Radio,
  Gauge,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Train, NetworkStatus } from '../../types/train';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';

interface DashboardViewProps {
  trains: Train[];
  networkStatus: NetworkStatus | null;
  onSelectTrain: (trainNumber: string) => void;
  onNavigateToExplorer: () => void;
  onNavigateToStation: (stationCode: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trains,
  networkStatus,
  onSelectTrain,
  onNavigateToExplorer,
  onNavigateToStation
}) => {
  if (!networkStatus) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono">
        Loading operational telemetry...
      </div>
    );
  }

  // Find priority trains: delayed or approaching
  const priorityTrains = trains
    .filter((t) => t.status === 'DELAYED' || t.status === 'APPROACHING' || t.position.distanceRemainingKm < 100)
    .sort((a, b) => b.position.currentDelayMinutes - a.position.currentDelayMinutes);

  return (
    <div className="space-y-6">
      {/* Top operational alert / context banner */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A]/70 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 mt-0.5">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Railway Operations Control Matrix
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                SYSTEM NOMINAL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live operational monitoring for active passenger corridors. Telemetry fed from{' '}
              <span className="font-mono text-slate-200 font-semibold">{networkStatus.telemetrySource}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onNavigateToExplorer}
            className="px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 hover:border-amber-500/40"
          >
            <span>Explore All Trains ({trains.length})</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid - Data Driven */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard
          id="metric-active-trains"
          label="Active Monitored Trains"
          value={networkStatus.activeTrainCount}
          unit="units"
          subtext="Total rakes in sector"
          icon={TrainIcon}
          variant="default"
        />

        <MetricCard
          id="metric-running-trains"
          label="Trains In Transit"
          value={networkStatus.trainsRunning}
          unit="active"
          subtext="Cruising block sections"
          icon={Activity}
          variant="emerald"
        />

        <MetricCard
          id="metric-delayed-trains"
          label="Trains Delayed"
          value={networkStatus.trainsDelayed}
          unit="trains"
          subtext={`Avg delay: ${networkStatus.averageNetworkDelayMinutes} mins`}
          icon={AlertTriangle}
          variant={networkStatus.trainsDelayed > 0 ? 'rose' : 'default'}
        />

        <MetricCard
          id="metric-approaching-trains"
          label="Approaching Terminus"
          value={networkStatus.trainsApproachingDestination}
          unit="trains"
          subtext="Within final block arrival"
          icon={Clock}
          variant="amber"
        />

        <MetricCard
          id="metric-network-punctuality"
          label="On-Schedule Index"
          value={
            networkStatus.activeTrainCount > 0
              ? Math.round(
                  ((networkStatus.activeTrainCount - networkStatus.trainsDelayed) /
                    networkStatus.activeTrainCount) *
                    100
                )
              : 100
          }
          unit="%"
          subtext="Target standard: ≥ 85%"
          icon={CheckCircle}
          variant="blue"
        />
      </div>

      {/* Corridor Status & Priority Approaching Trains Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Approaching & Delayed Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                Approaching & Flagged Sector Trains
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Showing {priorityTrains.length} prioritized units
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0F172A]/40 divide-y divide-slate-800/80 overflow-hidden">
            {priorityTrains.map((train) => {
              const pctTravelled = Math.round(
                (train.position.distanceTravelledKm / train.totalDistanceKm) * 100
              );
              const isDelayed = train.status === 'DELAYED';
              const isApproaching = train.status === 'APPROACHING';

              return (
                <div
                  key={train.trainNumber}
                  id={`priority-train-${train.trainNumber}`}
                  onClick={() => onSelectTrain(train.trainNumber)}
                  className={`p-4 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group border-l-4 ${
                    isDelayed
                      ? 'border-orange-500 bg-slate-900/40 hover:bg-slate-800/40'
                      : isApproaching
                      ? 'border-amber-500 bg-slate-900/30 hover:bg-slate-800/30'
                      : 'border-transparent hover:bg-slate-800/30'
                  }`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-amber-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {train.trainNumber}
                      </span>
                      <span className="font-semibold text-sm text-white group-hover:text-amber-400 transition truncate">
                        {train.trainName}
                      </span>
                      <StatusBadge
                        status={train.status}
                        delayMinutes={train.position.currentDelayMinutes}
                        size="sm"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                      <span>
                        {train.sourceStationCode} → {train.destinationStationCode}
                      </span>
                      <span className="text-slate-700">•</span>
                      <span>
                        Next Stop:{' '}
                        <strong className="text-slate-200">
                          {train.position.nextStationName} ({train.position.nextStationCode})
                        </strong>
                      </span>
                      <span className="text-slate-700">•</span>
                      <span className="text-slate-300">
                        Speed: <strong className="text-amber-400">{train.position.speedKmph} km/h</strong>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 bg-slate-950/60 p-2 rounded border border-slate-800/60 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">{train.position.currentLocationDescription}</span>
                    </div>

                    {/* Progress strip */}
                    <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          train.status === 'DELAYED'
                            ? 'bg-orange-500'
                            : train.status === 'APPROACHING'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, pctTravelled))}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-amber-500 uppercase font-bold tracking-wider block">
                        Dynamic ETA
                      </span>
                      <span className="text-sm font-bold text-white">
                        {train.futurePredictionContract?.predictedArrival || train.scheduledArrivalTime}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {train.position.distanceRemainingKm} km left
                      </span>
                    </div>

                    <span className="text-xs font-mono text-amber-500 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Monitored Corridors & System Architecture Notice */}
        <div className="space-y-6">
          {/* Corridor Punctuality & Status */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A]/70 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Monitored Trunk Corridors
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">Punctuality</span>
            </div>

            <div className="space-y-2.5">
              {networkStatus.monitoredCorridors.map((corridor) => (
                <div
                  key={corridor.corridorId}
                  className="p-3 rounded bg-slate-950/60 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200 leading-snug">
                      {corridor.name}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        corridor.punctualityRate >= 90
                          ? 'text-emerald-400'
                          : corridor.punctualityRate >= 85
                          ? 'text-amber-400'
                          : 'text-orange-400'
                      }`}
                    >
                      {corridor.punctualityRate}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{corridor.activeTrains} trains in section</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        corridor.status === 'OPTIMAL'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {corridor.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 1 Architecture Pipeline Disclosure Box */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A]/70 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-200">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                RY-DYNAMICS Pipeline Blueprint
              </h4>
            </div>

            <div className="text-[11px] text-slate-400 space-y-2 leading-relaxed font-sans">
              <p>
                <strong className="text-amber-400">Dynamic Pipeline Active:</strong> High-density railway operations interface, telemetry abstractions, complete station topology, and deterministic dynamic ETA prediction.
              </p>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1">
                <div className="text-emerald-400 font-bold">1. REAL TRAIN DATA → CURRENT TRAIN STATE [Active]</div>
                <div className="text-emerald-400 font-bold">2. OPERATIONAL STRESS INJECTIONS [Active]</div>
                <div className="text-emerald-400 font-bold">3. DYNAMIC SECTION TRAVERSAL ENGINE [Active]</div>
                <div className="text-blue-400 font-bold">4. DYNAMIC ARRIVAL PREDICTIONS + DELAY DRIFT [Active]</div>
              </div>
              <p className="text-[10px] text-slate-400">
                Deterministic route section traversal calculates dynamic arrival times, tracking velocity profiles, signaling aspects, and active stress conditions without page reloads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
