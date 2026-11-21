from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import time
from backend.app.database import get_db
from backend.app.models.db_models import User
from backend.app.schemas.api_schemas import LoginRequest, GoogleAuthRequest, TokenResponse, UserOut
from backend.app.services.auth_service import (
    verify_password, hash_password, create_access_token, get_current_user,
    check_login_lockout, record_failed_login, record_successful_login
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    identifier = payload.username.strip()
    lock_key = f"{ip}:{identifier.lower()}"
    check_login_lockout(lock_key)

    user = db.query(User).filter(
        (User.username == identifier) | (User.email == identifier.lower())
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        record_failed_login(lock_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials: username/email or passphrase incorrect"
        )

    record_successful_login(lock_key)
    token = create_access_token({"sub": user.username, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        username=user.username,
        full_name=user.full_name,
        email=user.email
    )

@router.post("/google", response_model=TokenResponse)
def google_auth(payload: GoogleAuthRequest, request: Request, db: Session = Depends(get_db)):
    """
    Authenticate or register a citizen/user using Google Identity credentials.
    """
    email = payload.email.strip().lower() if payload.email else ""
    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid Google email address is required"
        )

    # Check if user already exists with this email or username
    user = db.query(User).filter(
        (User.email == email) | (User.username == email)
    ).first()

    if not user:
        # Create a new verified Citizen profile
        base_username = email.split("@")[0].replace(".", "_")
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}_{counter}"
            counter += 1

        full_name = payload.full_name or email.split("@")[0].replace(".", " ").title()
        user = User(
            username=username,
            email=email,
            full_name=full_name,
            hashed_password=hash_password(f"google_oauth_{email}_{time.time()}"),
            role="viewer",
            district="Uttarakhand General"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.username, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        username=user.username,
        full_name=user.full_name,
        email=user.email
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
