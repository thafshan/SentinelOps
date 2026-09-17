from datetime import datetime


EVENT_SEVERITY = {
    "FAILED_LOGIN": "medium",
    "SUCCESSFUL_LOGIN": "low",
    "BRUTE_FORCE": "high",
    "SUSPICIOUS_IP": "high",
    "PRIVILEGE_ESCALATION": "critical",
    "MALWARE_DETECTED": "critical",
    "UNAUTHORIZED_ACCESS": "high",
}


def parse_security_log(log_line: str) -> dict:
    parts = [part.strip() for part in log_line.split("|")]

    if len(parts) != 4:
        raise ValueError(
            "Invalid log format. Expected: "
            "timestamp | source_ip | event_type | message"
        )

    timestamp_text, source_ip, event_type, message = parts

    try:
        detected_at = datetime.strptime(
            timestamp_text,
            "%Y-%m-%d %H:%M:%S",
        )
    except ValueError as exc:
        raise ValueError(
            "Invalid timestamp format. Expected: YYYY-MM-DD HH:MM:SS"
        ) from exc

    event_type = event_type.upper()

    if event_type not in EVENT_SEVERITY:
        raise ValueError(
            f"Unsupported event type: {event_type}"
        )

    if not source_ip:
        raise ValueError("Source IP cannot be empty")

    if not message:
        raise ValueError("Log message cannot be empty")

    return {
        "detected_at": detected_at,
        "source_ip": source_ip,
        "event_type": event_type.lower(),
        "severity": EVENT_SEVERITY[event_type],
        "message": message,
    }

from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.models.security_event import SecurityEvent
from app.models.user import User
from app.services.audit import create_audit_log

def process_security_log(
    db: Session,
    asset_id: int,
    log_line: str,
    user_id: int | None = None,
) -> SecurityEvent:
    asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id)
        .first()
    )

    if not asset:
        raise ValueError(
            f"Asset with ID {asset_id} does not exist"
        )

    parsed_event = parse_security_log(log_line)

    security_event = SecurityEvent(
        asset_id=asset_id,
        event_type=parsed_event["event_type"],
        severity=parsed_event["severity"],
        source_ip=parsed_event["source_ip"],
        message=parsed_event["message"],
        status="new",
        detected_at=parsed_event["detected_at"],
    )

    db.add(security_event)
    db.flush()

    create_audit_log(
        db=db,
        user_id=user_id,
        action="create",
        entity_type="security_event",
        entity_id=security_event.id,
        description=(
            f"Created security event "
            f"'{security_event.event_type}' from "
            f"{security_event.source_ip}."
        ),
    )

    db.commit()
    db.refresh(security_event)

    return security_event