from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)

    hostname: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )

    asset_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    operating_system: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    environment: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="development",
    )

    criticality: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="medium",
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="active",
    )

    owner_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    owner = relationship("User", backref="assets")
