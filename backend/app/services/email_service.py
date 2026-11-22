import os
import smtplib
import ssl
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def send_risk_report(
    recipient: str,
    location_name: str,
    latitude: float,
    longitude: float,
    risk_level: str,
    probability: float,
    advisory: str,
) -> None:
    sender = os.getenv("SMTP_EMAIL", "").strip()
    app_password = os.getenv("SMTP_APP_PASSWORD", "").strip()

    if not sender:
        raise ValueError("SMTP_EMAIL is not configured; set it to the Gmail account used to send reports.")
    if not app_password:
        raise ValueError("SMTP_APP_PASSWORD is not configured; set a Gmail App Password to send reports.")

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    message = EmailMessage()
    message["Subject"] = "Flood and Landslide Risk Report"
    message["From"] = sender
    message["To"] = recipient
    message.set_content(
        "\n".join(
            (
                "Flood and Landslide Safety Risk Report",
                "",
                f"Location: {location_name}",
                f"Coordinates: {latitude:.5f}, {longitude:.5f}",
                f"Risk Level: {risk_level}",
                f"Risk Probability: {probability:.1%}",
                f"Timestamp: {timestamp}",
                "",
                "Recommended Safety Action:",
                advisory,
            )
        )
    )

    try:
        with smtplib.SMTP_SSL(
            "smtp.gmail.com",
            465,
            context=ssl.create_default_context(),
            timeout=20,
        ) as smtp:
            smtp.login(sender, app_password)
            smtp.send_message(message)
    except (smtplib.SMTPException, OSError) as exc:
        raise RuntimeError(f"Gmail SMTP could not send the risk report: {exc}") from exc
