import logging
import urllib.parse
from datetime import datetime
from typing import Dict, Any, List, Optional

logger = logging.getLogger("whatsapp_service")
logger.setLevel(logging.INFO)

def format_phone_number(phone_number: str, is_whatsapp: bool = True) -> str:
    cleaned = phone_number.strip()
    if is_whatsapp:
        if not cleaned.startswith("whatsapp:"):
            if not cleaned.startswith("+"):
                cleaned = f"+{cleaned}"
            cleaned = f"whatsapp:{cleaned}"
        return cleaned
    else:
        if cleaned.startswith("whatsapp:"):
            cleaned = cleaned.replace("whatsapp:", "")
        if not cleaned.startswith("+"):
            cleaned = f"+{cleaned}"
        return cleaned

def build_multilingual_alert_message(
    ward_name: str,
    risk_level: str,
    safe_zone_info: str,
    language: str = "en",
    custom_details: Optional[str] = None
) -> str:
    timestamp_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    risk_upper = risk_level.upper()

    if language == "hi":
        details = custom_details or "भारी वर्षा एवं मिट्टी की उच्च नमी का खतरा दर्ज किया गया है।"
        message = (
            f"🚨 [{risk_upper}] बाढ़ चेतावनी — {ward_name}\n\n"
            f"{details}\n\n"
            f"🏃 सुरक्षित स्थान: तुरंत {safe_zone_info} की ओर जाएं।\n"
            f"📞 आपदा नियंत्रण कक्ष: 1077 / 112\n"
            f"🕒 समय: {timestamp_str}"
        )
    elif language == "gar":
        details = custom_details or "भारी बरखा अर पहाड़ खिसकण को बडू खतरा पैदा होइगे।"
        message = (
            f"🚨 [{risk_upper}] चेतावनी — {ward_name}\n\n"
            f"{details}\n\n"
            f"🏃 सुरक्षित ठौर: तुरंत {safe_zone_info} तरफ जावा।\n"
            f"📞 आपदा फोन: 1077 / 112\n"
            f"🕒 समय: {timestamp_str}"
        )
    else:
        details = custom_details or "Severe flash flood and elevated soil saturation hazard detected in your sector."
        message = (
            f"🚨 [{risk_upper} FLOOD ALERT] — {ward_name}\n\n"
            f"{details}\n\n"
            f"🏃 EVACUATION SAFE ZONE: Please move towards {safe_zone_info} immediately.\n"
            f"📞 Emergency Helpline: Dial 1077 or 112\n"
            f"🕒 Issued: {timestamp_str}\n"
            f"State Disaster Management Authority (SDMA)"
        )
    
    return message

def send_whatsapp_alert(
    phone_number: str,
    ward_name: str,
    risk_level: str,
    safe_zone_info: str,
    language: str = "en",
    custom_details: Optional[str] = None
) -> Dict[str, Any]:
    """
    Direct 1-Click WhatsApp Dispatch & Community Broadcast Service.
    Generates universal WhatsApp deep-links (wa.me / api.whatsapp.com) with 
    pre-filled emergency instructions, coordinates, and helpline numbers.
    Zero complex third-party gateway friction, 100% free, works instantly.
    """
    formatted_to = format_phone_number(phone_number, is_whatsapp=True)
    message_text = build_multilingual_alert_message(ward_name, risk_level, safe_zone_info, language, custom_details)
    encoded_text = urllib.parse.quote(message_text)

    clean_digits = "".join(c for c in phone_number if c.isdigit())
    direct_link = f"https://wa.me/{clean_digits}?text={encoded_text}" if clean_digits else None
    broadcast_link = f"https://api.whatsapp.com/send?text={encoded_text}"

    logger.info(f"[1-Click WhatsApp Dispatch] Prepared for {phone_number} | Ward: {ward_name}")

    return {
        "recipient": phone_number,
        "formatted_to": formatted_to,
        "channel": "whatsapp",
        "language": language,
        "status": "ready_for_whatsapp_dispatch",
        "whatsapp_url": direct_link or broadcast_link,
        "broadcast_url": broadcast_link,
        "message_text": message_text,
        "timestamp": datetime.utcnow().isoformat()
    }
