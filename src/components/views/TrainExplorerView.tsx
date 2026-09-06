import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Train as TrainIcon,
  MapPin,
  Clock,
  Gauge,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Train, TrainStatus, TrainFilterOptions } from '../../types/train';
import { StatusBadge } from '../common/StatusBadge';

interface TrainExplorerViewProps {
  trains: Train[];
  onSelectTrain: (trainNumber: string) => void;
  searchOptions: TrainFilterOptions;
  onUpdateFilter: (updates: Partial<TrainFilterOptions>) => void;
}

export const TrainExplorerView: React.FC<TrainExplorerViewProps> = ({
  trains,
  onSelectTrain,
  searchOptions,
  onUpdateFilter
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const statusFilters: { id: 'ALL' | TrainStatus; label: string }[] = [
    { id: 'ALL', label: 'All Trains' },
    { id: 'RUNNING', label: 'In Transit' },
    { id: 'DELAYED', label: 'Delayed' },
    { id: 'APPROACHING', label: 'Approaching' },
    { id: 'ON_TIME', label: 'On Schedule' }
  ];

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="rounded-lg border border-slate-800 bg-[#0F172A]/70 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="train-search-input"
              type="text"
              placeholder="Search by train number (e.g. 12951), name, station (e.g. NDLS)..."
              value={searchOptions.searchQuery}
              onChange={(e) => onUpdateFilter({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-4 py-2 rounded-md bg-slate-950 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono transition"
            />
            {searchOptions.searchQuery && (
              <button
                onClick={() => onUpdateFilter({ searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort & View Mode controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Sort:</span>
              <select
                id="train-sort-select"
                value={searchOptions.sortBy}
                onChange={(e) =>
                  onUpdateFilter({
                    sortBy: e.target.value as TrainFilterOptions['sortBy']
                  })
                }
                className="bg-transparent text-xs text-slate-200 focus:outline-none font-mono cursor-pointer"
              >
                <option value="DELAY_DESC" className="bg-slate-900">Highest Delay</option>
                <option value="TRAIN_NO" className="bg-slate-900">Train Number</option>
                <option value="SPEED_DESC" className="bg-slate-900">Current Speed</option>
                <option value="TRAIN_NAME" className="bg-slate-900">Train Name</option>
              </select>
            </div>

            <div className="hidden sm:flex rounded-md border border-slate-800 bg-slate-950 p-0.5 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  viewMode === 'table'
                    ? 'bg-slate-800 text-amber-400 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  viewMode === 'cards'
                    ? 'bg-slate-800 text-amber-400 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs">
          <span className="text-slate-500 text-[11px] font-medium mr-1 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {statusFilters.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onUpdateFilter({ statusFilter: tab.id })}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all whitespace-nowrap ${
                searchOptions.statusFilter === tab.id
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-slate-500 font-mono text-[11px]">
            {trains.length} {trains.length === 1 ? 'train' : 'trains'} matched
          </span>
        </div>
      </div>

      {/* Empty State */}
      {trains.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-200">No trains match your search criteria</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or reset the operational status filter to view active sector rakes.
          </p>
          <button
            onClick={() => onUpdateFilter({ searchQuery: '', statusFilter: 'ALL' })}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* High-density Table View */
        <div className="rounded-lg border border-slate-800 bg-[#0F172A]/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Train No. & Name</th>
                  <th className="py-3 px-4">Origin → Terminus</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Current Location / Station</th>
                  <th className="py-3 px-4">Next Station</th>
                  <th className="py-3 px-4 text-right">Speed</th>
                  <th className="py-3 px-4 text-right">Delay / Dynamic ETA</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {trains.map((train) => (
                  <tr
                    key={train.trainNumber}
                    id={`train-row-${train.trainNumber}`}
                    onClick={() => onSelectTrain(train.trainNumber)}
                    className="hover:bg-slate-800/40 cursor-pointer transition group"
                  >
                    {/* Number & Name */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {train.trainNumber}
                        </span>
                        <div className="min-w-0">
                          <span className="font-medium text-slate-200 group-hover:text-amber-400 transition block truncate max-w-[200px]">
                            {train.trainName}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase">
                            {train.trainType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Origin → Terminus */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-100">{train.sourceStationCode}</span>
                        <span className="text-slate-600">→</span>
                        <span className="font-semibold text-slate-100">{train.destinationStationCode}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">
                        {train.sourceStationName} to {train.destinationStationName}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge
                        status={train.status}
                        delayMinutes={train.position.currentDelayMinutes}
                        size="sm"
                      />
                    </td>

                    {/* Current location */}
                    <td className="py-3.5 px-4 text-slate-300 max-w-[230px]">
                      {train.position.currentStationCode ? (
                        <div className="flex items-center gap-1 font-mono text-amber-400">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span>Halted at {train.position.currentStationName} ({train.position.currentStationCode})</span>
                        </div>
                      ) : (
                        <div className="truncate text-[11px] text-slate-300 leading-tight">
                          {train.position.currentLocationDescription}
                        </div>
                      )}
                      <span className="text-[10px] font-mono text-slate-500 block truncate mt-0.5">
                        {train.position.sectionBlock || 'Corridor Main Line'}
                      </span>
                    </td>

                    {/* Next Station */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <span className="font-semibold text-amber-400">
                        {train.position.nextStationName}
                      </span>
                      <span className="text-slate-500 ml-1">
                        ({train.position.nextStationCode})
                      </span>
                    </td>

                    {/* Speed */}
                    <td className="py-3.5 px-4 font-mono text-right text-slate-200">
                      <span className="font-semibold">{train.position.speedKmph}</span>{' '}
                      <span className="text-slate-500 text-[10px]">km/h</span>
                    </td>

                    {/* Delay / Dynamic ETA */}
                    <td className="py-3.5 px-4 font-mono text-right whitespace-nowrap">
                      <div>
                        {train.position.currentDelayMinutes > 0 ? (
                          <span className="text-orange-400 font-bold">
                            +{train.position.currentDelayMinutes}m
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium">Right Time</span>
                        )}
                      </div>
                      {train.futurePredictionContract?.predictedArrival && (
                        <div className="text-[10px] text-amber-400 font-semibold mt-0.5">
                          ETA: {train.futurePredictionContract.predictedArrival}
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTrain(train.trainNumber);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-mono text-[11px] transition border border-slate-700 inline-flex items-center gap-1"
                      >
                        Inspect <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trains.map((train) => (
            <div
              key={train.trainNumber}
              id={`train-card-${train.trainNumber}`}
              onClick={() => onSelectTrain(train.trainNumber)}
              className="rounded-lg border border-slate-800 bg-[#0F172A]/50 p-4 hover:border-slate-700 hover:bg-slate-800/40 transition cursor-pointer space-y-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      #{train.trainNumber}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 uppercase">
                      {train.trainType.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-100 group-hover:text-amber-400 transition mt-1 truncate">
                    {train.trainName}
                  </h4>
                </div>

                <StatusBadge
                  status={train.status}
                  delayMinutes={train.position.currentDelayMinutes}
                  size="sm"
                />
              </div>

              <div className="font-mono text-xs text-slate-300 flex items-center justify-between border-t border-b border-slate-800/80 py-2">
                <div>
                  <span className="text-slate-500 text-[10px] block">ORIGIN</span>
                  <span className="font-bold">{train.sourceStationCode}</span>
                </div>
                <div className="text-slate-600 text-sm">⟶</div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">TERMINUS</span>
                  <span className="font-bold">{train.destinationStationCode}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Station:</span>
                  <span className="text-slate-200 font-medium">
                    {train.position.nextStationName} ({train.position.nextStationCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Speed:</span>
                  <span className="text-slate-200">{train.position.speedKmph} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remaining Dist:</span>
                  <span className="text-slate-200">{train.position.distanceRemainingKm} km</span>
                </div>
                {train.futurePredictionContract?.predictedArrival && (
                  <div className="flex justify-between text-amber-400 pt-1 border-t border-slate-800/40">
                    <span className="text-amber-500/80 font-bold">Dynamic ETA:</span>
                    <span className="font-bold">{train.futurePredictionContract.predictedArrival}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {train.position.currentLocationDescription}
                </span>
                <span className="text-amber-400 font-mono text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
