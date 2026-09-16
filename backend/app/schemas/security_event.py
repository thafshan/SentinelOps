from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SecurityEventBase(BaseModel):
    asset_id: int
    event_type: str
    severity: str = "medium"
    source_ip: str | None = None
    message: str
    status: str = "new"
    detected_at: datetime | None = None
    resolved_at: datetime | None = None


class SecurityEventCreate(SecurityEventBase):
    pass


class SecurityEventUpdate(BaseModel):
    asset_id: int | None = None
    event_type: str | None = None
    severity: str | None = None
    source_ip: str | None = None
    message: str | None = None
    status: str | None = None
    detected_at: datetime | None = None
    resolved_at: datetime | None = None


class SecurityEventResponse(SecurityEventBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)