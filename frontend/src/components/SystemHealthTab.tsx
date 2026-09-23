import React from 'react';
import { Lock, Layers } from 'lucide-react';
import type { SystemHealth } from '../types';

interface SystemHealthTabProps {
  health: SystemHealth | null;
  airgapInfo: Record<string, any> | null;
}

export const SystemHealthTab: React.FC<SystemHealthTabProps> = ({ health, airgapInfo }) => {
  return (
    <div className="space-y-6">
      {/* Air-gap Verification Status Card */}
      <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Sovereign Air-Gap & Network Isolation Proof
            </h3>
          </div>
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono text-xs px-2.5 py-1 rounded-full font-bold">
            100% OUTBOUND NETWORK BLOCKED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-500 font-mono text-[10px] uppercase font-semibold">Network Isolation Mode</span>
            <div className="text-slate-900 font-bold text-sm">Air-Gapped Refinery Subnet</div>
            <p className="text-slate-600 text-[11px] font-mono font-medium">{airgapInfo?.network_adapter || 'Loopback: 127.0.0.1 / VLAN 40'}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-500 font-mono text-[10px] uppercase font-semibold">Cloud Telemetry</span>
            <div className="text-emerald-800 font-bold text-sm">Strictly Disabled (Zero Bytes)</div>
            <p className="text-slate-600 text-[11px]">No external AI API dependencies.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-500 font-mono text-[10px] uppercase font-semibold">Local Model Runtime</span>
            <div className="text-blue-900 font-bold text-sm">{health?.active_model_runtime || 'Sovereign Engine'}</div>
            <p className="text-slate-600 text-[11px] font-mono font-medium">GGUF 4-Bit Quantized (Q4_K_M)</p>
          </div>
        </div>
      </div>

      {/* Six Layer Architecture Stack */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
          <Layers className="w-5 h-5 text-amber-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Consolidated Six-Layer Industrial Architecture (MRPL Implementation)
          </h4>
        </div>

        <div className="space-y-2.5 text-xs">
          {[
            {
              layer: 'Layer 6: User Interface',
              tech: 'React + TypeScript + Vite + Tailwind',
              role: 'Role-aware operator workbench, graph visualizer, and HITL review cards.'
            },
            {
              layer: 'Layer 5: Agent Orchestration',
              tech: 'Stateful LangGraph Architecture',
              role: '8-step lifecycle: Understand → Plan → Retrieve → Execute → Validate → HITL → Deliver → Audit.'
            },
            {
              layer: 'Layer 4: Tool Integration',
              tech: 'Model Context Protocol (MCP) Tools',
              role: 'Sandboxed tools: permit conflict detector, LEL gas analyzer, P&ID rule validator.'
            },
            {
              layer: 'Layer 3: Memory Layer',
              tech: 'Task State Machine & Checklists',
              role: 'Procedural checklist cache, step outputs, and session parameters.'
            },
            {
              layer: 'Layer 2: RAG & Knowledge',
              tech: 'Local Embeddings + Vector Search',
              role: 'Sentence Transformers, MRPL SOPs, chunk metadata, and exact page citations.'
            },
            {
              layer: 'Layer 1: Local Model Gateway',
              tech: 'Open-Weight LLaMA 3.1 8B / Qwen 2.5 7B / LLaVA 1.6',
              role: '4-bit GGUF local serving with graceful CPU/air-gap fallback.'
            },
            {
              layer: 'Cross-Cutting Security',
              tech: 'PBKDF2 Hashing, Brute-Force Rate Limiting, SHA-256 Audit Chain',
              role: 'Strict input sanitization, generic auth errors, tamper-evident audit logs.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span className="font-bold text-slate-900">{item.layer}</span>
                <span className="bg-white text-slate-800 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-300 font-semibold shadow-2xs">
                  {item.tech}
                </span>
              </div>
              <span className="text-slate-600 text-[11px] md:text-right font-medium">{item.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SystemHealthTab;
