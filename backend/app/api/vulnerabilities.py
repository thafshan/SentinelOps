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
        .filter(
            Asset.id == vulnerability_data.asset_id,
            Asset.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found in your organization",
        )

    new_vulnerability = Vulnerability(
        **vulnerability_data.model_dump()
    )

    db.add(new_vulnerability)
    db.flush()

    create_audit_log(
        db=db,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="create",
        entity_type="vulnerability",
        entity_id=new_vulnerability.id,
        description=(
            f"Created vulnerability '{new_vulnerability.title}' "
            f"for asset '{asset.name}'."
        ),
    )

    db.commit()
    db.refresh(new_vulnerability)

    return new_vulnerability


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
        .join(Asset, Vulnerability.asset_id == Asset.id)
        .filter(
            Asset.organization_id == current_user.organization_id
        )
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
        .join(Asset, Vulnerability.asset_id == Asset.id)
        .filter(
            Vulnerability.id == vulnerability_id,
            Asset.organization_id == current_user.organization_id,
        )
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
        .join(Asset, Vulnerability.asset_id == Asset.id)
        .filter(
            Vulnerability.id == vulnerability_id,
            Asset.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found",
        )

    update_data = vulnerability_data.model_dump(
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

    for field, value in update_data.items():
        setattr(vulnerability, field, value)

    db.flush()

    create_audit_log(
        db=db,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="update",
        entity_type="vulnerability",
        entity_id=vulnerability.id,
        description=(
            f"Updated vulnerability '{vulnerability.title}'."
        ),
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
        .join(Asset, Vulnerability.asset_id == Asset.id)
        .filter(
            Vulnerability.id == vulnerability_id,
            Asset.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found",
        )

    vulnerability_title = vulnerability.title
    vulnerability_id_value = vulnerability.id

    create_audit_log(
        db=db,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="delete",
        entity_type="vulnerability",
        entity_id=vulnerability_id_value,
        description=(
            f"Deleted vulnerability '{vulnerability_title}'."
        ),
    )

    db.delete(vulnerability)
    db.commit()

    return None
