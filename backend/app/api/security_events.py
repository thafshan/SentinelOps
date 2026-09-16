from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.asset import Asset
from app.models.security_event import SecurityEvent
from app.models.user import User
from app.schemas.security_event import (
    SecurityEventCreate,
    SecurityEventResponse,
    SecurityEventUpdate,
)
from app.services.audit import create_audit_log


router = APIRouter(
    prefix="/security-events",
    tags=["Security Events"],
)


@router.post(
    "/",
    response_model=SecurityEventResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_security_event(
    event_data: SecurityEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = (
        db.query(Asset)
        .filter(Asset.id == event_data.asset_id)
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    event = SecurityEvent(
        **event_data.model_dump(exclude_none=True)
    )

    db.add(event)
    db.flush()

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="create",
        entity_type="security_event",
        entity_id=event.id,
        description=f"Created security event '{event.event_type}'.",
    )

    db.commit()
    db.refresh(event)

    return event


@router.get(
    "/",
    response_model=list[SecurityEventResponse],
)
def get_security_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    events = (
        db.query(SecurityEvent)
        .order_by(SecurityEvent.id.desc())
        .all()
    )

    return events


@router.get(
    "/{event_id}",
    response_model=SecurityEventResponse,
)
def get_security_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = (
        db.query(SecurityEvent)
        .filter(SecurityEvent.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Security event not found",
        )

    return event


@router.put(
    "/{event_id}",
    response_model=SecurityEventResponse,
)
def update_security_event(
    event_id: int,
    event_data: SecurityEventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = (
        db.query(SecurityEvent)
        .filter(SecurityEvent.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Security event not found",
        )

    update_data = event_data.model_dump(exclude_unset=True)

    if "asset_id" in update_data:
        asset = (
            db.query(Asset)
            .filter(Asset.id == update_data["asset_id"])
            .first()
        )

        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found",
            )

    for field, value in update_data.items():
        setattr(event, field, value)

    db.flush()

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="update",
        entity_type="security_event",
        entity_id=event.id,
        description=f"Updated security event '{event.event_type}'.",
    )

    db.commit()
    db.refresh(event)

    return event


@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_security_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = (
        db.query(SecurityEvent)
        .filter(SecurityEvent.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Security event not found",
        )

    event_type = event.event_type

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="delete",
        entity_type="security_event",
        entity_id=event.id,
        description=f"Deleted security event '{event_type}'.",
    )

    db.delete(event)
    db.commit()

    return None
