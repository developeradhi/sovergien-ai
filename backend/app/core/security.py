import hashlib
import hmac
import os
import re
import html
import time
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional
import jwt

SECRET_KEY = os.environ.get("SOVEREIGN_SECRET_KEY", "sovereign-ai-mrpl-secret-token-key-2026-industrial-secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hour industrial shift

# Brute-force protection tracking
# username/ip -> (failed_attempts, locked_until_timestamp)
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_SECONDS = 900  # 15 minutes
_login_attempts: Dict[str, Tuple[int, float]] = {}


def sanitize_input(value: str) -> str:
    """
    Sanitize text input:
    - Strips control characters and null bytes
    - Escapes HTML entities to prevent stored XSS
    - Strips leading and trailing excess whitespace
    """
    if not isinstance(value, str):
        return value
    # Remove null bytes and non-printable control characters (except newline, carriage return, tab)
    sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', value)
    # Escape HTML tags and special characters
    sanitized = html.escape(sanitized.strip())
    return sanitized


def hash_password(password: str) -> str:
    """
    Secure password hashing using PBKDF2-HMAC-SHA256 with 100,000 iterations and a cryptographically secure random salt.
    Format: iterations$salt_hex$hash_hex
    """
    salt = os.urandom(16)
    iterations = 100_000
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return f"{iterations}${salt.hex()}${derived.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Constant-time password verification using hmac.compare_digest.
    """
    try:
        parts = hashed_password.split("$")
        if len(parts) != 3:
            return False
        iterations = int(parts[0])
        salt = bytes.fromhex(parts[1])
        expected_hash = bytes.fromhex(parts[2])
        derived = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(derived, expected_hash)
    except Exception:
        return False


def check_login_rate_limit(identifier: str) -> Tuple[bool, Optional[int]]:
    """
    Checks if an identifier (username or client IP) is currently locked out.
    Returns: (is_locked, seconds_remaining)
    """
    now = time.time()
    if identifier in _login_attempts:
        attempts, locked_until = _login_attempts[identifier]
        if locked_until > now:
            return True, int(locked_until - now)
        elif locked_until > 0 and locked_until <= now:
            # Lockout expired, reset attempts
            del _login_attempts[identifier]
    return False, None


def record_failed_login(identifier: str) -> bool:
    """
    Records a failed attempt. If exceeds MAX_LOGIN_ATTEMPTS, locks the account.
    Returns True if now locked, False otherwise.
    """
    now = time.time()
    attempts, locked_until = _login_attempts.get(identifier, (0, 0.0))
    if locked_until > now:
        return True
    
    attempts += 1
    if attempts >= MAX_LOGIN_ATTEMPTS:
        _login_attempts[identifier] = (attempts, now + LOCKOUT_DURATION_SECONDS)
        return True
    else:
        _login_attempts[identifier] = (attempts, 0.0)
        return False


def reset_login_attempts(identifier: str) -> None:
    """Resets failed login count upon successful authentication."""
    if identifier in _login_attempts:
        del _login_attempts[identifier]


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None
