import json
from datetime import datetime
from backend.app.db.database import engine, Base, SessionLocal
from backend.app.db.models import DBUser, DBDocument, DBKnowledgeChunk, DBTask, DBTaskStep, DBAuditEntry
from backend.app.core.security import hash_password
from backend.app.core.rbac import Role


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed Users if not present
        if db.query(DBUser).count() == 0:
            users_to_seed = [
                DBUser(
                    id="USR-001",
                    username="operator",
                    full_name="R. K. Sharma (Operations Engineer)",
                    password_hash=hash_password("Operator@123"),
                    role=Role.OPERATOR.value,
                    badge_number="MRPL-ENG-4912",
                    department="Crude Distillation Unit (CDU-II)"
                ),
                DBUser(
                    id="USR-002",
                    username="safety_officer",
                    full_name="Dr. V. Menon (Lead Safety Officer)",
                    password_hash=hash_password("Safety@123"),
                    role=Role.SAFETY_REVIEWER.value,
                    badge_number="MRPL-SAF-1004",
                    department="Fire & Industrial Safety Directorate"
                ),
                DBUser(
                    id="USR-003",
                    username="knowledge_admin",
                    full_name="S. Patil (Engineering Archivist)",
                    password_hash=hash_password("Admin@123"),
                    role=Role.KNOWLEDGE_ADMIN.value,
                    badge_number="MRPL-DOC-8021",
                    department="Technical Records & Standards"
                ),
                DBUser(
                    id="USR-004",
                    username="auditor",
                    full_name="A. Deshmukh (Chief Compliance Auditor)",
                    password_hash=hash_password("Auditor@123"),
                    role=Role.AUDITOR.value,
                    badge_number="MRPL-AUD-9902",
                    department="Statutory Governance & Compliance"
                ),
                DBUser(
                    id="USR-005",
                    username="admin",
                    full_name="Chief Information Security Officer",
                    password_hash=hash_password("Admin@123"),
                    role=Role.SYSTEM_ADMIN.value,
                    badge_number="MRPL-SEC-0001",
                    department="Sovereign Systems Infrastructure"
                ),
            ]
            db.add_all(users_to_seed)
            db.commit()

        # 2. Seed Documents and Chunks if not present
        if db.query(DBDocument).count() == 0:
            doc1 = DBDocument(
                id="DOC-SOP-402",
                filename="MRPL-SOP-SAF-402_Rev4.pdf",
                doc_type="SOP",
                file_size_bytes=425000,
                sha256_checksum="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                uploaded_by="MRPL_Safety_Directorate",
                upload_time=datetime(2026, 1, 15, 9, 30),
                page_count=18,
                classification="MRPL INTERNAL RESTRICTED",
                extraction_path="Direct Text Parsing (PyMuPDF)"
            )
            doc2 = DBDocument(
                id="DOC-ENG-108",
                filename="MRPL-ENG-PND-108_CDU2_Overhead.pdf",
                doc_type="PID_DIAGRAM",
                file_size_bytes=1840000,
                sha256_checksum="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
                uploaded_by="MRPL_Process_Engineering",
                upload_time=datetime(2026, 2, 20, 14, 10),
                page_count=8,
                classification="MRPL CONFIDENTIAL PROPRIETARY",
                extraction_path="Multimodal Vector & CAD Symbol Extraction"
            )
            doc3 = DBDocument(
                id="DOC-INSP-B3",
                filename="MRPL-INSP-2026-B3_Asset_Integrity.pdf",
                doc_type="INSPECTION_SHEET",
                file_size_bytes=650000,
                sha256_checksum="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
                uploaded_by="MRPL_Asset_Integrity_Dept",
                upload_time=datetime(2026, 3, 5, 11, 0),
                page_count=14,
                classification="MRPL INTERNAL USE ONLY",
                extraction_path="Tabular OCR & Rule Engine Extraction"
            )
            db.add_all([doc1, doc2, doc3])
            db.commit()

            chunks_to_seed = [
                DBKnowledgeChunk(
                    id="CHK-402-01",
                    doc_id="DOC-SOP-402",
                    doc_name="MRPL-SOP-SAF-402_Rev4.pdf",
                    section="Section 3.1: Spatial Clearance Boundaries",
                    page_number=4,
                    content="Hot work operations involving welding, cutting, grinding, or open flame within Crude Distillation Unit (CDU-II) or Fluid Catalytic Cracking Unit (FCCU) require a mandatory 15-meter radial clearance from all hydrocarbon manifolds, sample points, and unsealed sewer sumps.",
                    keywords="hot work,clearance,15m,cdu-ii,fccu,manifold,sewer,distance"
                ),
                DBKnowledgeChunk(
                    id="CHK-402-02",
                    doc_id="DOC-SOP-402",
                    doc_name="MRPL-SOP-SAF-402_Rev4.pdf",
                    section="Section 3.4: Atmospheric Testing & LEL Limits",
                    page_number=6,
                    content="Atmospheric testing for combustible hydrocarbon vapors is mandatory immediately prior to hot work ignition. The combustible gas concentration must be strictly 0.0% of the Lower Explosive Limit (LEL). Any detectable hydrocarbon vapor (>0.0% LEL) requires immediate cessation, positive nitrogen line purging, and re-testing after 60 minutes.",
                    keywords="lel,lower explosive limit,gas testing,hydrocarbon,0.0%,combustible,nitrogen purge,vapor"
                ),
                DBKnowledgeChunk(
                    id="CHK-402-03",
                    doc_id="DOC-SOP-402",
                    doc_name="MRPL-SOP-SAF-402_Rev4.pdf",
                    section="Section 4.2: SIMOPS & Permitting Conflict Verification",
                    page_number=9,
                    content="Simultaneous Operations (SIMOPS) Conflict Rule: Under no circumstance shall a Hot Work Permit be approved if active cold work involving chemical solvent washing, line venting, or hydrocarbon draining is occurring within a 30-meter proximity radius on adjacent process lines (e.g. Line 14-B or Column C-102 overhead).",
                    keywords="simops,conflict,cold work,line 14-b,adjacent,solvent,venting,permit conflict"
                ),
                DBKnowledgeChunk(
                    id="CHK-402-04",
                    doc_id="DOC-SOP-402",
                    doc_name="MRPL-SOP-SAF-402_Rev4.pdf",
                    section="Section 5.1: Safety Attendant & Fire Watch Mandate",
                    page_number=12,
                    content="A designated Fire Watch attendant must remain positioned at the hot work site throughout all spark-producing activity and for a minimum of 60 minutes following completion. The attendant must be equipped with two calibrated 10kg Dry Chemical Powder (DCP) extinguishers, a continuous multi-gas monitor, and immediate access to emergency deluge actuation.",
                    keywords="fire watch,attendant,extinguisher,dcp,gas monitor,spark,deluge"
                ),
                DBKnowledgeChunk(
                    id="CHK-108-01",
                    doc_id="DOC-ENG-108",
                    doc_name="MRPL-ENG-PND-108_CDU2_Overhead.pdf",
                    section="Sheet 2: Crude Column Overhead Line 14-B Isolation",
                    page_number=2,
                    content="Line 14-B connects the atmospheric column overhead vapor condenser to accumulator V-104. Mandatory isolation requirement: Dual Block and Bleed (DBB) valves XV-1041A and XV-1041B must be locked in closed position with spectacle blinds inverted before maintenance intervention.",
                    keywords="line 14-b,isolation,dbb,spectacle blind,cdu-ii,overhead,xv-1041a,condenser"
                ),
                DBKnowledgeChunk(
                    id="CHK-INSP-01",
                    doc_id="DOC-INSP-B3",
                    doc_name="MRPL-INSP-2026-B3_Asset_Integrity.pdf",
                    section="Section 2.4: Pressure Piping Minimum Thickness (API 570)",
                    page_number=7,
                    content="Per API 570 guidelines for sour crude service: Minimum design wall thickness for Schedule 40 carbon steel transfer line 12-CR-201 is 6.20 mm. Critical alert threshold is 6.50 mm. Any measured point below 6.50 mm mandates immediate structural derating and ultrasonic C-scan grid mapping.",
                    keywords="wall thickness,api 570,pipe,ultrasonic,thinning,6.20 mm,6.50 mm,corrosion"
                ),
            ]
            db.add_all(chunks_to_seed)
            db.commit()

        # 3. Seed Initial Demo Task if not present
        if db.query(DBTask).count() == 0:
            now = datetime.utcnow()
            task1 = DBTask(
                id="TSK-CDU2-HOTWORK",
                title="Emergency Overhead Manifold Welding - CDU-II",
                workflow_type="HOT_WORK_PERMIT",
                status="WAITING_FOR_REVIEW",
                priority="URGENT",
                created_by="R. K. Sharma (Operations Engineer)",
                created_at=now,
                updated_at=now,
                unit_location="Crude Distillation Unit (CDU-II), Column C-101 Overhead Manifold",
                description="High-pressure pipe weld repair on CDU-II reflux line 14-B following ultrasonic indication of flange crack. Requires oxy-acetylene torch cutting and TIG welding within battery limits.",
                hazards_json=json.dumps([
                    "SIMOPS Conflict Detected: Scheduled Line 14-B chemical solvent flushing within 18m of welding zone (Violates MRPL-SOP-SAF-402 30m radius).",
                    "Atmospheric Gas Reading Alert: Hydrocarbon detector CH-401 registers 3.2% LEL (Mandatory threshold is 0.0% LEL)."
                ]),
                mitigations_json=json.dumps([
                    "Postpone hot spark work until Line 14-B solvent wash is completed and lines are blown down with nitrogen.",
                    "Continuous nitrogen purging required for overhead manifold until gas test confirms 0.0% LEL.",
                    "Mandatory dedicated Fire Watch stationed with dual 10kg DCP extinguishers throughout procedure."
                ]),
                requires_hitl=True
            )
            db.add(task1)
            db.commit()

            steps = [
                DBTaskStep(
                    task_id="TSK-CDU2-HOTWORK",
                    step_number=1,
                    step_name="Task Authorization & Boundary Classification",
                    status="COMPLETED",
                    summary="Verify user authorization and boundary perimeter for CDU-II.",
                    tool_used="rbac_validator"
                ),
                DBTaskStep(
                    task_id="TSK-CDU2-HOTWORK",
                    step_number=2,
                    step_name="SOP Grounding & Distance Retrieval",
                    status="COMPLETED",
                    summary="Retrieve MRPL-SOP-SAF-402 Rev 4 for clearance and atmospheric requirements.",
                    tool_used="mrpl_rag_retriever"
                ),
                DBTaskStep(
                    task_id="TSK-CDU2-HOTWORK",
                    step_number=3,
                    step_name="Active Permit Conflict Verification (SIMOPS)",
                    status="COMPLETED",
                    summary="Scan active refinery maintenance permits within 30m radius of CDU-II.",
                    tool_used="check_permit_conflicts",
                    tool_output_json=json.dumps({"conflicting_permits": ["CP-2026-089 (Solvent Flush Line 14-B)"], "distance_meters": 18.2}),
                    warnings_json=json.dumps(["Active cold work permit within 30m SIMOPS safety boundary."])
                ),
                DBTaskStep(
                    task_id="TSK-CDU2-HOTWORK",
                    step_number=4,
                    step_name="Combustible Gas Level & LEL Threshold Check",
                    status="COMPLETED",
                    summary="Check multi-gas detector telemetry and verify 0.0% LEL compliance.",
                    tool_used="validate_gas_levels",
                    tool_output_json=json.dumps({"sensor_id": "SN-CDU2-GAS-04", "combustible_lel_pct": 3.2, "target_lel_pct": 0.0}),
                    warnings_json=json.dumps(["LEL reading 3.2% exceeds 0.0% safety limit."])
                ),
                DBTaskStep(
                    task_id="TSK-CDU2-HOTWORK",
                    step_number=5,
                    step_name="Piping & Isolation Valve Integrity Check",
                    status="COMPLETED",
                    summary="Verify Double Block and Bleed (DBB) isolation and spectacle blind position.",
                    tool_used="pnd_valve_check"
                ),
                DBTaskStep(
                    task_id="TSK-CDU2-HOTWORK",
                    step_number=6,
                    step_name="Safety Officer Human-in-the-Loop Review",
                    status="WAITING_HITL",
                    summary="Pause automated execution and present findings for certified Safety Officer sign-off.",
                    tool_used="hitl_checkpoint"
                ),
                DBTaskStep(
                    task_id="TSK-CDU2-HOTWORK",
                    step_number=7,
                    step_name="Formal Permit & Report Generation",
                    status="PENDING",
                    summary="Generate MRPL Hot Work Permit deliverable with QR verification and sign-off.",
                    tool_used="reportlab_pdf_generator"
                ),
                DBTaskStep(
                    task_id="TSK-CDU2-HOTWORK",
                    step_number=8,
                    step_name="Cryptographic Audit Log Recording",
                    status="PENDING",
                    summary="Seal execution trace into immutable SHA-256 chained audit ledger.",
                    tool_used="audit_ledger"
                )
            ]
            db.add_all(steps)
            db.commit()

    finally:
        db.close()
