import React, { useState } from 'react';
import { UploadCloud, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { DocumentMetadata } from '../types';

interface DocumentUploadTabProps {
  onDocumentUploaded: () => void;
}

export const DocumentUploadTab: React.FC<DocumentUploadTabProps> = ({ onDocumentUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<DocumentMetadata | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
      setUploadedDoc(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);
    try {
      const doc = await api.uploadDocument(file);
      setUploadedDoc(doc);
      setFile(null);
      onDocumentUploaded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <UploadCloud className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">
            Confidential Industrial Document Ingestion & Routing
          </h3>
        </div>
        <p className="text-xs text-slate-600 mb-6">
          Files are validated, checksummed with SHA-256, sanitized, and routed to the appropriate local extraction pipeline (PyMuPDF for text PDFs, Tesseract for scanned sheets, or local VLM for P&ID drawings).
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-8 text-center bg-slate-50 transition-colors">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept=".pdf,.docx,.xlsx,.txt,.png,.jpg"
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
              <span className="text-sm font-bold text-slate-800">
                {file ? file.name : 'Select or drop refinery technical document'}
              </span>
              <span className="text-xs text-slate-500 mt-1 font-mono">
                Supported: PDF, DOCX, XLSX, TXT, Scanned Inspection Images (Max: 25MB)
              </span>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono">
              <span className="text-slate-800 font-bold">{file.name}</span>
              <span className="text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!file || uploading}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                file && !uploading
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{uploading ? 'Validating & Indexing...' : 'Ingest Document Safely'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Upload Success Feedback */}
      {uploadedDoc && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>Document Ingestion & Checksum Verification Successful</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-slate-500 block text-[10px] uppercase font-mono font-semibold">Document ID</span>
              <span className="font-bold text-slate-900 font-mono">{uploadedDoc.id}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-slate-500 block text-[10px] uppercase font-mono font-semibold">Routing Path</span>
              <span className="font-bold text-blue-800">{uploadedDoc.extraction_path}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-slate-500 block text-[10px] uppercase font-mono font-semibold">SHA-256 Checksum</span>
              <span className="text-slate-600 font-mono text-[10px] truncate block" title={uploadedDoc.sha256_checksum}>
                {uploadedDoc.sha256_checksum}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DocumentUploadTab;
