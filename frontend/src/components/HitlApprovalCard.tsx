import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, UserCheck, Clock } from 'lucide-react';
import type { Task, UserProfile } from '../types';

interface HitlApprovalCardProps {
  task: Task;
  currentUser: UserProfile | null;
  onReview: (decision: 'APPROVE' | 'REJECT', comments: string, conditionsMet: boolean, durationHours: number) => Promise<void>;
}

export const HitlApprovalCard: React.FC<HitlApprovalCardProps> = ({ task, currentUser, onReview }) => {
  const [comments, setComments] = useState(
    'Hot work permit authorized under strict continuous nitrogen purging on Column C-101 overhead manifold, verified 0.0% LEL prior to ignition, and certified Fire Watch attendant with dual 10kg DCP extinguishers stationed at site.'
  );
  const [conditionsMet, setConditionsMet] = useState(true);
  const [durationHours, setDurationHours] = useState(8);
  const [submitting, setSubmitting] = useState(false);

  const canReview = currentUser?.role === 'Safety Reviewer' || currentUser?.role === 'System Admin';

  const handleSubmit = async (decision: 'APPROVE' | 'REJECT') => {
    if (!comments.trim()) return;
    setSubmitting(true);
    try {
      await onReview(decision, comments, conditionsMet, durationHours);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-amber-500/70 rounded-xl p-5 shadow-2xl relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-2 right-4 text-amber-500/10 font-black text-6xl select-none pointer-events-none">
        HITL
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-wide">
              Mandatory Safety Officer Review Checkpoint (HITL)
            </h4>
            <p className="text-xs text-amber-400/90 font-medium">
              Autonomous execution halted. Industrial safety regulations require certified human sign-off.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="bg-amber-950/80 border border-amber-600/50 text-amber-300 text-xs font-mono px-2.5 py-1 rounded">
            Task ID: {task.id}
          </span>
        </div>
      </div>

      {/* Hazards and Mitigations Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-rose-950/30 border border-rose-900/60 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>IDENTIFIED PROCESS HAZARDS & CONFLICTS:</span>
          </div>
          <ul className="text-xs text-rose-200/90 space-y-1.5 list-disc list-inside">
            {task.hazards_detected.map((h, i) => (
              <li key={i} className="leading-relaxed">{h}</li>
            ))}
          </ul>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>MANDATORY PREVENTIVE CONTROLS REQUIRED:</span>
          </div>
          <ul className="text-xs text-emerald-200/90 space-y-1.5 list-disc list-inside">
            {task.safety_mitigations.map((m, i) => (
              <li key={i} className="leading-relaxed">{m}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Reviewer Form Controls */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Safety Reviewer Remarks & Specific Conditions:
          </label>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Validity:</span>
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              disabled={!canReview}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-0.5"
            >
              <option value={4}>4 Hours</option>
              <option value={8}>8 Hours (Standard Shift)</option>
              <option value={12}>12 Hours</option>
            </select>
          </div>
        </div>

        <textarea
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          disabled={!canReview}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed font-sans"
          placeholder="Enter formal safety directives, standby requirements, or rejection rationale..."
        />

        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={conditionsMet}
              onChange={(e) => setConditionsMet(e.target.checked)}
              disabled={!canReview}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-400"
            />
            <span>I certify all spatial clearance, atmospheric gas, and SIMOPS checks comply with MRPL-SOP-SAF-402</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {!canReview ? (
          <div className="text-xs text-amber-400 flex items-center gap-1.5 font-medium">
            <UserCheck className="w-4 h-4" />
            <span>Currently signed in as <b>{currentUser?.role}</b>. To authorize or reject, switch role to <b>Safety Reviewer</b> in the top bar.</span>
          </div>
        ) : (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
            <UserCheck className="w-4 h-4" />
            <span>Authorized Reviewer: <b>{currentUser?.full_name}</b> ({currentUser?.badge_number})</span>
          </div>
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleSubmit('REJECT')}
            disabled={!canReview || submitting}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
              canReview
                ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300'
                : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>REJECT PERMIT</span>
          </button>

          <button
            onClick={() => handleSubmit('APPROVE')}
            disabled={!canReview || submitting}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-colors ${
              canReview
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-emerald-900/40'
                : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>AUTHORIZE & GENERATE PERMIT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
