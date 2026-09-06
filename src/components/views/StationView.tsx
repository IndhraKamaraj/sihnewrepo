import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Train as TrainIcon,
  Clock,
  Gauge,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  Radio
} from 'lucide-react';
import { railwayDataService, StationOperationalView } from '../../services/RailwayDataService';
import { PROTOTYPE_KEY_STATIONS } from '../../data/prototypeTrains';
import { StatusBadge } from '../common/StatusBadge';

interface StationViewProps {
  initialStationCode?: string;
  onSelectTrain: (trainNumber: string) => void;
}

export const StationView: React.FC<StationViewProps> = ({
  initialStationCode = 'CNB',
  onSelectTrain
}) => {
  const [selectedStationCode, setSelectedStationCode] = useState<string>(initialStationCode);
  const [stationData, setStationData] = useState<StationOperationalView | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    railwayDataService.getStationOperationalView(selectedStationCode).then((data) => {
      if (isMounted) {
        setStationData(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedStationCode]);

  return (
    <div className="space-y-6">
      {/* Station Selector Bar */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A]/70 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Station Operational Route View
            </h2>
            <p className="text-xs text-slate-400">
              Station interlocking matrix & approaching train sequencing
            </p>
          </div>
        </div>

        {/* Station Selector buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full no-scrollbar">
          {PROTOTYPE_KEY_STATIONS.map((stn) => (
            <button
              key={stn.stationCode}
              id={`select-station-${stn.stationCode}`}
              onClick={() => setSelectedStationCode(stn.stationCode)}
              className={`px-2.5 py-1.5 rounded text-xs font-mono transition-all whitespace-nowrap ${
                selectedStationCode === stn.stationCode
                  ? 'bg-amber-500 text-black font-bold border border-amber-400'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {stn.stationCode} · {stn.stationName}
            </button>
          ))}
        </div>
      </div>

      {loading || !stationData ? (
        <div className="p-12 text-center text-slate-500 font-mono text-xs">
          Querying station interlocking telemetry...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Station HUD overview */}
          <div className="rounded-lg border border-slate-800 bg-[#0F172A]/40 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-amber-500 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                    {stationData.stationCode}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {stationData.stationName}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                  {stationData.zone} · Automatic Signaled Junction Sector
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Platforms</span>
                  <span className="text-sm font-bold text-slate-200">{stationData.platforms} Lines</span>
                </div>

                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Line Throughput</span>
                  <span className="text-sm font-bold text-emerald-400">{stationData.trackThroughputPercent}%</span>
                </div>

                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Approaching</span>
                  <span className="text-sm font-bold text-amber-500">
                    {stationData.approachingTrains.length} units
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Interlocking Status: <strong className="text-slate-200">CLEAR FOR APPROACH ROUTING</strong>
              </span>
              <span>
                Sector Capacity: <strong className="text-slate-300">Optimal</strong>
              </span>
            </div>
          </div>

          {/* Approaching Trains to this Station */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrainIcon className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Approaching Trains Sequencing to {stationData.stationName} ({stationData.stationCode})
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Sorted by distance away from platform
              </span>
            </div>

            {stationData.approachingTrains.length === 0 ? (
              <div className="rounded-lg border border-slate-800 bg-[#0F172A]/30 p-8 text-center text-xs text-slate-400 font-mono">
                No active sector trains currently approaching {stationData.stationName}.
              </div>
            ) : (
              <div className="rounded-lg border border-slate-800 bg-[#0F172A]/40 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Train No & Name</th>
                        <th className="py-3 px-4">Distance Away</th>
                        <th className="py-3 px-4">Sched. Arrival</th>
                        <th className="py-3 px-4">Expected Arrival</th>
                        <th className="py-3 px-4">Platform</th>
                        <th className="py-3 px-4">Approach Speed</th>
                        <th className="py-3 px-4">Current Delay</th>
                        <th className="py-3 px-4 text-center">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {stationData.approachingTrains.map((item) => (
                        <tr
                          key={item.trainNumber}
                          id={`approaching-train-${item.trainNumber}`}
                          onClick={() => onSelectTrain(item.trainNumber)}
                          className="hover:bg-slate-800/40 cursor-pointer transition group"
                        >
                          {/* Train No & Name */}
                          <td className="py-3.5 px-4 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                #{item.trainNumber}
                              </span>
                              <span className="font-semibold text-slate-100 group-hover:text-amber-400 transition">
                                {item.trainName}
                              </span>
                            </div>
                          </td>

                          {/* Distance Away */}
                          <td className="py-3.5 px-4 font-mono">
                            {item.distanceAwayKm === 0 ? (
                              <span className="text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[11px]">
                                AT STATION PF
                              </span>
                            ) : (
                              <span className="text-amber-400 font-semibold">
                                {item.distanceAwayKm} km away
                              </span>
                            )}
                          </td>

                          {/* Sched Arrival */}
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {item.scheduledArrival}
                          </td>

                          {/* Expected Arrival */}
                          <td className="py-3.5 px-4 font-mono text-slate-100 font-medium">
                            {item.expectedArrival}
                          </td>

                          {/* Platform */}
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {item.platform || 'TBD'}
                          </td>

                          {/* Approach Speed */}
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {item.speedKmph} km/h
                          </td>

                          {/* Current Delay */}
                          <td className="py-3.5 px-4 font-mono">
                            {item.delayMinutes > 0 ? (
                              <span className="text-orange-400 font-bold">
                                +{item.delayMinutes} min
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-medium">
                                On Time
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTrain(item.trainNumber);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-[11px] transition border border-slate-700 inline-flex items-center gap-1"
                            >
                              Details <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
