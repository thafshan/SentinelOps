"""Add organization to assets

Revision ID: 3fc36723b298
Revises: cdf44a7ea9c2
Create Date: 2026-09-18

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "3fc36723b298"
down_revision: Union[str, Sequence[str], None] = "cdf44a7ea9c2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "assets",
        sa.Column(
            "organization_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.execute(
        """
        UPDATE assets
        SET organization_id = 2
        WHERE organization_id IS NULL
        """
    )

    op.alter_column(
        "assets",
        "organization_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

    op.create_foreign_key(
        "fk_assets_organization_id",
        "assets",
        "organizations",
        ["organization_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_assets_organization_id",
        "assets",
        type_="foreignkey",
    )

    op.drop_column(
        "assets",
        "organization_id",
    )
