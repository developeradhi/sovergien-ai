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
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              Immutable Cryptographic Audit Trail (SHA-256 Chained)
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Every task state transition, reviewer signature, and security event is sequentially chained to guarantee non-repudiation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerifyLedger}
            disabled={verifying}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{verifying ? 'Verifying Hashes...' : 'Verify Ledger Integrity'}</span>
          </button>
          <button
            onClick={onRefresh}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
          verificationResult.verified
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {verificationResult.verified ? (
            <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <div className="font-bold text-sm">
              {verificationResult.verified ? 'Cryptographic Integrity Confirmed: Unbroken Chain' : 'Warning: Ledger Mismatch'}
            </div>
            <div className="font-medium text-emerald-800">Status: {verificationResult.status} • Total Chained Entries: {verificationResult.total_records}</div>
            {verificationResult.latest_hash && (
              <div className="font-mono text-[10px] text-emerald-900 break-all font-semibold">
                Root Merkle/Chain Tip: {verificationResult.latest_hash}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-bold">Entry ID</th>
                <th className="py-2.5 px-3 font-bold">Timestamp (UTC)</th>
                <th className="py-2.5 px-3 font-bold">Actor / Role</th>
                <th className="py-2.5 px-3 font-bold">Action Type</th>
                <th className="py-2.5 px-3 font-bold">Event Details</th>
                <th className="py-2.5 px-3 font-bold">Chained SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 text-amber-800 font-bold">{log.id}</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-3 px-3">
                    <span className="text-slate-900 font-sans font-bold">{log.actor_username}</span>
                    <span className="block text-[10px] text-slate-500 font-mono">[{log.actor_role}]</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      log.security_flag
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-700 text-xs max-w-[280px] truncate" title={log.event_details}>
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
export default AuditTrailTab;
