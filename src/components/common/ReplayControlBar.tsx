import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  StepBack,
  Gauge,
  Clock,
  MapPin,
  AlertTriangle,
  Radio,
  SlidersHorizontal,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';
import { Train } from '../../types/train';
import { railwayDataService, RouteWaypoint } from '../../services/RailwayDataService';

interface ReplayControlBarProps {
  train: Train;
  onTrainChange?: (trainNumber: string) => void;
  availableTrains?: Train[];
  compact?: boolean;
}

export const ReplayControlBar: React.FC<ReplayControlBarProps> = ({
  train,
  onTrainChange,
  availableTrains = [],
  compact = false
}) => {
  const [showResetMenu, setShowResetMenu] = useState(false);
  const replayState = railwayDataService.getReplayState(train.trainNumber);
  const waypoints = railwayDataService.getWaypointsForTrain(train.trainNumber);

  const currentWp = waypoints[replayState.currentWaypointIndex] || waypoints[0];
  const isTerminated = train.status === 'TERMINATED' || replayState.currentWaypointIndex >= waypoints.length - 1;

  const handlePlayPause = () => {
    if (replayState.isPlaying) {
      railwayDataService.pauseReplay(train.trainNumber);
    } else {
      railwayDataService.playReplay(train.trainNumber);
    }
  };

  const handleStepForward = () => {
    railwayDataService.stepTrainForward(train.trainNumber);
  };

  const handleStepBackward = () => {
    railwayDataService.stepTrainBackward(train.trainNumber);
  };

  const handleResetToOrigin = () => {
    railwayDataService.resetTrainToOrigin(train.trainNumber);
    setShowResetMenu(false);
  };

  const handleResetToBaseline = () => {
    railwayDataService.resetTrainToBaseline(train.trainNumber);
    setShowResetMenu(false);
  };

  const handleSpeedChange = (speed: number) => {
    railwayDataService.setReplaySpeed(train.trainNumber, speed);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    railwayDataService.jumpToWaypoint(train.trainNumber, idx);
  };

  const speeds = [1, 2, 5, 10];

  return (
    <div
      id="replay-test-control-bar"
      className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-[#0F172A] to-[#0B0F19] p-4 shadow-xl mb-6 relative overflow-hidden"
    >
      {/* Top Banner & Context */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-mono text-xs font-bold tracking-wider animate-pulse">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            REPLAY / TEST MODE
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Route Progression & Dynamic State Telemetry Simulator
          </span>
        </div>

        {/* Train Selector if available */}
        {availableTrains.length > 1 && onTrainChange && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">Active Train:</span>
            <select
              value={train.trainNumber}
              onChange={(e) => onTrainChange(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded px-2.5 py-1 font-mono text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {availableTrains.map((t) => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  #{t.trainNumber} {t.trainName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Operational Hold Banner in Replay Bar */}
      {replayState.isTrainHeld && (
        <div className="mt-3 p-3 rounded-lg bg-red-950/70 border border-red-500/40 text-xs font-mono text-red-200 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span className="font-bold">
              {replayState.operationalHoldReason || 'Train held at block boundary due to active track block.'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold uppercase tracking-wider">
            HOLD ENFORCED · PROGRESSION PAUSED
          </span>
        </div>
      )}

      {/* Primary Replay Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3">
        {/* Playback Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          {replayState.isTrainHeld ? (
            <button
              disabled
              title="Train is held at track block entrance. Clear track block to resume."
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-mono text-xs font-bold tracking-wider bg-red-950/60 text-red-300 border border-red-500/40 cursor-not-allowed opacity-80"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              HELD
            </button>
          ) : (
            <button
              onClick={handlePlayPause}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wider transition shadow-md ${
                replayState.isPlaying
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-300 ring-2 ring-amber-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
              }`}
            >
              {replayState.isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  PAUSE
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  PLAY
                </>
              )}
            </button>
          )}

          {/* Step Backward */}
          <button
            onClick={handleStepBackward}
            disabled={replayState.currentWaypointIndex <= 0}
            title="Step backward to previous waypoint"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            <StepBack className="w-4 h-4" />
          </button>

          {/* Step Forward */}
          <button
            onClick={handleStepForward}
            disabled={isTerminated || replayState.isTrainHeld}
            title={
              replayState.isTrainHeld
                ? 'Cannot step forward: train is in operational hold due to track block.'
                : 'Step forward to next milestone waypoint'
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 font-mono text-xs font-bold border border-slate-700 transition hover:border-amber-500/50"
          >
            <StepForward className="w-4 h-4 text-amber-400" />
            STEP FORWARD
          </button>

          {/* Reset Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowResetMenu(!showResetMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              RESET
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showResetMenu && (
              <div className="absolute left-0 mt-1 w-56 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl p-1 z-30 text-xs font-mono">
                <button
                  onClick={handleResetToOrigin}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-amber-300 flex flex-col gap-0.5"
                >
                  <span className="font-bold">Reset to Route Origin (0 km)</span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    Start journey from #{train.sourceStationCode}
                  </span>
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  onClick={handleResetToBaseline}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-slate-300 flex flex-col gap-0.5"
                >
                  <span className="font-bold">Reset to Initial Baseline</span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    Restore original verified snapshot state
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Replay Speed Multiplier Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase px-2">Speed:</span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                replayState.speedMultiplier === s
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress Timeline / Scrubber */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-[11px] font-mono mb-1.5 text-slate-400">
          <span className="text-slate-300">
            Waypoint {replayState.currentWaypointIndex + 1} of {waypoints.length}:{' '}
            <strong className="text-amber-400 font-medium">
              {currentWp ? currentWp.type.replace('_', ' ') : 'PROGRESSING'}
            </strong>
          </span>
          <span>
            {train.position.distanceTravelledKm} km travelled / {train.totalDistanceKm} km total (
            {Math.round((train.position.distanceTravelledKm / train.totalDistanceKm) * 100)}%)
          </span>
        </div>

        {/* Range Scrubber */}
        <input
          type="range"
          min="0"
          max={waypoints.length - 1}
          value={replayState.currentWaypointIndex}
          onChange={handleScrubberChange}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
        />

        {/* Station Station Milestone Markers */}
        <div className="flex justify-between items-center mt-2 px-1 text-[10px] font-mono text-slate-400">
          {train.route.map((stop) => {
            const isCompleted = stop.status === 'COMPLETED';
            const isCurrent = stop.status === 'CURRENT';
            const isNext = stop.status === 'NEXT';

            return (
              <button
                key={stop.stationCode}
                onClick={() => railwayDataService.jumpToStation(train.trainNumber, stop.stationCode)}
                className={`flex flex-col items-center hover:opacity-100 transition cursor-pointer ${
                  isCurrent
                    ? 'text-amber-400 font-bold scale-110'
                    : isNext
                    ? 'text-blue-400 font-bold'
                    : isCompleted
                    ? 'text-emerald-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full mb-1 border border-current bg-current/20" />
                <span>{stop.stationCode}</span>
                <span className="text-[9px] text-slate-500 hidden md:inline">{stop.distanceFromSourceKm}k</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetry Quick Summary Bar */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-slate-950/60 px-2.5 py-1.5 rounded border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase block">Current Location</span>
          <span className="text-slate-200 truncate block" title={train.position.currentLocationDescription}>
            {train.position.currentLocationDescription}
          </span>
        </div>

        <div className="bg-slate-950/60 px-2.5 py-1.5 rounded border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase block">Current Speed</span>
          <span className="text-amber-400 font-bold">
            {train.position.speedKmph} km/h
          </span>
        </div>

        <div className="bg-slate-950/60 px-2.5 py-1.5 rounded border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase block">Operational Delay</span>
          <span className={train.position.currentDelayMinutes > 0 ? 'text-orange-400 font-bold' : 'text-emerald-400 font-bold'}>
            {train.position.currentDelayMinutes > 0 ? `+${train.position.currentDelayMinutes} min` : 'On Time'}
          </span>
        </div>

        <div className="bg-slate-950/60 px-2.5 py-1.5 rounded border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase block">Next Station Ahead</span>
          <span className="text-blue-400 font-bold">
            {train.position.nextStationCode} ({train.position.distanceRemainingKm} km to dest)
          </span>
        </div>
      </div>

      {/* Strict Provenance Warning Notice */}
      <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-amber-300/80 bg-amber-500/10 px-3 py-1.5 rounded border border-amber-500/20">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          <strong>REPLAY / TEST MODE:</strong> Operational state and telemetry are dynamically simulated for route progression validation. This is <strong>not</strong> live railway data.
        </span>
      </div>
    </div>
  );
};
