from enum import Enum
from typing import List, Set


class Role(str, Enum):
    OPERATOR = "Operator"
    SAFETY_REVIEWER = "Safety Reviewer"
    KNOWLEDGE_ADMIN = "Knowledge Admin"
    AUDITOR = "Auditor"
    SYSTEM_ADMIN = "System Admin"


class Permission(str, Enum):
    TASK_CREATE = "task:create"
    TASK_VIEW = "task:view"
    TASK_REVIEW = "task:review"
    DOCUMENT_UPLOAD = "document:upload"
    KNOWLEDGE_INGEST = "knowledge:ingest"
    AUDIT_VIEW = "audit:view"
    SYSTEM_CONFIG = "system:config"


ROLE_PERMISSIONS: dict[Role, Set[Permission]] = {
    Role.OPERATOR: {
        Permission.TASK_CREATE,
        Permission.TASK_VIEW,
        Permission.DOCUMENT_UPLOAD,
    },
    Role.SAFETY_REVIEWER: {
        Permission.TASK_VIEW,
        Permission.TASK_REVIEW,
        Permission.DOCUMENT_UPLOAD,
        Permission.AUDIT_VIEW,
    },
    Role.KNOWLEDGE_ADMIN: {
        Permission.TASK_VIEW,
        Permission.DOCUMENT_UPLOAD,
        Permission.KNOWLEDGE_INGEST,
        Permission.AUDIT_VIEW,
    },
    Role.AUDITOR: {
        Permission.TASK_VIEW,
        Permission.AUDIT_VIEW,
    },
    Role.SYSTEM_ADMIN: {
        Permission.TASK_CREATE,
        Permission.TASK_VIEW,
        Permission.TASK_REVIEW,
        Permission.DOCUMENT_UPLOAD,
        Permission.KNOWLEDGE_INGEST,
        Permission.AUDIT_VIEW,
        Permission.SYSTEM_CONFIG,
    },
}


def has_permission(user_role: Role, required_permission: Permission) -> bool:
    role_perms = ROLE_PERMISSIONS.get(user_role, set())
    return required_permission in role_perms
