import React, { useState } from 'react';
import { Search, BookOpen, FileText, Bookmark } from 'lucide-react';
import type { DocumentMetadata, Citation } from '../types';
import { api } from '../services/api';

interface KnowledgeBaseTabProps {
  documents: DocumentMetadata[];
}

export const KnowledgeBaseTab: React.FC<KnowledgeBaseTabProps> = ({ documents }) => {
  const [searchQuery, setSearchQuery] = useState('hot work clearance distance CDU-II LEL gas');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await api.queryKnowledge(searchQuery, 3);
      setCitations(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100">
            Sovereign Local Knowledge Base (RAG) & Citations Explorer
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          All document embeddings and similarity vector searches execute 100% on-premise without outbound cloud vector stores.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query refinery safety SOPs, P&ID standards, API thresholds..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Search className="w-4 h-4" />
            <span>{searching ? 'Querying Vector Index...' : 'Semantic Query'}</span>
          </button>
        </form>
      </div>

      {/* Query Results / Citations */}
      {citations.length > 0 && (
        <div className="bg-slate-900 border border-cyan-800/50 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-cyan-400" />
              Retrieved Grounded Citations ({citations.length} Chunks)
            </span>
            <span className="text-[11px] font-mono text-slate-400">Embedding: all-MiniLM-L6-v2 (CPU-Local)</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {citations.map((c, i) => (
              <div key={i} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 hover:border-slate-700 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-800 text-amber-300 font-mono text-[11px] px-2 py-0.5 rounded font-semibold border border-slate-700">
                      {c.source_filename}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{c.section}</span>
                    <span className="text-xs text-slate-400 font-mono">• Page {c.page_number}</span>
                  </div>
                  <div className="text-[11px] font-mono bg-cyan-950 border border-cyan-800/60 text-cyan-300 px-2 py-0.5 rounded">
                    Relevance: {(c.relevance_score * 100).toFixed(1)}%
                  </div>
                </div>
                <p className="text-xs text-slate-300 bg-slate-900/60 border-l-2 border-amber-500 p-2.5 rounded-r font-sans leading-relaxed">
                  "{c.evidence_text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indexed Documents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Approved Refinery Knowledge Sources & Manuals
            </h4>
            <p className="text-xs text-slate-400">
              Pre-indexed on-premise documents verified with SHA-256 integrity checksums.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-800/50 px-2.5 py-1 rounded">
            {documents.length} Source Documents Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Document Code / Title</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Pages</th>
                <th className="py-2.5 px-3">Extraction Pipeline</th>
                <th className="py-2.5 px-3">SHA-256 Checksum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>{doc.filename}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/70 border border-amber-700/50 text-amber-300">
                      {doc.classification}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">{doc.page_count} pages</td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{doc.extraction_path}</td>
                  <td className="py-3 px-3 font-mono text-slate-500 text-[10px] truncate max-w-[140px]" title={doc.sha256_checksum}>
                    {doc.sha256_checksum.substring(0, 16)}...
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
