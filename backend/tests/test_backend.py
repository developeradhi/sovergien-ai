import pytest
import os
import sys
from fastapi.testclient import TestClient

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.main import app
from backend.app.core.security import (
    hash_password, verify_password, sanitize_input, check_login_rate_limit, record_failed_login, reset_login_attempts
)
from backend.app.core.rbac import Role, has_permission, Permission
from backend.app.services.knowledge_service import knowledge_service
from backend.app.services.audit_service import audit_service

client = TestClient(app)


def test_password_hashing_and_verification():
    secret = "SuperIndustrialSecret@2026"
    hashed = hash_password(secret)
    assert hashed != secret
    assert verify_password(secret, hashed) is True
    assert verify_password("WrongPassword123", hashed) is False


def test_input_sanitization():
    dirty = "   <script>alert('xss')</script> Test CDU-II \x00\x08 Weld   "
    clean = sanitize_input(dirty)
    assert "<script>" not in clean
    assert "&lt;script&gt;" in clean
    assert "\x00" not in clean
    assert clean.startswith("&lt;script&gt;")


def test_brute_force_lockout():
    identifier = "test_ip_lockout:user"
    reset_login_attempts(identifier)
    
    # 4 failed attempts should not lock
    for _ in range(4):
        locked = record_failed_login(identifier)
        assert locked is False

    # 5th attempt locks the account
    locked = record_failed_login(identifier)
    assert locked is True

    is_locked, remaining = check_login_rate_limit(identifier)
    assert is_locked is True
    assert remaining is not None and remaining > 800

    # Cleanup
    reset_login_attempts(identifier)


def test_login_endpoint_generic_error():
    # Attempt invalid login
    res = client.post("/api/auth/login", json={"username": "operator", "password": "WrongPassword@999"})
    assert res.status_code == 401
    # Check that generic error message is returned (Rule 5)
    assert res.json()["detail"] == "Invalid credentials or account locked."


def test_rbac_permissions():
    assert has_permission(Role.OPERATOR, Permission.TASK_CREATE) is True
    assert has_permission(Role.OPERATOR, Permission.TASK_REVIEW) is False
    assert has_permission(Role.SAFETY_REVIEWER, Permission.TASK_REVIEW) is True
    assert has_permission(Role.AUDITOR, Permission.AUDIT_VIEW) is True
    assert has_permission(Role.AUDITOR, Permission.TASK_CREATE) is False


def test_knowledge_base_rag_citations():
    results = knowledge_service.search_chunks("hot work clearance distance CDU-II", top_k=2)
    assert len(results) > 0
    first = results[0]
    assert first.source_filename == "MRPL-SOP-SAF-402_Rev4.pdf"
    assert first.page_number > 0
    assert first.relevance_score >= 0.70
    assert "15-meter" in first.evidence_text or "15" in first.evidence_text


def test_audit_chain_tamper_evidence():
    audit_service.record_event(
        actor_id="TST-01",
        actor_username="test_auditor",
        actor_role="Auditor",
        action_type="VERIFY_HEALTH",
        resource_id="SYSTEM",
        event_details="Diagnostic health check performed."
    )
    verification = audit_service.verify_chain_integrity()
    assert verification["verified"] is True
    assert verification["total_records"] > 0


def test_end_to_end_permit_lifecycle():
    # 1. Switch to Operator
    client.post("/api/auth/switch-role", json={"target_role": "Operator"})

    # 2. Create Hot Work Task
    task_payload = {
        "title": "Pipe Joint Welding at FCCU Reactor",
        "workflow_type": "HOT_WORK_PERMIT",
        "unit_location": "FCCU Reactor Battery Limits R-201",
        "priority": "URGENT",
        "description": "Welding support bracket for high-temp catalyst injection line. 15m perimeter secured.",
        "document_ids": ["DOC-SOP-402"]
    }
    create_res = client.post("/api/tasks", json=task_payload)
    assert create_res.status_code == 200
    task_data = create_res.json()
    task_id = task_data["id"]
    assert task_data["status"] == "WAITING_FOR_REVIEW"
    assert task_data["requires_hitl"] is True
    assert len(task_data["citations"]) > 0

    # 3. Attempt review as Operator (Should fail 403 Forbidden!)
    review_payload = {
        "decision": "APPROVE",
        "reviewer_comments": "Uncertified approval attempt",
        "safety_conditions_met": True,
        "authorized_duration_hours": 8
    }
    unauthorized_res = client.post(f"/api/tasks/{task_id}/review", json=review_payload)
    assert unauthorized_res.status_code == 403

    # 4. Switch to Safety Reviewer
    client.post("/api/auth/switch-role", json={"target_role": "Safety Reviewer"})

    # 5. Authorize review
    valid_review = {
        "decision": "APPROVE",
        "reviewer_comments": "Hot work approved under strict fire watch and continuous nitrogen purge.",
        "safety_conditions_met": True,
        "authorized_duration_hours": 6
    }
    review_res = client.post(f"/api/tasks/{task_id}/review", json=valid_review)
    assert review_res.status_code == 200
    reviewed_task = review_res.json()
    assert reviewed_task["status"] == "COMPLETED"
    assert reviewed_task["review_status"] == "APPROVED_WITH_CONDITIONS"

    # 6. Verify PDF generation and download
    download_res = client.get(f"/api/tasks/{task_id}/download/pdf")
    assert download_res.status_code == 200
    assert download_res.headers["content-type"] == "application/pdf"
    assert len(download_res.content) > 1000


def test_root_landing_dashboard():
    res = client.get("/")
    assert res.status_code == 200
    assert "text/html" in res.headers["content-type"]
    assert "SOVEREIGN" in res.text
    assert "background-color: #ffffff" in res.text
    assert "AIR-GAP ENFORCED" in res.text
