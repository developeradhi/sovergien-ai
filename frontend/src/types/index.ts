export type Role = 'Operator' | 'Safety Reviewer' | 'Knowledge Admin' | 'Auditor' | 'System Admin';

export type TaskStatus = 'CREATED' | 'QUEUED' | 'RUNNING' | 'WAITING_FOR_REVIEW' | 'COMPLETED' | 'REJECTED' | 'FAILED';

export type TaskPriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export type WorkflowType = 'HOT_WORK_PERMIT' | 'EQUIPMENT_INSPECTION' | 'PID_REVIEW' | 'KNOWLEDGE_QUERY';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: Role;
  badge_number: string;
  department: string;
}

export interface Citation {
  source_id: string;
  source_filename: string;
  section: string;
  page_number: number;
  relevance_score: number;
  evidence_text: string;
}

export interface TaskStepEvent {
  step_number: number;
  step_name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'WAITING_HITL';
  start_time: string;
  end_time?: string;
  summary: string;
  tool_used?: string;
  tool_output?: Record<string, any>;
  warnings: string[];
}

export interface Task {
  id: string;
  title: string;
  workflow_type: WorkflowType;
  status: TaskStatus;
  priority: TaskPriority;
  created_by: string;
  created_at: string;
  updated_at: string;
  unit_location: string;
  description: string;
  steps: TaskStepEvent[];
  citations: Citation[];
  hazards_detected: string[];
  safety_mitigations: string[];
  requires_hitl: boolean;
  review_status?: string;
  reviewer_comments?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  output_pdf_path?: string;
  audit_hash?: string;
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  doc_type: string;
  file_size_bytes: number;
  sha256_checksum: string;
  uploaded_by: string;
  upload_time: string;
  page_count: number;
  classification: string;
  extraction_path: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_username: string;
  actor_role: string;
  action_type: string;
  resource_id: string;
  event_details: string;
  security_flag: boolean;
  entry_hash: string;
  previous_hash: string;
}

export interface SystemHealth {
  status: string;
  version: string;
  airgap_enforced: boolean;
  outbound_blocked: boolean;
  active_model_text: string;
  active_model_vision: string;
  active_model_runtime: string;
  uptime_seconds: number;
  total_tasks_processed: number;
  active_security_alerts: number;
}

// --- Scaffold / Legacy Compatibility Types ---
export type HealthResponse = {
  status: string;
  service?: string;
  version?: string;
  airgap_enforced?: boolean;
};

export type DocumentUploadResponse = {
  document_id: string;
  filename: string;
  extension: string;
  size_bytes: number;
  checksum_sha256: string;
  stored_path: string;
};

export type TaskEvent = {
  timestamp: string;
  event: string;
  details: Record<string, string>;
};

export type TaskResponse = {
  task_id: string;
  title: string;
  prompt: string;
  status: string;
  document_ids: string[];
  requires_review: boolean;
  output_files: string[];
  created_at: string;
  updated_at: string;
  events: TaskEvent[];
};

export type SecurityStatusResponse = {
  offline_mode: boolean;
  model_endpoint: string;
  model_endpoint_local: boolean;
  model_endpoint_reachable: boolean;
  note: string;
};

