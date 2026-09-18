from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    user_id: int | None,
    organization_id: int,
    action: str,
    entity_type: str,
    entity_id: int | None,
    description: str,
    ip_address: str | None = None,
):
    audit_log = AuditLog(
        user_id=user_id,
        organization_id=organization_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description,
        ip_address=ip_address,
    )

    db.add(audit_log)

    return audit_log
