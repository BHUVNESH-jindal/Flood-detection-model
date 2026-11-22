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

    Priority 1: Real Google OAuth — verifies `credential` (ID token) server-side.
    Priority 2: Dev/legacy fallback — trusts `email` + `full_name` directly
                (only used when GOOGLE_CLIENT_ID is not set or during local dev).
    """
    email: str = ""
    full_name: str = ""

    # ── Path 1: Real Google OAuth — verify the ID token server-side ───────────
    if payload.credential:
        try:
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests
            try:
                from backend.app.config import settings
            except ImportError:
                from app.config import settings

            client_id = settings.GOOGLE_CLIENT_ID
            if not client_id or client_id == "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com":
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=(
                        "Google OAuth is not configured on this server. "
                        "Set GOOGLE_CLIENT_ID in .env to your Google Cloud OAuth Client ID."
                    )
                )

            id_info = google_id_token.verify_oauth2_token(
                payload.credential,
                google_requests.Request(),
                client_id,
                clock_skew_in_seconds=10
            )

            if id_info.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google ID token issuer"
                )

            email = id_info.get("email", "").strip().lower()
            full_name = (
                id_info.get("name")
                or id_info.get("email", "").split("@")[0].replace(".", " ").title()
            )

        except HTTPException:
            raise
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Google token verification failed: {exc}"
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Google authentication error: {exc}"
            )

    # ── Path 2: Legacy / Dev fallback — trust email+name from frontend ────────
    elif payload.email:
        email = payload.email.strip().lower()
        full_name = (
            payload.full_name
            or email.split("@")[0].replace(".", " ").title()
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a Google credential token or an email address is required"
        )

    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid Google email address is required"
        )

    # ── Upsert the citizen profile ────────────────────────────────────────────
    user = db.query(User).filter(
        (User.email == email) | (User.username == email)
    ).first()

    if not user:
        base_username = email.split("@")[0].replace(".", "_")
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}_{counter}"
            counter += 1

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
    else:
        # Keep display name in sync with Google profile
        if full_name and full_name != user.full_name:
            user.full_name = full_name
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
