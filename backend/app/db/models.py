import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.database import Base


class DBUser(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    badge_number = Column(String(50), nullable=False)
    department = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class DBDocument(Base):
    __tablename__ = "documents"

    id = Column(String(50), primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    doc_type = Column(String(50), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    sha256_checksum = Column(String(64), nullable=False)
    uploaded_by = Column(String(100), nullable=False)
    upload_time = Column(DateTime, default=datetime.utcnow)
    page_count = Column(Integer, default=1)
    classification = Column(String(100), default="MRPL CONFIDENTIAL")
    extraction_path = Column(String(150), nullable=False)


class DBKnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(String(50), primary_key=True, index=True)
    doc_id = Column(String(50), ForeignKey("documents.id"), nullable=False)
    doc_name = Column(String(255), nullable=False)
    section = Column(String(255), nullable=False)
    page_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    keywords = Column(Text, nullable=False)  # comma separated


class DBTask(Base):
    __tablename__ = "tasks"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    workflow_type = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    priority = Column(String(50), nullable=False)
    created_by = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    unit_location = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    hazards_json = Column(Text, default="[]")
    mitigations_json = Column(Text, default="[]")
    requires_hitl = Column(Boolean, default=True)
    review_status = Column(String(50), nullable=True)
    reviewer_comments = Column(Text, nullable=True)
    reviewer_name = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    output_pdf_path = Column(String(255), nullable=True)
    audit_hash = Column(String(64), nullable=True)

    steps = relationship("DBTaskStep", back_populates="task", cascade="all, delete-orphan")


class DBTaskStep(Base):
    __tablename__ = "task_steps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(String(50), ForeignKey("tasks.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    step_name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    summary = Column(Text, nullable=False)
    tool_used = Column(String(100), nullable=True)
    tool_output_json = Column(Text, nullable=True)
    warnings_json = Column(Text, default="[]")

    task = relationship("DBTask", back_populates="steps")


class DBAuditEntry(Base):
    __tablename__ = "audit_ledger"

    id = Column(String(50), primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    actor_id = Column(String(50), nullable=False)
    actor_username = Column(String(100), nullable=False)
    actor_role = Column(String(50), nullable=False)
    action_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=False)
    event_details = Column(Text, nullable=False)
    security_flag = Column(Boolean, default=False)
    entry_hash = Column(String(64), nullable=False)
    previous_hash = Column(String(64), nullable=False)
