from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.asset import Asset
from app.models.incident import Incident
from app.models.security_event import SecurityEvent
from app.models.user import User
from app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentUpdate,
)
from app.services.audit import create_audit_log


router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"],
)


@router.post(
    "/",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = (
        db.query(Asset)
        .filter(
            Asset.id == incident_data.asset_id,
            Asset.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found in your organization",
        )

    if incident_data.event_id is not None:
        event = (
            db.query(SecurityEvent)
            .join(Asset, SecurityEvent.asset_id == Asset.id)
            .filter(
                SecurityEvent.id == incident_data.event_id,
                Asset.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Security event not found in your organization",
            )

    if incident_data.assigned_to is not None:
        assigned_user = (
            db.query(User)
            .filter(
                User.id == incident_data.assigned_to,
                User.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not assigned_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found in your organization",
            )

    new_incident = Incident(
        **incident_data.model_dump()
    )

    db.add(new_incident)
    db.flush()

    create_audit_log(
        db=db,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="create",
        entity_type="incident",
        entity_id=new_incident.id,
        description=(
            f"Created incident '{new_incident.title}' "
            f"for asset '{asset.name}'."
        ),
    )

    db.commit()
    db.refresh(new_incident)

    return new_incident


@router.get(
    "/",
    response_model=list[IncidentResponse],
)
def get_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incidents = (
        db.query(Incident)
        .join(Asset, Incident.asset_id == Asset.id)
        .filter(
            Asset.organization_id == current_user.organization_id
        )
        .order_by(Incident.id.desc())
        .all()
    )

    return incidents


@router.get(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = (
        db.query(Incident)
        .join(Asset, Incident.asset_id == Asset.id)
        .filter(
            Incident.id == incident_id,
            Asset.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return incident


@router.put(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def update_incident(
    incident_id: int,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = (
        db.query(Incident)
        .join(Asset, Incident.asset_id == Asset.id)
        .filter(
            Incident.id == incident_id,
            Asset.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    update_data = incident_data.model_dump(
        exclude_unset=True
    )

    if "asset_id" in update_data:
        asset = (
            db.query(Asset)
            .filter(
                Asset.id == update_data["asset_id"],
                Asset.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target asset not found in your organization",
            )

    if "event_id" in update_data and update_data["event_id"] is not None:
        event = (
            db.query(SecurityEvent)
            .join(Asset, SecurityEvent.asset_id == Asset.id)
            .filter(
                SecurityEvent.id == update_data["event_id"],
                Asset.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target security event not found in your organization",
            )

    if "assigned_to" in update_data and update_data["assigned_to"] is not None:
        assigned_user = (
            db.query(User)
            .filter(
                User.id == update_data["assigned_to"],
                User.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not assigned_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found in your organization",
            )

    for field, value in update_data.items():
        setattr(incident, field, value)

    db.flush()

    create_audit_log(
        db=db,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="update",
        entity_type="incident",
        entity_id=incident.id,
        description=(
            f"Updated incident '{incident.title}'."
        ),
    )

    db.commit()
    db.refresh(incident)

    return incident


@router.delete(
    "/{incident_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = (
        db.query(Incident)
        .join(Asset, Incident.asset_id == Asset.id)
        .filter(
            Incident.id == incident_id,
            Asset.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    incident_title = incident.title
    incident_id_value = incident.id

    create_audit_log(
        db=db,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="delete",
        entity_type="incident",
        entity_id=incident_id_value,
        description=(
            f"Deleted incident '{incident_title}'."
        ),
    )

    db.delete(incident)
    db.commit()

    return None
