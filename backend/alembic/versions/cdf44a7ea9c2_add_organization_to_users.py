"""Add organization to users

Revision ID: cdf44a7ea9c2
Revises: df6d82a8d8c5
Create Date: 2026-09-18 14:39:16.871048

"""

from datetime import datetime, timezone
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "cdf44a7ea9c2"
down_revision: Union[str, Sequence[str], None] = "df6d82a8d8c5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Add the column temporarily as nullable so existing users
    # can be assigned to an organization.
    op.add_column(
        "users",
        sa.Column(
            "organization_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    # Create a default organization for existing users.
    organizations_table = sa.table(
        "organizations",
        sa.column("id", sa.Integer()),
        sa.column("name", sa.String()),
        sa.column("created_at", sa.DateTime(timezone=True)),
        sa.column("updated_at", sa.DateTime(timezone=True)),
    )

    now = datetime.now(timezone.utc)

    op.execute(
        organizations_table.insert().values(
            name="SentinelOps Demo Organization",
            created_at=now,
            updated_at=now,
        )
    )

    # Assign all existing users to the newly created organization.
    op.execute(
        """
        UPDATE users
        SET organization_id = (
            SELECT id
            FROM organizations
            WHERE name = 'SentinelOps Demo Organization'
            ORDER BY id
            LIMIT 1
        )
        WHERE organization_id IS NULL
        """
    )

    # organization_id is now populated for all existing users,
    # so it can safely become required.
    op.alter_column(
        "users",
        "organization_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

    # Create the foreign key relationship.
    op.create_foreign_key(
        "fk_users_organization_id",
        "users",
        "organizations",
        ["organization_id"],
        ["id"],
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "fk_users_organization_id",
        "users",
        type_="foreignkey",
    )

    op.drop_column(
        "users",
        "organization_id",
    )

    # Remove the organization created specifically by this migration.
    op.execute(
        """
        DELETE FROM organizations
        WHERE name = 'SentinelOps Demo Organization'
        """
    )

