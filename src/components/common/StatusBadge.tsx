import React from 'react';
import { TrainStatus, StationStopStatus } from '../../types/train';

interface StatusBadgeProps {
  status: TrainStatus | StationStopStatus | string;
  delayMinutes?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  delayMinutes = 0,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 tracking-tight',
    md: 'text-xs px-2.5 py-1 tracking-normal',
    lg: 'text-sm px-3 py-1.5'
  }[size];

  switch (status) {
    case 'RUNNING':
    case 'ON_TIME':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {delayMinutes > 0 ? `RUNNING (+${delayMinutes}m)` : 'ON SCHEDULE'}
        </span>
      );

    case 'DELAYED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-mono font-medium bg-orange-500/10 text-orange-400 border border-orange-500/30 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          DELAYED {delayMinutes > 0 ? `(+${delayMinutes}m)` : ''}
        </span>
      );

    case 'APPROACHING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          APPROACHING
        </span>
      );

    case 'CURRENT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          AT STATION
        </span>
      );

    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700/50 ${sizeClasses}`}
        >
          DEPARTED
        </span>
      );

    case 'NEXT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 ${sizeClasses}`}
        >
          NEXT STOP
        </span>
      );

    case 'UPCOMING':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded font-mono font-medium bg-slate-900/80 text-slate-400 border border-slate-800 ${sizeClasses}`}
        >
          SCHEDULED
        </span>
      );

    case 'TERMINUS':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30 ${sizeClasses}`}
        >
          DESTINATION
        </span>
      );

    case 'HOLD':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 ${sizeClasses} animate-pulse`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          HOLD (BLOCKED)
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1 rounded font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
};
