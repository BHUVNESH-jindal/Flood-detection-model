import logging
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.db_models import Ward, SensorReading, Alert, Subscriber
from backend.app.schemas.api_schemas import AlertTriggerRequest, AlertOut, EmailRiskReportRequest
from backend.app.services.risk_engine import calculate_risk
from backend.app.services.safe_zone_service import get_nearest_safe_zone
from backend.app.services.whatsapp_service import send_whatsapp_alert
from backend.app.services.auth_service import require_official_role
from backend.app.services.email_service import send_risk_report

logger = logging.getLogger("alerts_router")

router = APIRouter(prefix="/alerts", tags=["Alerts & Warnings"])

@router.post("/trigger")
def trigger_alert(payload: AlertTriggerRequest, db: Session = Depends(get_db), current_user = Depends(require_official_role)):
    ward = db.query(Ward).filter(Ward.id == payload.ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")

    latest_reading = db.query(SensorReading).filter(SensorReading.ward_id == ward.id).order_by(SensorReading.timestamp.desc()).first()
    risk_info = calculate_risk(latest_reading, ward) if latest_reading else {"risk_level": "Warning", "risk_score": 75.0}

    risk_level = payload.risk_level or risk_info["risk_level"]
    sz_info = get_nearest_safe_zone(ward.latitude, ward.longitude, db, ward.district)
    triggered_by_str = current_user.full_name if current_user else payload.triggered_by

    subscribers = db.query(Subscriber).filter(Subscriber.ward_id == ward.id).all()
    if not subscribers and not payload.direct_phone:
        return {
            "status": "no_recipients",
            "id": None,
            "ward_id": ward.id,
            "risk_level": risk_level,
            "channel": "none",
            "message_text": payload.custom_message or f"[{risk_level.upper()}] Emergency advisory notification issued for {ward.name}.",
            "recipient_count": 0,
            "triggered_by": triggered_by_str,
            "dispatch_summary": {
                "total_subscribers": 0,
                "whatsapp_sent": 0,
                "opted_out_count": 0,
                "recipient_results": []
            }
        }

    dispatch_results = []
    whatsapp_cnt = 0
    opted_out_cnt = 0

    if payload.direct_phone:
        res_direct = send_whatsapp_alert(
            phone_number=payload.direct_phone,
            ward_name=ward.name,
            risk_level=risk_level,
            safe_zone_info=sz_info["formatted_string"] if sz_info else ward.safe_zone_name,
            language="en",
            custom_details=payload.custom_message
        )
        whatsapp_cnt += 1
        dispatch_results.append(res_direct)

    for sub in subscribers:
        if not sub.whatsapp_opted_in:
            opted_out_cnt += 1
            dispatch_results.append({
                "recipient": sub.phone_number,
                "name": sub.name,
                "channel": "whatsapp",
                "status": "skipped (not opted in)"
            })
            continue

        res = send_whatsapp_alert(
            phone_number=sub.phone_number,
            ward_name=ward.name,
            risk_level=risk_level,
            safe_zone_info=sz_info["formatted_string"] if sz_info else ward.safe_zone_name,
            language=sub.preferred_language,
            custom_details=payload.custom_message
        )
        whatsapp_cnt += 1
        dispatch_results.append(res)

    message_content = payload.custom_message or f"[{risk_level.upper()}] Emergency advisory notification issued for {ward.name}."

    alert_obj = Alert(
        ward_id=ward.id,
        risk_level=risk_level,
        channel="whatsapp",
        message_text=message_content,
        recipient_count=whatsapp_cnt,
        delivery_status=str(dispatch_results),
        triggered_by=triggered_by_str
    )
    db.add(alert_obj)
    db.commit()
    db.refresh(alert_obj)

    primary_wa_url = dispatch_results[0].get("whatsapp_url") if dispatch_results else None
    primary_broadcast_url = dispatch_results[0].get("broadcast_url") if dispatch_results else None

    return {
        "status": "success",
        "id": alert_obj.id,
        "ward_id": alert_obj.ward_id,
        "timestamp": alert_obj.timestamp,
        "risk_level": alert_obj.risk_level,
        "channel": alert_obj.channel,
        "message_text": alert_obj.message_text,
        "recipient_count": whatsapp_cnt,
        "triggered_by": triggered_by_str,
        "whatsapp_url": primary_wa_url,
        "broadcast_url": primary_broadcast_url,
        "dispatch_summary": {
            "total_subscribers": len(subscribers),
            "whatsapp_sent": whatsapp_cnt,
            "opted_out_count": opted_out_cnt,
            "recipient_results": dispatch_results
        }
    }

@router.get("", response_model=List[AlertOut])
def get_alerts(ward_id: Optional[int] = None, limit: int = 20, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if ward_id:
        query = query.filter(Alert.ward_id == ward_id)
    return query.order_by(Alert.timestamp.desc()).limit(limit).all()

@router.post("/email-report")
def email_risk_report(payload: EmailRiskReportRequest):
    try:
        threshold = float(os.getenv("ALERT_RISK_THRESHOLD", "0.7"))
        if not 0.0 <= threshold <= 1.0:
            raise ValueError
    except ValueError:
        message = "ALERT_RISK_THRESHOLD must be a number between 0 and 1."
        logger.error(message)
        return {"status": "error", "message": message, "sent": False}

    high_severity = payload.risk_level.strip().upper() in {"HIGH", "CRITICAL"}
    if payload.auto_triggered and payload.probability < threshold and not high_severity:
        return {
            "status": "threshold_not_met",
            "message": f"Risk probability is below the alert threshold of {threshold:.0%}; no email was sent.",
            "sent": False,
        }

    try:
        send_risk_report(
            recipient=payload.email,
            location_name=payload.location_name,
            latitude=payload.latitude,
            longitude=payload.longitude,
            risk_level=payload.risk_level,
            probability=payload.probability,
            advisory=payload.advisory,
        )
    except (ValueError, RuntimeError) as exc:
        logger.error("Risk report email could not be sent: %s", exc)
        return {"status": "error", "message": str(exc), "sent": False}

    return {"status": "success", "message": "Risk report email sent successfully.", "sent": True}

@router.post("/whatsapp-webhook")
async def whatsapp_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Twilio WhatsApp Inbound Webhook.
    Receives incoming WhatsApp messages from citizens, logs inquiries, and returns
    valid TwiML XML (preventing Twilio Error 12300) with emergency response guidelines.
    """
    import urllib.parse
    raw_body = (await request.body()).decode("utf-8", errors="ignore")
    parsed = urllib.parse.parse_qs(raw_body)
    incoming_msg = parsed.get("Body", [""])[0].strip()
    from_number = parsed.get("From", [""])[0].replace("whatsapp:", "").strip()

    logger.info(f"[WhatsApp Webhook] Received from {from_number}: '{incoming_msg}'")

    cmd = incoming_msg.upper()
    if "HELP" in cmd or "SOS" in cmd or "RESCUE" in cmd:
        reply_text = (
            "🚨 [PREDICT FLOW EMERGENCY]\n\n"
            "If you are in immediate danger of rising floodwater or landslide:\n"
            "1. Move immediately to higher elevation/designated shelter.\n"
            "2. Dial 1077 (SDMA Disaster Control Room) or 112.\n"
            "3. Do not attempt to cross flooded causeways or riverbeds."
        )
    elif "STATUS" in cmd or "ALERT" in cmd or "WEATHER" in cmd:
        reply_text = (
            "🛰️ [PREDICT FLOW LIVE TELEMETRY]\n\n"
            "Himalayan Basin Hydrology Monitoring: ACTIVE\n"
            "Sensor grid reporting nominal. To view live radar & interactive shelter maps, visit: https://floodflash.gov.in"
        )
    elif incoming_msg:
        reply_text = (
            f"PREDICT FLOW Early Warning received: '{incoming_msg}'.\n"
            "Reply 'HELP' for emergency protocols or 'STATUS' for live basin telemetry. Emergency Helpline: 1077."
        )
    else:
        reply_text = ""

    if reply_text:
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{reply_text}</Message>
</Response>"""
    else:
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response/>"""

    return Response(content=twiml, media_type="application/xml")
