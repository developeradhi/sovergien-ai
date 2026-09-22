# SovereignAI Workbench (SIH26117)
**Mangalore Refinery and Petrochemicals Limited (MRPL) • Smart Automation / Software**

> **Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work**

---

## 1. Project Overview

Refineries and industrial plants handle critical assets: Standard Operating Procedures (SOPs), Piping & Instrumentation Diagrams (P&IDs), Hot-Work / Cold-Work Permits, ultrasonic thickness inspection logs, and internal engineering designs. 

Sending these confidential materials to external cloud AI APIs (OpenAI, Claude, etc.) presents data governance, confidentiality, and sovereignty violations. Conversely, purely manual processing is slow and leads to maintenance delays.

**SovereignAI Workbench** bridges this gap: a **100% on-premise, air-gapped, stateful Agentic AI platform** powered by open-weight models (LLaMA 3.1 8B, Qwen 2.5 7B, LLaVA 1.6) that:
1. Operates with **zero outbound internet traffic** (strict air-gap enforcement).
2. Decomposes tasks through an **8-stage state machine**: `Understand -> Plan -> Retrieve -> Execute Tools -> Validate -> Review (HITL) -> Deliver -> Audit`.
3. Pauses autonomous execution at **Human-in-the-Loop (HITL) checkpoints** for certified Safety Reviewer sign-off on safety-critical workflows.
4. Generates audit-ready **PDF Hot-Work Permits** and reports with cryptographic SHA-256 verification seals.
5. Implements **strict industrial security**: PBKDF2-HMAC-SHA256 password hashing, brute-force rate-limiting, strict input sanitization, generic auth errors, and an immutable chained audit ledger.

---

## 2. Six-Layer Technical Architecture

| Layer | Technology | Primary Functionality |
|---|---|---|
| **Layer 6: User Interface** | React 18, TypeScript, Vite, Tailwind CSS | Enterprise operator dashboard, live agent graph visualizer, HITL review modal, and deliverable downloaders. |
| **Layer 5: Agent Orchestration** | Stateful LangGraph Engine | Controls 8-step lifecycle, subtask scheduling, tool selection, error retries, and review checkpoints. |
| **Layer 4: Tool Integration** | Model Context Protocol (MCP) Tools | Sandboxed tools: SIMOPS permit conflict detector, combustible LEL gas validator, P&ID DBB isolation check. |
| **Layer 3: Memory** | Task State Machine & Checklists | Procedural checklist cache, step execution outputs, and active session context. |
| **Layer 2: RAG & Knowledge** | Local Embeddings + Vector Store | Ingests MRPL SOPs (`MRPL-SOP-SAF-402`, `MRPL-ENG-PND-108`, `MRPL-INSP-2026-B3`) with source citations (filename, page, score, evidence). |
| **Layer 1: Local Model Gateway** | LLaMA 3.1 8B / Qwen 2.5 7B / LLaVA 1.6 | Local Ollama connector with automatic graceful fallback to the embedded air-gapped Sovereign Engine. |
| **Cross-Cutting Security** | RBAC, PBKDF2, Rate Limiting, Audit Chaining | Enforces 5 roles (`Operator`, `Safety Reviewer`, `Knowledge Admin`, `Auditor`, `System Admin`), locks brute force after 5 attempts, chains SHA-256 hashes. |

---

## 3. Quick Start & Execution

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Launch Backend API
```bash
# From workspace root
run_backend.bat
# Or manually:
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation available at: **http://127.0.0.1:8000/docs**

### 2. Launch Operator Workbench UI
```bash
# From workspace root
run_frontend.bat
# Or manually:
cd frontend
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 4. Flagship Demonstration Walkthrough

1. **Observe Flagship Pre-seeded Task**:
   - Title: `Emergency Overhead Manifold Welding - CDU-II`
   - Unit: `Crude Distillation Unit (CDU-II), Column C-101 Overhead Manifold`
   - Notice the task status is **`WAITING_FOR_REVIEW`**!
2. **Inspect the Agent Graph**:
   - Click the task to view the 8-step execution: `Understand` -> `Plan` -> `Retrieve SOP` -> `Execute Tools` -> `Validate` -> **`WAITING_HITL`**.
   - Notice tool findings:
     - Conflict Detector: Active cold work on Line 14-B within 18m (violates 30m SIMOPS rule).
     - Gas Detector: LEL at 3.2% (exceeds 0.0% threshold).
3. **Experience Human-in-the-Loop (HITL) Sign-off**:
   - In the top bar, switch role from **`Operator`** to **`Safety Reviewer`**.
   - The review card activates. Enter safety directives (e.g. continuous nitrogen purging, 0.0% LEL confirmation).
   - Click **`AUTHORIZE & GENERATE PERMIT`**.
4. **Download Business Deliverable**:
   - The task transitions to **`COMPLETED`**.
   - Click **`Download PDF Permit`** to view the official MRPL permit with safety tables, citations, reviewer signature, and SHA-256 seal.
5. **Verify Immutable Audit Trail**:
   - Switch to the **`Security & Audit Trail`** tab.
   - Click **`Verify Ledger Integrity`** to cryptographically verify the unbroken SHA-256 chain links.
6. **Test RAG Knowledge Retrieval**:
   - Switch to the **`Knowledge Base (RAG)`** tab.
   - Enter a query like: `"hot work clearance distance CDU-II LEL gas"`.
   - Observe precise citations with page numbers, relevance percentage, and evidence excerpts.

---

## 5. Automated Test Suite

To run backend security, RBAC, RAG, and workflow integration tests:
```bash
python -m pytest backend/tests/test_backend.py -v
```
All 8 integration tests verify:
- Secure password hashing and verification
- Input sanitization against script tags and null bytes
- 5-attempt brute-force account lockout
- Generic error messages on authentication failure
- RBAC permission barriers
- Local RAG citations with page references
- SHA-256 tamper-evident ledger integrity
- Complete end-to-end task creation, HITL pause, review, and PDF generation
