import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Wrench } from 'lucide-react';
import type { TaskStepEvent } from '../types';

interface AgentGraphViewerProps {
  steps: TaskStepEvent[];
  activeStepNumber?: number;
}

export const AgentGraphViewer: React.FC<AgentGraphViewerProps> = ({ steps }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Agentic State Orchestration Graph
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          State Machine: Understand → Plan → Retrieve → Execute → Validate → HITL → Deliver → Audit
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step) => {
          const isDone = step.status === 'COMPLETED';
          const isHitl = step.status === 'WAITING_HITL';
          const isFailed = step.status === 'FAILED';

          let borderClass = 'border-slate-800 bg-slate-950/60';
          let badgeClass = 'bg-slate-800 text-slate-400';
          let icon = <Clock className="w-4 h-4 text-slate-500" />;

          if (isDone) {
            borderClass = 'border-emerald-800/60 bg-emerald-950/20';
            badgeClass = 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
          } else if (isHitl) {
            borderClass = 'border-amber-600/70 bg-amber-950/30 animate-pulse';
            badgeClass = 'bg-amber-900/80 text-amber-300 border border-amber-500';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
          } else if (isFailed) {
            borderClass = 'border-rose-900/60 bg-rose-950/20';
            badgeClass = 'bg-rose-900/60 text-rose-300 border border-rose-700';
            icon = <AlertTriangle className="w-4 h-4 text-rose-400" />;
          }

          return (
            <div
              key={step.step_number}
              className={`p-3.5 rounded-lg border flex flex-col justify-between transition-all duration-200 ${borderClass}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    STEP {step.step_number}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${badgeClass}`}>
                    {icon}
                    {step.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-200 mb-1 leading-snug">
                  {step.step_name}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                  {step.summary}
                </p>
              </div>

              <div>
                {step.tool_used && (
                  <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono bg-cyan-950/40 border border-cyan-800/40 px-2 py-1 rounded mb-2">
                    <Wrench className="w-3 h-3 text-cyan-400" />
                    <span>tool: {step.tool_used}</span>
                  </div>
                )}

                {step.warnings && step.warnings.length > 0 && (
                  <div className="text-[10px] text-amber-300 bg-amber-950/50 border border-amber-800/50 p-1.5 rounded">
                    {step.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <span>⚠</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
