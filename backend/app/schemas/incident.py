from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IncidentBase(BaseModel):
    title: str
    description: str | None = None
    severity: str = "medium"
    status: str = "open"
    priority: str = "medium"
    asset_id: int
    event_id: int | None = None
    assigned_to: int | None = None
    detected_at: datetime | None = None
    resolved_at: datetime | None = None


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    severity: str | None = None
    status: str | None = None
    priority: str | None = None
    asset_id: int | None = None
    event_id: int | None = None
    assigned_to: int | None = None
    detected_at: datetime | None = None
    resolved_at: datetime | None = None


class IncidentResponse(IncidentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)