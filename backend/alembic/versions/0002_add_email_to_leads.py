"""add email to leads

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-01
"""

from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("leads", sa.Column("email", sa.String(), nullable=True))


def downgrade():
    op.drop_column("leads", "email")
