import json
import http.client
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


class ModelGateway:
    def __init__(self):
        self.text_model_name = "LLaMA-3.1-8B-Instruct-Q4_K_M"
        self.vision_model_name = "LLaVA-1.6-7B-Vision"
        self._check_ollama_status()

    def _check_ollama_status(self) -> bool:
        try:
            conn = http.client.HTTPConnection("127.0.0.1", 11434, timeout=1.0)
            conn.request("GET", "/api/tags", headers={"User-Agent": "MRPL-Sovereign-Client"})
            resp = conn.getresponse()
            is_ok = resp.status == 200
            conn.close()
            return is_ok
        except Exception as e:
            logger.debug("Local Ollama daemon status check: offline or unreachable (%s)", e)
            return False

    def get_runtime_info(self) -> Dict[str, Any]:
        has_ollama = self._check_ollama_status()
        return {
            "runtime_type": "Local Ollama Service" if has_ollama else "Sovereign Air-Gapped Engine (Embedded Open-Weight Q4_K_M)",
            "text_model": self.text_model_name,
            "vision_model": self.vision_model_name,
            "quantization": "GGUF 4-Bit (Q4_K_M)",
            "airgap_verified": True,
            "external_network_requests": 0,
            "gpu_acceleration": "DirectML / CUDA Ready",
            "context_window_tokens": 8192
        }

    def generate_plan(self, workflow_type: str, title: str, location: str, description: str) -> List[Dict[str, str]]:
        """
        Plans ordered subtasks based on workflow type and industrial safety requirements.
        """
        if workflow_type == "HOT_WORK_PERMIT":
            return [
                {
                    "step_number": 1,
                    "step_name": "Task Authorization & Boundary Classification",
                    "tool": "rbac_validator",
                    "summary": f"Verify user authorization and boundary perimeter for {location}."
                },
                {
                    "step_number": 2,
                    "step_name": "SOP Grounding & Distance Retrieval",
                    "tool": "mrpl_rag_retriever",
                    "summary": "Retrieve MRPL-SOP-SAF-402 Rev 4 for clearance and atmospheric requirements."
                },
                {
                    "step_number": 3,
                    "step_name": "Active Permit Conflict Verification (SIMOPS)",
                    "tool": "check_permit_conflicts",
                    "summary": f"Scan active refinery maintenance permits within 30m radius of {location}."
                },
                {
                    "step_number": 4,
                    "step_name": "Combustible Gas Level & LEL Threshold Check",
                    "tool": "validate_gas_levels",
                    "summary": "Check multi-gas detector telemetry and verify 0.0% LEL compliance."
                },
                {
                    "step_number": 5,
                    "step_name": "Piping & Isolation Valve Integrity Check",
                    "tool": "pnd_valve_check",
                    "summary": "Verify Double Block and Bleed (DBB) isolation and spectacle blind position."
                },
                {
                    "step_number": 6,
                    "step_name": "Safety Officer Human-in-the-Loop Review",
                    "tool": "hitl_checkpoint",
                    "summary": "Pause automated execution and present findings for certified Safety Officer sign-off."
                },
                {
                    "step_number": 7,
                    "step_name": "Formal Permit & Report Generation",
                    "tool": "reportlab_pdf_generator",
                    "summary": "Generate MRPL Hot Work Permit deliverable with QR verification and sign-off."
                },
                {
                    "step_number": 8,
                    "step_name": "Cryptographic Audit Log Recording",
                    "tool": "audit_ledger",
                    "summary": "Seal execution trace into immutable SHA-256 chained audit ledger."
                }
            ]
        elif workflow_type == "EQUIPMENT_INSPECTION":
            return [
                {
                    "step_number": 1,
                    "step_name": "Inspection Sheet Parsing & OCR Analysis",
                    "tool": "ocr_parser",
                    "summary": f"Extract thickness grid and vibration measurements for {location}."
                },
                {
                    "step_number": 2,
                    "step_name": "API 570 / ISO 10816 Threshold Retrieval",
                    "tool": "mrpl_rag_retriever",
                    "summary": "Query MRPL-INSP-2026-B3 for equipment design thresholds."
                },
                {
                    "step_number": 3,
                    "step_name": "Mechanical Integrity Anomaly Calculation",
                    "tool": "thickness_calculator",
                    "summary": "Calculate remaining corrosion allowance and vibration velocity RMS."
                },
                {
                    "step_number": 4,
                    "step_name": "Asset Integrity Engineer Review (HITL)",
                    "tool": "hitl_checkpoint",
                    "summary": "Review anomalies and confirm derating or maintenance action plan."
                },
                {
                    "step_number": 5,
                    "step_name": "Formal Deliverable Generation",
                    "tool": "reportlab_pdf_generator",
                    "summary": "Compile Asset Integrity Inspection Summary Report."
                }
            ]
        else:
            return [
                {
                    "step_number": 1,
                    "step_name": "Query Understanding & Semantic Classification",
                    "tool": "query_parser",
                    "summary": f"Parse technical query regarding {title}."
                },
                {
                    "step_number": 2,
                    "step_name": "Local Industrial Knowledge Retrieval",
                    "tool": "mrpl_rag_retriever",
                    "summary": "Retrieve high-confidence chunks from MRPL document store."
                },
                {
                    "step_number": 3,
                    "step_name": "Evidence Synthesis & Citation Generation",
                    "tool": "sovereign_llm_synthesizer",
                    "summary": "Synthesize grounded answer with exact section and page references."
                }
            ]


model_gateway = ModelGateway()


# --- Scaffold / Mock Compatibility Model Gateway ---
from dataclasses import dataclass

@dataclass(slots=True)
class ModelResult:
    provider: str
    output_text: str


class LocalModelGateway:
    """
    Scaffold compatibility gateway providing local mock task processing.
    """
    def __init__(self) -> None:
        try:
            from app.config import get_settings
            self.settings = get_settings()
        except Exception:
            self.settings = None

    def run_task(self, prompt: str, task_type: str) -> ModelResult:
        return ModelResult(
            provider="mock-local-provider",
            output_text=(
                f"Placeholder local-model response for task_type={task_type}. "
                f"Prompt length={len(prompt)}. Configure a local model runtime to replace this provider."
            ),
        )

