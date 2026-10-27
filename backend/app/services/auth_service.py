import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from passlib.context import CryptContext

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.db_models import User

logger = logging.getLogger("auth")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

JWT_SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

import time
from collections import defaultdict

_FAILED_ATTEMPTS = defaultdict(list)
_LOCKOUTS = {}

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_SECONDS = 900  # 15 minutes
ATTEMPT_WINDOW_SECONDS = 900    # 15 minutes

def check_login_lockout(identifier: str) -> None:
    now = time.time()
    locked_until = _LOCKOUTS.get(identifier)
    if locked_until and now < locked_until:
        remaining_minutes = max(1, int((locked_until - now) / 60))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account or IP temporarily locked due to multiple failed login attempts. Try again in {remaining_minutes} minute(s)."
        )
    elif locked_until and now >= locked_until:
        _LOCKOUTS.pop(identifier, None)
        _FAILED_ATTEMPTS[identifier] = []

def record_failed_login(identifier: str) -> None:
    now = time.time()
    attempts = [t for t in _FAILED_ATTEMPTS[identifier] if now - t < ATTEMPT_WINDOW_SECONDS]
    attempts.append(now)
    _FAILED_ATTEMPTS[identifier] = attempts
    if len(attempts) >= MAX_FAILED_ATTEMPTS:
        _LOCKOUTS[identifier] = now + LOCKOUT_DURATION_SECONDS
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Account temporarily locked for 15 minutes."
        )

def record_successful_login(identifier: str) -> None:
    _FAILED_ATTEMPTS.pop(identifier, None)
    _LOCKOUTS.pop(identifier, None)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
    except Exception:
        return None

    user = db.query(User).filter(User.username == username).first()
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def require_official_role(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["official", "district_official"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Requires 'official' role to execute emergency alert actions."
        )
    return current_user
