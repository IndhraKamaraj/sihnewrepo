import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'blue';
  id?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  variant = 'default',
  id
}) => {
  const variantStyles = {
    default: {
      border: 'border-slate-800 bg-[#0F172A]/70 text-slate-100',
      iconBg: 'bg-slate-800 text-slate-300',
      valueColor: 'text-white'
    },
    emerald: {
      border: 'border-slate-800 bg-slate-900/60 text-emerald-100',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      valueColor: 'text-emerald-400'
    },
    amber: {
      border: 'border-slate-800 bg-slate-900/60 text-amber-100',
      iconBg: 'bg-amber-500/15 text-amber-400',
      valueColor: 'text-amber-500'
    },
    rose: {
      border: 'border-slate-800 bg-slate-900/60 text-orange-100',
      iconBg: 'bg-orange-500/15 text-orange-400',
      valueColor: 'text-orange-400'
    },
    cyan: {
      border: 'border-slate-800 bg-slate-900/60 text-slate-100',
      iconBg: 'bg-amber-500/15 text-amber-400',
      valueColor: 'text-amber-400'
    },
    blue: {
      border: 'border-slate-800 bg-slate-900/60 text-blue-100',
      iconBg: 'bg-blue-500/15 text-blue-400',
      valueColor: 'text-blue-400'
    }
  }[variant];

  return (
    <div
      id={id}
      className={`rounded-lg p-3.5 sm:p-4 border transition-all duration-150 ${variantStyles.border} shadow-sm`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded ${variantStyles.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-2xl font-mono font-black tracking-tight tabular-nums ${variantStyles.valueColor}`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-slate-500 font-normal">
            {unit}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-[10px] text-slate-400 truncate leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
};
