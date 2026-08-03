"""create activities table

Revision ID: 0007
Revises: 0006
Create Date: 2026-08-03
"""

from alembic import op
import sqlalchemy as sa

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "activities",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("lead_id", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("note", sa.String(), nullable=True),
        sa.Column("performed_by", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("activities")
