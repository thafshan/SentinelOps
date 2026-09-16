from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AssetBase(BaseModel):
    name: str
    hostname: str | None = None
    ip_address: str | None = None
    asset_type: str
    operating_system: str | None = None
    environment: str = "development"
    criticality: str = "medium"
    status: str = "active"
    owner_id: int | None = None
    description: str | None = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    name: str | None = None
    hostname: str | None = None
    ip_address: str | None = None
    asset_type: str | None = None
    operating_system: str | None = None
    environment: str | None = None
    criticality: str | None = None
    status: str | None = None
    owner_id: int | None = None
    description: str | None = None


class AssetResponse(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)