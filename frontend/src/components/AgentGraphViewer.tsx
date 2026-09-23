import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Wrench } from 'lucide-react';
import type { TaskStepEvent } from '../types';

interface AgentGraphViewerProps {
  steps: TaskStepEvent[];
  activeStepNumber?: number;
}

export const AgentGraphViewer: React.FC<AgentGraphViewerProps> = ({ steps }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Agentic State Orchestration Graph
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          State Machine: Understand → Plan → Retrieve → Execute → Validate → HITL → Deliver → Audit
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step) => {
          const isDone = step.status === 'COMPLETED';
          const isHitl = step.status === 'WAITING_HITL';
          const isFailed = step.status === 'FAILED';

          let borderClass = 'border-slate-200 bg-slate-50/80';
          let badgeClass = 'bg-slate-100 text-slate-700 border border-slate-300 font-semibold';
          let icon = <Clock className="w-4 h-4 text-slate-500" />;

          if (isDone) {
            borderClass = 'border-emerald-300 bg-emerald-50/70 shadow-xs';
            badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-700" />;
          } else if (isHitl) {
            borderClass = 'border-amber-400 bg-amber-50/90 shadow-sm ring-1 ring-amber-300';
            badgeClass = 'bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse';
            icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
          } else if (isFailed) {
            borderClass = 'border-rose-300 bg-rose-50 shadow-xs';
            badgeClass = 'bg-rose-100 text-rose-800 border border-rose-300 font-bold';
            icon = <AlertTriangle className="w-4 h-4 text-rose-600" />;
          }

          return (
            <div
              key={step.step_number}
              className={`p-3.5 rounded-lg border flex flex-col justify-between transition-all duration-200 ${borderClass}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    STEP {step.step_number}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${badgeClass}`}>
                    {icon}
                    {step.status}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                  {step.step_name}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                  {step.summary}
                </p>
              </div>

              <div>
                {step.tool_used && (
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-900 font-mono font-semibold bg-blue-50 border border-blue-200 px-2 py-1 rounded mb-2">
                    <Wrench className="w-3 h-3 text-blue-700" />
                    <span>tool: {step.tool_used}</span>
                  </div>
                )}

                {step.warnings && step.warnings.length > 0 && (
                  <div className="text-[10px] text-amber-900 bg-amber-50 border border-amber-300 p-1.5 rounded font-semibold">
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
