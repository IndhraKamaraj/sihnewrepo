import React, { useState, useEffect } from 'react';
import {
  Radio,
  Train as TrainIcon,
  Compass,
  MapPin,
  Cpu,
  BarChart3,
  Layers,
  Activity,
  Calendar,
  Clock,
  Sliders
} from 'lucide-react';

export type ViewType =
  | 'dashboard'
  | 'explorer'
  | 'details'
  | 'station'
  | 'simulation'
  | 'analytics';

interface HeaderProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  selectedTrainNumber?: string;
  activeTrainCount: number;
  isReplayActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  selectedTrainNumber,
  activeTrainCount,
  isReplayActive = false
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as IST (Indian Standard Time) and UTC
      const istString = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setTimeString(`${istString} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: ViewType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: Activity },
    { id: 'explorer', label: 'Train Explorer', icon: TrainIcon },
    {
      id: 'details',
      label: 'Train Details',
      icon: Layers,
      badge: selectedTrainNumber ? `#${selectedTrainNumber}` : undefined
    },
    { id: 'station', label: 'Stations & Junctions', icon: MapPin },
    { id: 'simulation', label: 'Replay & Stress Testing', icon: Sliders },
    { id: 'analytics', label: 'Evaluation Analytics', icon: BarChart3 }
  ];

  return (
    <header className="border-b border-slate-800 bg-[#0F172A] sticky top-0 z-40 backdrop-blur-md">
      {/* Top operational status bar */}
      <div className="px-4 sm:px-6 py-2 border-b border-slate-800/80 bg-[#0B0F19]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isReplayActive ? 'bg-amber-400 animate-ping' : 'bg-blue-400 animate-pulse'} ring-4 ${isReplayActive ? 'ring-amber-500/30' : 'ring-blue-500/20'}`} />
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-300 uppercase">
              System Mode:
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-mono text-[10px] font-bold">
              REPLAY / TEST MODE
            </span>
            <span className="text-xs text-slate-400 font-mono hidden md:inline">
              (Simulated Telemetry — Not Live Railway Data)
            </span>
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="hidden lg:inline font-mono text-[11px] text-slate-500">
            SIH Problem Statement 26028 · Dynamic ETA Intelligence Engine
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-500" />
            <span>Feed:</span>
            <span className="text-slate-200 font-medium">
              {isReplayActive ? 'PROGRESSION_REPLAY_ACTIVE' : 'SIMULATED_TEST_FEED'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-amber-400 font-medium tabular-nums">{timeString || '12:00:00 IST'}</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center shadow-sm">
            <TrainIcon className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white uppercase">
                RY-DYNAMICS
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-semibold border border-slate-700">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Railway ETA Intelligence Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-slate-800/50 border-b-2 border-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-b-2 border-transparent font-normal'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
