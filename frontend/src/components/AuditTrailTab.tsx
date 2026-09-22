import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Key, CheckCircle, RefreshCw } from 'lucide-react';
import type { AuditLogEntry } from '../types';
import { api } from '../services/api';

interface AuditTrailTabProps {
  logs: AuditLogEntry[];
  onRefresh: () => void;
}

export const AuditTrailTab: React.FC<AuditTrailTabProps> = ({ logs, onRefresh }) => {
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    total_records: number;
    status: string;
    latest_hash?: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerifyLedger = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyAuditChain();
      setVerificationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              Immutable Cryptographic Audit Trail (SHA-256 Chained)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every task state transition, reviewer signature, and security event is sequentially chained to guarantee non-repudiation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerifyLedger}
            disabled={verifying}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-md transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{verifying ? 'Verifying Hashes...' : 'Verify Ledger Integrity'}</span>
          </button>
          <button
            onClick={onRefresh}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg ${
          verificationResult.verified
            ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
            : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
        }`}>
          {verificationResult.verified ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <div className="font-bold text-sm">
              {verificationResult.verified ? 'Cryptographic Integrity Confirmed: Unbroken Chain' : 'Warning: Ledger Mismatch'}
            </div>
            <div>Status: {verificationResult.status} • Total Chained Entries: {verificationResult.total_records}</div>
            {verificationResult.latest_hash && (
              <div className="font-mono text-[10px] text-emerald-400/90 break-all">
                Root Merkle/Chain Tip: {verificationResult.latest_hash}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Entry ID</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Actor / Role</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Event Details</th>
                <th className="py-2.5 px-3">Chained SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 text-amber-400 font-bold">{log.id}</td>
                  <td className="py-3 px-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-3 px-3">
                    <span className="text-slate-200 font-sans font-semibold">{log.actor_username}</span>
                    <span className="block text-[10px] text-slate-500 font-mono">[{log.actor_role}]</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      log.security_flag
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300 text-xs max-w-[280px] truncate" title={log.event_details}>
                    {log.event_details}
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[10px] truncate max-w-[140px]" title={`Current: ${log.entry_hash}\nPrevious: ${log.previous_hash}`}>
                    {log.entry_hash.substring(0, 14)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
