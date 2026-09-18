"""Add organization to audit logs

Revision ID: 203771b46922
Revises: a5ee47264d6a
Create Date: 2026-09-18
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "203771b46922"
down_revision: Union[str, Sequence[str], None] = "3fc36723b298"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the column temporarily as nullable so existing
    # audit records can be backfilled safely.
    op.add_column(
        "audit_logs",
        sa.Column(
            "organization_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    # Populate organization_id from the audit record's user.
    op.execute(
        """
        UPDATE audit_logs
        SET organization_id = users.organization_id
        FROM users
        WHERE audit_logs.user_id = users.id
        """
    )

    # Any audit record without a user cannot be mapped through
    # user_id. At this stage all existing records should have
    # a user_id, so fail clearly if any remain unmapped.
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM audit_logs
                WHERE organization_id IS NULL
            ) THEN
                RAISE EXCEPTION
                    'Unable to determine organization for existing audit log records';
            END IF;
        END
        $$;
        """
    )

    # Organization is now mandatory.
    op.alter_column(
        "audit_logs",
        "organization_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

    # Add the foreign key constraint.
    op.create_foreign_key(
        "fk_audit_logs_organization_id",
        "audit_logs",
        "organizations",
        ["organization_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_audit_logs_organization_id",
        "audit_logs",
        type_="foreignkey",
    )

    op.drop_column(
        "audit_logs",
        "organization_id",
    )

