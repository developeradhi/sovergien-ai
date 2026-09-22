import uuid
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from backend.app.models.schemas import (
    TaskResponse, TaskStatus, TaskPriority, WorkflowType, TaskStepEvent, StepStatus, Citation
)
from backend.app.services.knowledge_service import knowledge_service
from backend.app.services.model_gateway import model_gateway
from backend.app.services.audit_service import audit_service
from backend.app.services.output_generator import output_generator

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    def __init__(self):
        self.tasks: Dict[str, TaskResponse] = []
        self.tasks_dict: Dict[str, TaskResponse] = {}
        self._load_from_sqlite()

    def _load_from_sqlite(self):
        try:
            from backend.app.db.database import SessionLocal
            from backend.app.db.models import DBTask, DBTaskStep
            db = SessionLocal()
            db_tasks = db.query(DBTask).all()
            for dbt in db_tasks:
                steps = []
                for s in dbt.steps:
                    tool_output = json.loads(s.tool_output_json) if s.tool_output_json else None
                    warnings = json.loads(s.warnings_json) if s.warnings_json else []
                    steps.append(TaskStepEvent(
                        step_number=s.step_number,
                        step_name=s.step_name,
                        status=StepStatus(s.status),
                        start_time=s.start_time,
                        end_time=s.end_time,
                        summary=s.summary,
                        tool_used=s.tool_used,
                        tool_output=tool_output,
                        warnings=warnings
                    ))
                hazards = json.loads(dbt.hazards_json) if dbt.hazards_json else []
                mitigations = json.loads(dbt.mitigations_json) if dbt.mitigations_json else []
                search_query = f"{dbt.title} {dbt.unit_location} {dbt.description}"
                citations = knowledge_service.search_chunks(search_query, top_k=3)

                task = TaskResponse(
                    id=dbt.id,
                    title=dbt.title,
                    workflow_type=WorkflowType(dbt.workflow_type),
                    status=TaskStatus(dbt.status),
                    priority=TaskPriority(dbt.priority),
                    created_by=dbt.created_by,
                    created_at=dbt.created_at,
                    updated_at=dbt.updated_at,
                    unit_location=dbt.unit_location,
                    description=dbt.description,
                    steps=steps,
                    citations=citations,
                    hazards_detected=hazards,
                    safety_mitigations=mitigations,
                    requires_hitl=dbt.requires_hitl,
                    review_status=dbt.review_status,
                    reviewer_comments=dbt.reviewer_comments,
                    reviewer_name=dbt.reviewer_name,
                    reviewed_at=dbt.reviewed_at,
                    output_pdf_path=dbt.output_pdf_path,
                    audit_hash=dbt.audit_hash
                )
                self.tasks_dict[dbt.id] = task
            db.close()
        except Exception as e:
            logger.warning("Could not populate tasks from SQLite: %s", e)

    def create_and_start_task(
        self,
        title: str,
        workflow_type: WorkflowType,
        unit_location: str,
        priority: TaskPriority,
        description: str,
        actor_username: str,
        actor_role: str,
        document_ids: List[str]
    ) -> TaskResponse:
        task_id = f"TSK-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.utcnow()

        # Generate subtasks from Model Gateway
        planned_steps = model_gateway.generate_plan(workflow_type.value, title, unit_location, description)
        step_events: List[TaskStepEvent] = []

        for p in planned_steps:
            step_events.append(TaskStepEvent(
                step_number=p["step_number"],
                step_name=p["step_name"],
                status=StepStatus.PENDING,
                start_time=now,
                summary=p["summary"],
                tool_used=p["tool"]
            ))

        # Retrieve relevant SOP citations
        search_query = f"{title} {unit_location} {description}"
        citations = knowledge_service.search_chunks(search_query, top_k=3)

        # Detect hazards and simulate tool execution
        hazards = []
        mitigations = []

        if workflow_type == WorkflowType.HOT_WORK_PERMIT:
            # Check for conflict in CDU-II
            if "cdu" in unit_location.lower() or "14" in description.lower() or "cdu" in description.lower():
                hazards.append("SIMOPS Conflict Detected: Scheduled Line 14-B chemical solvent flushing within 18m of welding zone (Violates MRPL-SOP-SAF-402 30m radius).")
                hazards.append("Atmospheric Gas Reading Alert: Hydrocarbon detector CH-401 registers 3.2% LEL (Mandatory threshold is 0.0% LEL).")
                mitigations.append("Postpone hot spark work until Line 14-B solvent wash is completed and lines are blown down with nitrogen.")
                mitigations.append("Continuous nitrogen purging required for overhead manifold until gas test confirms 0.0% LEL.")
                mitigations.append("Mandatory dedicated Fire Watch stationed with dual 10kg DCP extinguishers throughout procedure.")
            else:
                hazards.append("Standard flammable atmosphere risk in refinery processing area.")
                mitigations.append("Atmospheric gas test prior to start; certified Fire Watch standby.")
        elif workflow_type == WorkflowType.EQUIPMENT_INSPECTION:
            hazards.append("Corrosion Anomaly: Ultrasonic thickness on 12-CR-201 measured 6.35 mm (Approaching 6.20 mm retirement thickness).")
            mitigations.append("Engineering derating to 14.5 barg; schedule C-scan grid mapping within 14 days.")
        else:
            mitigations.append("Follow standard operating procedures with source verification.")

        # Execute automated steps up to the HITL checkpoint
        for idx, step in enumerate(step_events):
            if "hitl" in (step.tool_used or "").lower() or "review" in step.step_name.lower():
                # Pause at HITL checkpoint!
                step.status = StepStatus.WAITING_HITL
                step.summary = "Awaiting authorized Safety Reviewer verification and electronic sign-off."
                break
            else:
                step.status = StepStatus.COMPLETED
                step.end_time = datetime.utcnow()
                if step.tool_used == "check_permit_conflicts":
                    step.tool_output = {"conflicting_permits": ["CP-2026-089 (Solvent Flush Line 14-B)"], "distance_meters": 18.2}
                    step.warnings = ["Active cold work permit within 30m SIMOPS safety boundary."]
                elif step.tool_used == "validate_gas_levels":
                    step.tool_output = {"sensor_id": "SN-CDU2-GAS-04", "combustible_lel_pct": 3.2, "target_lel_pct": 0.0}
                    step.warnings = ["LEL reading 3.2% exceeds 0.0% safety limit."]
                elif step.tool_used == "mrpl_rag_retriever":
                    step.tool_output = {"citations_found": len(citations), "top_sop": citations[0].source_filename if citations else "None"}

        task = TaskResponse(
            id=task_id,
            title=title,
            workflow_type=workflow_type,
            status=TaskStatus.WAITING_FOR_REVIEW,
            priority=priority,
            created_by=actor_username,
            created_at=now,
            updated_at=datetime.utcnow(),
            unit_location=unit_location,
            description=description,
            steps=step_events,
            citations=citations,
            hazards_detected=hazards,
            safety_mitigations=mitigations,
            requires_hitl=True
        )

        self.tasks_dict[task_id] = task

        # Persist to SQLite
        try:
            from backend.app.db.database import SessionLocal
            from backend.app.db.models import DBTask, DBTaskStep
            db = SessionLocal()
            db_task = DBTask(
                id=task.id,
                title=task.title,
                workflow_type=task.workflow_type.value,
                status=task.status.value,
                priority=task.priority.value,
                created_by=task.created_by,
                created_at=task.created_at,
                updated_at=task.updated_at,
                unit_location=task.unit_location,
                description=task.description,
                hazards_json=json.dumps(task.hazards_detected),
                mitigations_json=json.dumps(task.safety_mitigations),
                requires_hitl=task.requires_hitl
            )
            db.add(db_task)
            db.commit()

            db_steps = []
            for s in task.steps:
                db_steps.append(DBTaskStep(
                    task_id=task.id,
                    step_number=s.step_number,
                    step_name=s.step_name,
                    status=s.status.value,
                    start_time=s.start_time,
                    end_time=s.end_time,
                    summary=s.summary,
                    tool_used=s.tool_used,
                    tool_output_json=json.dumps(s.tool_output) if s.tool_output else None,
                    warnings_json=json.dumps(s.warnings) if s.warnings else "[]"
                ))
            db.add_all(db_steps)
            db.commit()
            db.close()
        except Exception as e:
            logger.warning("Could not persist created task to SQLite: %s", e)

        # Record in audit trail
        audit_service.record_event(
            actor_id="USER-OP-01",
            actor_username=actor_username,
            actor_role=actor_role,
            action_type="TASK_CREATED_AND_PAUSED_FOR_HITL",
            resource_id=task_id,
            event_details=f"Created {workflow_type.value} at {unit_location}. 2 hazards identified. Paused for Safety Reviewer.",
            security_flag=True
        )

        return task

    def apply_reviewer_action(
        self,
        task_id: str,
        reviewer_username: str,
        reviewer_role: str,
        decision: str,  # APPROVE or REJECT
        comments: str,
        conditions_met: bool,
        duration_hours: int
    ) -> Optional[TaskResponse]:
        task = self.tasks_dict.get(task_id)
        if not task:
            return None

        now = datetime.utcnow()
        task.reviewed_at = now
        task.reviewer_name = reviewer_username
        task.reviewer_comments = comments

        if decision == "APPROVE":
            task.status = TaskStatus.COMPLETED
            task.review_status = "APPROVED_WITH_CONDITIONS"
            # Update remaining steps to completed
            for s in task.steps:
                if s.status in [StepStatus.WAITING_HITL, StepStatus.PENDING]:
                    s.status = StepStatus.COMPLETED
                    s.end_time = now
            # Generate official PDF deliverable
            pdf_path = output_generator.generate_permit_pdf(task)
            task.output_pdf_path = pdf_path

            audit_service.record_event(
                actor_id="USER-REV-01",
                actor_username=reviewer_username,
                actor_role=reviewer_role,
                action_type="TASK_APPROVED_HITL",
                resource_id=task_id,
                event_details=f"Permit approved for {duration_hours}h duration. Remarks: {comments[:80]}. Deliverable PDF generated.",
                security_flag=False
            )
        else:
            task.status = TaskStatus.REJECTED
            task.review_status = "REJECTED_BY_SAFETY_OFFICER"
            for s in task.steps:
                if s.status == StepStatus.WAITING_HITL:
                    s.status = StepStatus.FAILED
                    s.summary = f"Rejected: {comments}"

            audit_service.record_event(
                actor_id="USER-REV-01",
                actor_username=reviewer_username,
                actor_role=reviewer_role,
                action_type="TASK_REJECTED_HITL",
                resource_id=task_id,
                event_details=f"Permit rejected by Safety Officer. Remarks: {comments[:80]}",
                security_flag=True
            )

        task.updated_at = now

        # Update SQLite record
        try:
            from backend.app.db.database import SessionLocal
            from backend.app.db.models import DBTask
            db = SessionLocal()
            dbt = db.query(DBTask).filter(DBTask.id == task_id).first()
            if dbt:
                dbt.status = task.status.value
                dbt.review_status = task.review_status
                dbt.reviewer_name = task.reviewer_name
                dbt.reviewer_comments = task.reviewer_comments
                dbt.reviewed_at = task.reviewed_at
                dbt.updated_at = task.updated_at
                dbt.output_pdf_path = task.output_pdf_path
                db.commit()
            db.close()
        except Exception as e:
            logger.warning("Could not persist review update to SQLite: %s", e)

        return task

    def get_task(self, task_id: str) -> Optional[TaskResponse]:
        return self.tasks_dict.get(task_id)

    def list_tasks(self) -> List[TaskResponse]:
        return list(reversed(list(self.tasks_dict.values())))


agent_orchestrator = AgentOrchestrator()
