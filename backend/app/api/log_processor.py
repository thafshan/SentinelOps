from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.security_event import SecurityEventResponse
from app.services.log_processor import process_security_log


router = APIRouter(
    prefix="/security-events",
    tags=["Security Log Processing"],
)


class SecurityLogProcessRequest(BaseModel):
    asset_id: int
    log_line: str


class SecurityLogProcessResponse(BaseModel):
    message: str
    event: SecurityEventResponse


@router.post(
    "/process",
    response_model=SecurityLogProcessResponse,
    status_code=status.HTTP_201_CREATED,
)
def process_log(
    log_data: SecurityLogProcessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        security_event = process_security_log(
            db=db,
            asset_id=log_data.asset_id,
            log_line=log_data.log_line,
            user_id=current_user.id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return {
        "message": "Security log processed successfully",
        "event": security_event,
    }