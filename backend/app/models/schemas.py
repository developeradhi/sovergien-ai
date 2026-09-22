from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from backend.app.core.security import sanitize_input
from backend.app.core.rbac import Role


class TaskStatus(str, Enum):
    CREATED = "CREATED"
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    WAITING_FOR_REVIEW = "WAITING_FOR_REVIEW"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"
    FAILED = "FAILED"


class TaskPriority(str, Enum):
    ROUTINE = "ROUTINE"
    URGENT = "URGENT"
    EMERGENCY = "EMERGENCY"


class WorkflowType(str, Enum):
    HOT_WORK_PERMIT = "HOT_WORK_PERMIT"
    EQUIPMENT_INSPECTION = "EQUIPMENT_INSPECTION"
    PID_REVIEW = "PID_REVIEW"
    KNOWLEDGE_QUERY = "KNOWLEDGE_QUERY"


# Authentication Schemas
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)

    @field_validator("username")
    @classmethod
    def sanitize_username(cls, v: str) -> str:
        return sanitize_input(v)


class UserProfile(BaseModel):
    id: str
    username: str
    full_name: str
    role: Role
    badge_number: str
    department: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


class SwitchRoleRequest(BaseModel):
    target_role: Role


# Document Ingestion Schemas
class DocumentType(str, Enum):
    SOP = "SOP"
    PERMIT_REQUEST = "PERMIT_REQUEST"
    INSPECTION_SHEET = "INSPECTION_SHEET"
    PID_DIAGRAM = "PID_DIAGRAM"
    GENERAL_MANUAL = "GENERAL_MANUAL"


class DocumentMetadata(BaseModel):
    id: str
    filename: str
    doc_type: DocumentType
    file_size_bytes: int
    sha256_checksum: str
    uploaded_by: str
    upload_time: datetime
    page_count: int
    classification: str = "MRPL CONFIDENTIAL"
    extraction_path: str  # Direct text, OCR, or Multimodal Vision


# Knowledge Retrieval (RAG) Schemas
class Citation(BaseModel):
    source_id: str
    source_filename: str
    section: str
    page_number: int
    relevance_score: float
    evidence_text: str


class KnowledgeQueryRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500)
    top_k: int = Field(default=3, ge=1, le=10)

    @field_validator("query")
    @classmethod
    def sanitize_query(cls, v: str) -> str:
        return sanitize_input(v)


# Agent Orchestrator Schemas
class StepStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    WAITING_HITL = "WAITING_HITL"


class TaskStepEvent(BaseModel):
    step_number: int
    step_name: str
    status: StepStatus
    start_time: datetime
    end_time: Optional[datetime] = None
    summary: str
    tool_used: Optional[str] = None
    tool_output: Optional[Dict[str, Any]] = None
    warnings: List[str] = []


class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=150)
    workflow_type: WorkflowType
    unit_location: str = Field(..., min_length=2, max_length=100)
    priority: TaskPriority = TaskPriority.ROUTINE
    description: str = Field(..., min_length=10, max_length=2000)
    document_ids: List[str] = Field(default_factory=list)

    @field_validator("title", "unit_location", "description")
    @classmethod
    def sanitize_fields(cls, v: str) -> str:
        return sanitize_input(v)


class ReviewActionRequest(BaseModel):
    decision: str = Field(..., pattern="^(APPROVE|REJECT)$")
    reviewer_comments: str = Field(..., min_length=5, max_length=1000)
    safety_conditions_met: bool = True
    authorized_duration_hours: int = Field(default=8, ge=1, le=24)

    @field_validator("reviewer_comments")
    @classmethod
    def sanitize_comments(cls, v: str) -> str:
        return sanitize_input(v)


class TaskResponse(BaseModel):
    id: str
    title: str
    workflow_type: WorkflowType
    status: TaskStatus
    priority: TaskPriority
    created_by: str
    created_at: datetime
    updated_at: datetime
    unit_location: str
    description: str
    steps: List[TaskStepEvent]
    citations: List[Citation]
    hazards_detected: List[str]
    safety_mitigations: List[str]
    requires_hitl: bool
    review_status: Optional[str] = None
    reviewer_comments: Optional[str] = None
    reviewer_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    output_pdf_path: Optional[str] = None
    audit_hash: Optional[str] = None


# Audit Logging Schemas
class AuditLogEntry(BaseModel):
    id: str
    timestamp: datetime
    actor_id: str
    actor_username: str
    actor_role: str
    action_type: str
    resource_id: str
    event_details: str
    security_flag: bool = False
    entry_hash: str
    previous_hash: str


# System Health & Airgap Status
class SystemHealthResponse(BaseModel):
    status: str
    version: str
    airgap_enforced: bool
    outbound_blocked: bool
    active_model_text: str
    active_model_vision: str
    active_model_runtime: str
    uptime_seconds: float
    total_tasks_processed: int
    active_security_alerts: int
