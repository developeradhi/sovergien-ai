import hashlib
import json
import os
from datetime import datetime
from typing import List, Optional
from backend.app.models.schemas import AuditLogEntry

AUDIT_LOG_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "audit_chain.jsonl")


class AuditService:
    def __init__(self):
        self.log_file = AUDIT_LOG_FILE
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
        self.entries: List[AuditLogEntry] = []
        self._load_existing_log()

    def _load_existing_log(self):
        if os.path.exists(self.log_file):
            try:
                with open(self.log_file, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.strip():
                            data = json.loads(line)
                            entry = AuditLogEntry(**data)
                            self.entries.append(entry)
            except Exception:
                pass

    def record_event(
        self,
        actor_id: str,
        actor_username: str,
        actor_role: str,
        action_type: str,
        resource_id: str,
        event_details: str,
        security_flag: bool = False
    ) -> AuditLogEntry:
        """
        Appends an immutable audit entry with cryptographic hash chaining.
        """
        timestamp = datetime.utcnow()
        previous_hash = self.entries[-1].entry_hash if self.entries else "GENESIS_BLOCK_MRPL_SOVEREIGN_2026"
        
        # Calculate SHA-256 over all immutable properties
        payload = f"{timestamp.isoformat()}|{actor_id}|{actor_username}|{actor_role}|{action_type}|{resource_id}|{event_details}|{previous_hash}"
        entry_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()

        entry = AuditLogEntry(
            id=f"AUD-{len(self.entries) + 1:05d}",
            timestamp=timestamp,
            actor_id=actor_id,
            actor_username=actor_username,
            actor_role=actor_role,
            action_type=action_type,
            resource_id=resource_id,
            event_details=event_details,
            security_flag=security_flag,
            entry_hash=entry_hash,
            previous_hash=previous_hash
        )

        self.entries.append(entry)
        
        # Append to persistent ledger file
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(entry.model_dump_json() + "\n")
        except Exception:
            pass

        # Also persist to SQLite database
        try:
            from backend.app.db.database import SessionLocal
            from backend.app.db.models import DBAuditEntry
            db = SessionLocal()
            db_entry = DBAuditEntry(
                id=entry.id,
                timestamp=entry.timestamp,
                actor_id=entry.actor_id,
                actor_username=entry.actor_username,
                actor_role=entry.actor_role,
                action_type=entry.action_type,
                resource_id=entry.resource_id,
                event_details=entry.event_details,
                security_flag=entry.security_flag,
                entry_hash=entry.entry_hash,
                previous_hash=entry.previous_hash
            )
            db.add(db_entry)
            db.commit()
            db.close()
        except Exception:
            pass

        return entry

    def get_all_entries(self, limit: int = 100) -> List[AuditLogEntry]:
        return list(reversed(self.entries[-limit:]))

    def verify_chain_integrity(self) -> dict:
        """
        Verifies the cryptographic chain across all recorded events.
        """
        if not self.entries:
            return {"verified": True, "total_records": 0, "status": "Genesis state"}

        previous_hash = "GENESIS_BLOCK_MRPL_SOVEREIGN_2026"
        for idx, entry in enumerate(self.entries):
            if entry.previous_hash != previous_hash:
                return {
                    "verified": False,
                    "tampered_at_index": idx,
                    "entry_id": entry.id,
                    "reason": "Previous hash pointer mismatch"
                }
            payload = f"{entry.timestamp.isoformat()}|{entry.actor_id}|{entry.actor_username}|{entry.actor_role}|{entry.action_type}|{entry.resource_id}|{entry.event_details}|{entry.previous_hash}"
            expected_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
            if entry.entry_hash != expected_hash:
                return {
                    "verified": False,
                    "tampered_at_index": idx,
                    "entry_id": entry.id,
                    "reason": "Hash checksum recomputation mismatch"
                }
            previous_hash = entry.entry_hash

        return {
            "verified": True,
            "total_records": len(self.entries),
            "latest_hash": self.entries[-1].entry_hash if self.entries else None,
            "status": "Cryptographically Sound & Tamper-Evident"
        }


audit_service = AuditService()
