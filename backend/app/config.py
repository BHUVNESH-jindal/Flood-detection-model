import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "PREDICT FLOW Emergency & GIS Early Warning Backend"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # JWT Authentication (Required from environment, no default fallback)
    JWT_SECRET_KEY: str
    
    # Risk Engine Mode: 'ml' or 'rule_based'
    RISK_ENGINE_MODE: str = "ml"
    
    # Database
    DATABASE_URL: str = "sqlite:///./flood_flash.db"
    
    # Twilio WhatsApp Configuration
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_WHATSAPP_NUMBER: str = "whatsapp:+14155238886"
    
    # Simulation / Risk Background Job Interval (seconds)
    SIMULATION_INTERVAL_SECONDS: int = 60
    
    # Real Rainfall Credentials
    EARTHDATA_USERNAME: Optional[str] = None
    EARTHDATA_PASSWORD: Optional[str] = None
    JAXA_USERNAME: Optional[str] = None
    JAXA_PASSWORD: Optional[str] = None
    
    # CORS Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "https://your-production-domain.com"
    ]

    @field_validator("DEBUG", mode="before")
    @classmethod
    def assemble_debug(cls, v):
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes", "on", "debug")
        return bool(v)

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
