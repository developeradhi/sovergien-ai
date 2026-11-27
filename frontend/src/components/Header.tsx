import React from 'react';
import { Cpu, Lock, UserCheck, Flame, RefreshCw, ExternalLink, Activity, BookOpen, Server } from 'lucide-react';
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
    <header className="bg-white border-b border-slate-200 text-slate-900 px-6 py-4 shadow-xs">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-500 to-red-600 p-2.5 rounded-lg shadow-sm flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wider text-slate-900">SOVEREIGN<span className="text-amber-600">AI</span></span>
              <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-mono font-semibold border border-slate-200">SIH26117</span>
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Mangalore Refinery and Petrochemicals Limited (MRPL) • Smart Automation
            </div>
          </div>
        </div>

        {/* Air-gap, Model Status & Endpoints */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-3 py-1.5 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-bold tracking-wide">AIR-GAP ENFORCED</span>
            <span className="text-emerald-700 font-mono text-[10px] font-semibold">0 Outbound Calls</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-full">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600 font-medium">Model:</span>
            <span className="font-mono text-blue-900 font-bold">{health?.active_model_text || 'LLaMA-3.1-8B-Q4_K_M'}</span>
          </div>

          {/* Direct Links to Tunneled Endpoints */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
            <a
              href="/backend-portal"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 transition-colors"
              title="Open Backend Executive Portal"
            >
              <Server className="w-3 h-3 text-amber-600" />
              <span>Backend Portal</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>

            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 transition-colors"
              title="Open Swagger API Specs"
            >
              <BookOpen className="w-3 h-3 text-blue-600" />
              <span>Swagger Docs</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>

            <a
              href="/health"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 transition-colors"
              title="View Health Status Endpoint"
            >
              <Activity className="w-3 h-3 text-emerald-600" />
              <span>Health</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="Refresh System Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity & Role Switcher */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-left text-xs">
            <div className="font-bold text-slate-900 truncate max-w-[170px]">{user?.full_name || 'Authenticating...'}</div>
            <div className="text-[11px] text-slate-600 font-mono">{user?.badge_number} • {user?.department}</div>
          </div>
          <div className="border-l border-slate-200 pl-2">
            <select
              value={user?.role || 'Operator'}
              onChange={(e) => onRoleChange(e.target.value as Role)}
              className="bg-white text-slate-900 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer"
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
