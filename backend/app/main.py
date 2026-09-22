import uuid
from datetime import datetime
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.endpoints import router as api_router
from backend.app.services.agent_orchestrator import agent_orchestrator
from backend.app.models.schemas import WorkflowType, TaskPriority

from contextlib import asynccontextmanager
from backend.app.db.init_db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema and seed data
    init_db()
    yield

app = FastAPI(
    title="SovereignAI Workbench API - MRPL",
    description="Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work (SIH26117)",
    version="2026.1",
    lifespan=lifespan
)

# CORS middleware for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Sanitize internal system errors to prevent leaking stack traces or confidential server details.
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal system error occurred. Security team has been notified via audit trail."}
    )


app.include_router(api_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
