import React from 'react';
import { Database, ShieldAlert, CheckCircle2, Clock, Play, Cpu, AlertTriangle } from 'lucide-react';
import { DataProvenance } from '../../types/train';

interface DataProvenanceCardProps {
  provenance: DataProvenance;
  className?: string;
}

export const DataProvenanceCard: React.FC<DataProvenanceCardProps> = ({
  provenance,
  className = ''
}) => {
  const isReplay =
    provenance.feedType === 'REPLAY_TEST_FEED' ||
    provenance.sourceName.toUpperCase().includes('REPLAY');
  const isSimulation =
    provenance.feedType === 'SIMULATED_FEED' && !isReplay;

  return (
    <div
      className={`rounded-lg border ${
        isReplay
          ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-[#0F172A]/90'
          : 'border-slate-800 bg-[#0F172A]/70'
      } p-4 text-xs text-slate-300 font-sans ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-bold text-slate-200 tracking-wider uppercase text-[10px]">
            Data Provenance & Telemetry Lineage
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isReplay ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/60 font-mono text-[10px] font-bold tracking-wider animate-pulse">
              <Play className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              REPLAY / TEST MODE
            </span>
          ) : isSimulation ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono text-[10px] font-bold">
              <Cpu className="w-2.5 h-2.5" />
              SIMULATION
            </span>
          ) : provenance.isLiveFeed ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
              <CheckCircle2 className="w-2.5 h-2.5" />
              VERIFIED LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 font-mono text-[10px] font-medium">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              VERIFIED (OFFLINE SNAPSHOT)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-1 text-[11px]">
        <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
          <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Source Lineage:</span>
          <span className="font-mono text-slate-200 font-medium">
            {provenance.sourceName}
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
          <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Record Identifier:</span>
          <span className="font-mono text-amber-400 font-medium">
            {provenance.recordIdentifier}
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
          <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            Snapshot / Event Timestamp:
          </span>
          <span className="font-mono text-slate-200">
            {provenance.snapshotTimestamp}
          </span>
        </div>
      </div>

      {/* Operational Provenance Warning */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-400 leading-normal">
        {isReplay ? (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded p-2 text-amber-300 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <strong className="text-amber-200 uppercase tracking-wider">REPLAY / TEST MODE NOTICE: </strong>
              Operational telemetry is generated via the local route progression simulator. This mode is for system testing and demonstration purposes only and is <strong>NOT</strong> live railway data.
            </div>
          </div>
        ) : (
          <div>
            <span className="text-amber-400 font-semibold uppercase tracking-wider">Operational Notice: </span>
            {provenance.dataAccuracyDisclaimer}
          </div>
        )}
      </div>
    </div>
  );
};
