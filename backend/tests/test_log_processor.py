import pytest

from app.core.database import SessionLocal
from app.models.audit_log import AuditLog
from app.models.security_event import SecurityEvent
from app.services.log_processor import (
    parse_security_log,
    process_security_log,
)


def test_parse_failed_login():
    log = (
        "2026-09-16 14:30:12 | "
        "192.168.1.100 | "
        "FAILED_LOGIN | "
        "User authentication failed"
    )

    result = parse_security_log(log)

    assert result["event_type"] == "failed_login"
    assert result["severity"] == "medium"
    assert result["source_ip"] == "192.168.1.100"
    assert result["message"] == "User authentication failed"


def test_parse_brute_force():
    log = (
        "2026-09-16 14:35:20 | "
        "10.0.0.50 | "
        "BRUTE_FORCE | "
        "Multiple failed login attempts detected"
    )

    result = parse_security_log(log)

    assert result["event_type"] == "brute_force"
    assert result["severity"] == "high"


def test_parse_privilege_escalation():
    log = (
        "2026-09-16 14:40:05 | "
        "10.0.0.25 | "
        "PRIVILEGE_ESCALATION | "
        "User gained elevated privileges"
    )

    result = parse_security_log(log)

    assert result["event_type"] == "privilege_escalation"
    assert result["severity"] == "critical"


def test_invalid_log_format():
    log = "This is not a valid security log"

    with pytest.raises(ValueError):
        parse_security_log(log)


def test_invalid_timestamp():
    log = (
        "invalid-date | "
        "192.168.1.100 | "
        "FAILED_LOGIN | "
        "User authentication failed"
    )

    with pytest.raises(ValueError):
        parse_security_log(log)


def test_unsupported_event_type():
    log = (
        "2026-09-16 14:30:12 | "
        "192.168.1.100 | "
        "UNKNOWN_EVENT | "
        "Unknown security activity"
    )

    with pytest.raises(ValueError):
        parse_security_log(log)


def test_process_security_log_creates_event_and_audit():
    db = SessionLocal()

    try:
        log = (
            "2026-09-17 16:00:00 | "
            "10.0.0.66 | "
            "BRUTE_FORCE | "
            "Repeated failed login attempts detected"
        )

        event = process_security_log(
            db=db,
            asset_id=2,
            log_line=log,
            user_id=4,
        )

        assert event.id is not None
        assert event.asset_id == 2
        assert event.event_type == "brute_force"
        assert event.severity == "high"
        assert event.source_ip == "10.0.0.66"
        assert event.status == "new"

        audit_log = (
            db.query(AuditLog)
            .filter(
                AuditLog.entity_type == "security_event",
                AuditLog.entity_id == event.id,
            )
            .order_by(AuditLog.id.desc())
            .first()
        )

        assert audit_log is not None
        assert audit_log.user_id == 4
        assert audit_log.action == "create"
        assert audit_log.entity_type == "security_event"
        assert audit_log.entity_id == event.id

    finally:
        if "event" in locals():
            db.query(AuditLog).filter(
                AuditLog.entity_type == "security_event",
                AuditLog.entity_id == event.id,
            ).delete()

            db.query(SecurityEvent).filter(
                SecurityEvent.id == event.id
            ).delete()

            db.commit()

        db.close()        

