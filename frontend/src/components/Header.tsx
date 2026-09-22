import React from 'react';
import { Cpu, Lock, UserCheck, Flame, RefreshCw } from 'lucide-react';
import type { UserProfile, Role, SystemHealth } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  health: SystemHealth | null;
  onRoleChange: (role: Role) => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, health, onRoleChange, onRefresh }) => {
  const roles: Role[] = ['Operator', 'Safety Reviewer', 'Knowledge Admin', 'Auditor', 'System Admin'];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-500 to-red-600 p-2.5 rounded-lg shadow-lg flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wider text-slate-100">SOVEREIGN<span className="text-amber-400">AI</span></span>
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-mono font-medium border border-slate-700">SIH26117</span>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Mangalore Refinery and Petrochemicals Limited (MRPL) • Smart Automation
            </div>
          </div>
        </div>

        {/* Air-gap & Model Status Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 text-xs px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Lock className="w-3.5 h-3.5" />
            <span className="font-semibold tracking-wide">AIR-GAP ENFORCED</span>
            <span className="text-emerald-500 font-mono text-[10px]">0 Outbound Calls</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-full">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Model:</span>
            <span className="font-mono text-cyan-300 font-semibold">{health?.active_model_text || 'LLaMA-3.1-8B-Q4_K_M'}</span>
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh System Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity & Role Switcher */}
        <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-left text-xs">
            <div className="font-semibold text-slate-200 truncate max-w-[170px]">{user?.full_name || 'Authenticating...'}</div>
            <div className="text-[11px] text-slate-400 font-mono">{user?.badge_number} • {user?.department}</div>
          </div>
          <div className="border-l border-slate-800 pl-2">
            <select
              value={user?.role || 'Operator'}
              onChange={(e) => onRoleChange(e.target.value as Role)}
              className="bg-slate-800 text-amber-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  Role: {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
