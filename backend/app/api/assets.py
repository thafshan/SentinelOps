from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.asset import Asset
from app.models.user import User
from app.schemas.asset import AssetCreate, AssetResponse, AssetUpdate
from app.services.audit import create_audit_log


router = APIRouter(
    prefix="/assets",
    tags=["Assets"],
)


@router.post(
    "/",
    response_model=AssetResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_asset(
    asset_data: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if asset_data.owner_id is not None:
        owner = (
            db.query(User)
            .filter(
                User.id == asset_data.owner_id,
                User.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not owner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset owner not found in your organization",
            )

    new_asset = Asset(
        **asset_data.model_dump(),
        organization_id=current_user.organization_id,
    )

    db.add(new_asset)
    db.flush()

    create_audit_log(
        db=db,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="create",
        entity_type="asset",
        entity_id=new_asset.id,
        description=f"Created asset '{new_asset.name}'.",
    )

    db.commit()
    db.refresh(new_asset)

    return new_asset


@router.get(
    "/",
    response_model=list[AssetResponse],
)
def get_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assets = (
        db.query(Asset)
        .filter(
            Asset.organization_id == current_user.organization_id
        )
        .order_by(Asset.id.desc())
        .all()
    )

    return assets


@router.get(
    "/{asset_id}",
    response_model=AssetResponse,
)
def get_asset(
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

    return asset


@router.put(
    "/{asset_id}",
    response_model=AssetResponse,
)
def update_asset(
    asset_id: int,
    asset_data: AssetUpdate,
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

    if asset_data.owner_id is not None:
        owner = (
            db.query(User)
            .filter(
                User.id == asset_data.owner_id,
                User.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not owner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset owner not found in your organization",
            )

    update_data = asset_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(asset, field, value)

    db.flush()

    create_audit_log(
        db=db,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="update",
        entity_type="asset",
        entity_id=asset.id,
        description=f"Updated asset '{asset.name}'.",
    )

    db.commit()
    db.refresh(asset)

    return asset


@router.delete(
    "/{asset_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_asset(
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

    asset_name = asset.name

    create_audit_log(
        db=db,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="delete",
        entity_type="asset",
        entity_id=asset.id,
        description=f"Deleted asset '{asset_name}'.",
    )

    db.delete(asset)
    db.commit()

    return None
