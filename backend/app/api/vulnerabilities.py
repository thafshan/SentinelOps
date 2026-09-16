from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.asset import Asset
from app.models.user import User
from app.models.vulnerability import Vulnerability
from app.schemas.vulnerability import (
    VulnerabilityCreate,
    VulnerabilityResponse,
    VulnerabilityUpdate,
)
from app.services.audit import create_audit_log


router = APIRouter(
    prefix="/vulnerabilities",
    tags=["Vulnerabilities"],
)


@router.post(
    "/",
    response_model=VulnerabilityResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_vulnerability(
    vulnerability_data: VulnerabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = (
        db.query(Asset)
        .filter(Asset.id == vulnerability_data.asset_id)
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    vulnerability = Vulnerability(
        **vulnerability_data.model_dump(exclude_none=True)
    )

    db.add(vulnerability)
    db.flush()

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="create",
        entity_type="vulnerability",
        entity_id=vulnerability.id,
        description=f"Created vulnerability '{vulnerability.title}'.",
    )

    db.commit()
    db.refresh(vulnerability)

    return vulnerability


@router.get(
    "/",
    response_model=list[VulnerabilityResponse],
)
def get_vulnerabilities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vulnerabilities = (
        db.query(Vulnerability)
        .order_by(Vulnerability.id.desc())
        .all()
    )

    return vulnerabilities


@router.get(
    "/{vulnerability_id}",
    response_model=VulnerabilityResponse,
)
def get_vulnerability(
    vulnerability_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vulnerability = (
        db.query(Vulnerability)
        .filter(Vulnerability.id == vulnerability_id)
        .first()
    )

    if not vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found",
        )

    return vulnerability


@router.put(
    "/{vulnerability_id}",
    response_model=VulnerabilityResponse,
)
def update_vulnerability(
    vulnerability_id: int,
    vulnerability_data: VulnerabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vulnerability = (
        db.query(Vulnerability)
        .filter(Vulnerability.id == vulnerability_id)
        .first()
    )

    if not vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found",
        )

    update_data = vulnerability_data.model_dump(exclude_unset=True)

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
        setattr(vulnerability, field, value)

    db.flush()

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="update",
        entity_type="vulnerability",
        entity_id=vulnerability.id,
        description=f"Updated vulnerability '{vulnerability.title}'.",
    )

    db.commit()
    db.refresh(vulnerability)

    return vulnerability


@router.delete(
    "/{vulnerability_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_vulnerability(
    vulnerability_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vulnerability = (
        db.query(Vulnerability)
        .filter(Vulnerability.id == vulnerability_id)
        .first()
    )

    if not vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found",
        )

    vulnerability_title = vulnerability.title

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="delete",
        entity_type="vulnerability",
        entity_id=vulnerability.id,
        description=f"Deleted vulnerability '{vulnerability_title}'.",
    )

    db.delete(vulnerability)
    db.commit()

    return None
