import React, { useState, useEffect } from 'react';
import { 
  Plus, FileText, CheckCircle2, Download, 
  Layers, BookOpen, UploadCloud, Activity, ShieldCheck
} from 'lucide-react';
import type { Task, UserProfile, Role, DocumentMetadata, AuditLogEntry, SystemHealth } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { AgentGraphViewer } from './components/AgentGraphViewer';
import { HitlApprovalCard } from './components/HitlApprovalCard';
import { TaskCreatorModal } from './components/TaskCreatorModal';
import { KnowledgeBaseTab } from './components/KnowledgeBaseTab';
import { AuditTrailTab } from './components/AuditTrailTab';
import { DocumentUploadTab } from './components/DocumentUploadTab';
import { SystemHealthTab } from './components/SystemHealthTab';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workbench' | 'knowledge' | 'ingestion' | 'audit' | 'system'>('workbench');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [airgapInfo, setAirgapInfo] = useState<Record<string, any> | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  const loadAllData = async () => {
    try {
      const [userData, taskList, docList, logs, healthData, airgapData] = await Promise.all([
        api.getMe(),
        api.getTasks(),
        api.getDocuments(),
        api.getAuditLogs(),
        api.getHealth(),
        api.getAirgapStatus()
      ]);
      setUser(userData);
      setTasks(taskList);
      if (taskList.length > 0) {
        // Select first task or preserve selection
        setSelectedTask((prev) => (prev ? taskList.find((t) => t.id === prev.id) || taskList[0] : taskList[0]));
      }
      setDocuments(docList);
      setAuditLogs(logs);
      setHealth(healthData);
      setAirgapInfo(airgapData);
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRoleChange = async (newRole: Role) => {
    try {
      const updatedUser = await api.switchRole(newRole);
      setUser(updatedUser);
      // Refresh audit logs since role switch is logged
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    const created = await api.createTask(taskData);
    await loadAllData();
    setSelectedTask(created);
  };

  const handleReviewTask = async (
    decision: 'APPROVE' | 'REJECT',
    comments: string,
    conditionsMet: boolean,
    durationHours: number
  ) => {
    if (!selectedTask) return;
    const updated = await api.reviewTask(selectedTask.id, {
      decision,
      reviewer_comments: comments,
      safety_conditions_met: conditionsMet,
      authorized_duration_hours: durationHours
    });
    setSelectedTask(updated);
    await loadAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header */}
      <Header
        user={user}
        health={health}
        onRoleChange={handleRoleChange}
        onRefresh={loadAllData}
      />

      {/* Navigation Sub-Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('workbench')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'workbench'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Workbench & Tasks</span>
            {tasks.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'workbench' ? 'bg-slate-950 text-amber-300' : 'bg-slate-200 text-slate-700'
              }`}>
                {tasks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'knowledge'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Knowledge Base (RAG)</span>
          </button>

          <button
            onClick={() => setActiveTab('ingestion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'ingestion'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Document Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'system'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>System Architecture</span>
          </button>
        </div>

        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm border border-amber-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Industrial Task</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold text-slate-800">Connecting to Sovereign On-Premise Core...</p>
          </div>
        ) : (
          <>
            {activeTab === 'workbench' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Task Queue List */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Operational Task Queue ({tasks.length})
                      </span>
                      <span className="text-[11px] text-amber-700 font-mono font-bold">Real-time Stream</span>
                    </div>

                    <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                      {tasks.map((t) => {
                        const isSelected = selectedTask?.id === t.id;
                        const isWaitingReview = t.status === 'WAITING_FOR_REVIEW';
                        const isCompleted = t.status === 'COMPLETED';

                        return (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTask(t)}
                            className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-1 ring-amber-400/40'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-mono text-slate-500 font-bold">{t.id}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isWaitingReview
                                    ? 'bg-amber-100 border border-amber-300 text-amber-900 animate-pulse'
                                    : isCompleted
                                    ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {t.status === 'WAITING_FOR_REVIEW' ? 'Review Required' : t.status}
                              </span>
                            </div>

                            <div className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                              {t.title}
                            </div>

                            <div className="text-[11px] text-slate-600 font-mono line-clamp-1 mb-2">
                              {t.unit_location}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200">
                              <span>Priority: <b className="text-amber-800">{t.priority}</b></span>
                              <span>{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Active Task Details & Orchestration */}
                <div className="lg:col-span-8 space-y-6">
                  {selectedTask ? (
                    <>
                      {/* Task Header & Deliverable Actions */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono font-bold text-amber-700">{selectedTask.id}</span>
                              <span className="text-xs font-mono text-slate-400">•</span>
                              <span className="text-xs font-semibold text-slate-600">{selectedTask.workflow_type}</span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-wide">
                              {selectedTask.title}
                            </h2>
                            <p className="text-xs text-slate-600 mt-1 font-mono">
                              Location: {selectedTask.unit_location}
                            </p>
                          </div>

                          {/* Deliverable Download Buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            {selectedTask.status === 'COMPLETED' && (
                              <>
                                <a
                                  href={api.getDownloadPdfUrl(selectedTask.id)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                                  title="Download signed PDF permit"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>PDF Permit</span>
                                </a>
                                <a
                                  href={api.getDownloadDocxUrl(selectedTask.id)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                                  title="Download Word approval note"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>DOCX Note</span>
                                </a>
                                <a
                                  href={api.getDownloadXlsxUrl(selectedTask.id)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                                  title="Download Excel action tracker"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>XLSX Tracker</span>
                                </a>
                              </>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-sans">
                          {selectedTask.description}
                        </p>
                      </div>

                      {/* Human in the loop review card if waiting */}
                      {selectedTask.status === 'WAITING_FOR_REVIEW' && (
                        <HitlApprovalCard
                          task={selectedTask}
                          currentUser={user}
                          onReview={handleReviewTask}
                        />
                      )}

                      {/* If completed, show approval summary banner */}
                      {selectedTask.status === 'COMPLETED' && (
                        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-emerald-900">
                                Safety Review Approved by {selectedTask.reviewer_name}
                              </div>
                              <div className="text-[11px] text-emerald-800">
                                Remarks: {selectedTask.reviewer_comments}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-900 bg-emerald-100 px-2 py-1 rounded border border-emerald-300 font-bold">
                            SIGN-OFF SEALED
                          </span>
                        </div>
                      )}

                      {/* Agentic State Machine Visualization */}
                      <AgentGraphViewer steps={selectedTask.steps} />

                      {/* Grounded RAG Citations */}
                      {selectedTask.citations && selectedTask.citations.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-amber-600" />
                              Grounded Refinery Knowledge Base Citations
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">Local Sovereign RAG</span>
                          </div>

                          <div className="space-y-3">
                            {selectedTask.citations.map((c, i) => (
                              <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-bold text-amber-800 font-mono text-[11px]">
                                    {c.source_filename} • {c.section} (Page {c.page_number})
                                  </span>
                                  <span className="text-[10px] text-blue-800 font-mono font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                    Relevance: {(c.relevance_score * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <p className="text-slate-800 bg-white border-l-4 border-amber-500 p-2.5 rounded-r font-sans italic text-[11px] leading-relaxed">
                                  "{c.evidence_text}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-sm">
                      <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-700">Select a task from the queue or launch a new workflow.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'knowledge' && <KnowledgeBaseTab documents={documents} />}
            {activeTab === 'ingestion' && <DocumentUploadTab onDocumentUploaded={loadAllData} />}
            {activeTab === 'audit' && <AuditTrailTab logs={auditLogs} onRefresh={loadAllData} />}
            {activeTab === 'system' && <SystemHealthTab health={health} airgapInfo={airgapInfo} />}
          </>
        )}
      </main>

      {/* Task Creation Modal */}
      <TaskCreatorModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};
export default App;
