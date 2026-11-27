import type { Task, DocumentMetadata, Citation, AuditLogEntry, SystemHealth, UserProfile, Role } from '../types';

const API_BASE = '/api';

export const api = {
  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`);
    if (!res.ok) throw new Error('Failed to fetch current user');
    return res.json();
  },

  async switchRole(targetRole: Role): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_role: targetRole })
    });
    if (!res.ok) throw new Error('Failed to switch role');
    return res.json();
  },

  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async getTask(id: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    if (!res.ok) throw new Error('Failed to fetch task');
    return res.json();
  },

  async createTask(data: {
    title: string;
    workflow_type: string;
    unit_location: string;
    priority: string;
    description: string;
    document_ids: string[];
  }): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create task' }));
      throw new Error(err.detail || 'Failed to create task');
    }
    return res.json();
  },

  async reviewTask(
    taskId: string,
    action: {
      decision: 'APPROVE' | 'REJECT';
      reviewer_comments: string;
      safety_conditions_met: boolean;
      authorized_duration_hours: number;
    }
  ): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Review action failed' }));
      throw new Error(err.detail || 'Review action failed');
    }
    return res.json();
  },

  async getDocuments(): Promise<DocumentMetadata[]> {
    const res = await fetch(`${API_BASE}/documents/list`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async uploadDocument(file: File): Promise<DocumentMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async queryKnowledge(query: string, topK: number = 3): Promise<Citation[]> {
    const res = await fetch(`${API_BASE}/knowledge/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k: topK })
    });
    if (!res.ok) throw new Error('Knowledge query failed');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch(`${API_BASE}/audit/logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async verifyAuditChain(): Promise<{ verified: boolean; total_records: number; status: string; latest_hash?: string }> {
    const res = await fetch(`${API_BASE}/audit/verify`);
    if (!res.ok) throw new Error('Failed to verify audit ledger');
    return res.json();
  },

  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/system/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async getAirgapStatus(): Promise<Record<string, any>> {
    const res = await fetch(`${API_BASE}/security/airgap-status`);
    if (!res.ok) throw new Error('Failed to fetch airgap status');
    return res.json();
  },

  getDownloadPdfUrl(taskId: string): string {
    return `${API_BASE}/tasks/${taskId}/download/pdf`;
  },

  getDownloadDocxUrl(taskId: string): string {
    return `${API_BASE}/tasks/${taskId}/download/docx`;
  },

  getDownloadXlsxUrl(taskId: string): string {
    return `${API_BASE}/tasks/${taskId}/download/xlsx`;
  }
};
