from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.asset import Asset
from app.models.user import User
from app.services.risk import (
    calculate_asset_risk,
    calculate_risk_overview,
)


router = APIRouter(
    prefix="/risk",
    tags=["Risk Intelligence"],
)


@router.get("/assets/{asset_id}")
def get_asset_risk(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = (
        db.query(Asset)
        .filter(
            Asset.id == asset_id,
            Asset.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    return calculate_asset_risk(
        db=db,
        asset_id=asset_id,
        organization_id=current_user.organization_id,
    )


@router.get("/overview")
def get_risk_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return calculate_risk_overview(
        db=db,
        organization_id=current_user.organization_id,
    )

