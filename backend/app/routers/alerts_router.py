from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.db_models import Ward, SensorReading, Alert, Subscriber
from backend.app.schemas.api_schemas import AlertTriggerRequest, AlertOut
from backend.app.services.risk_engine import calculate_risk
from backend.app.services.safe_zone_service import get_nearest_safe_zone
from backend.app.services.whatsapp_service import send_whatsapp_alert
from backend.app.services.auth_service import require_official_role

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
