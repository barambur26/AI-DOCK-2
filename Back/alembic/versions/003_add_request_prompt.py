"""Add request_prompt to usage_logs table

Revision ID: 003_add_request_prompt
Revises: 002_add_assistant_colors
Create Date: 2025-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003_add_request_prompt'
down_revision = '002_add_assistant_colors'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add request_prompt column to usage_logs table"""
    op.add_column('usage_logs', sa.Column('request_prompt', sa.Text(), nullable=True))


def downgrade() -> None:
    """Remove request_prompt column from usage_logs table"""
    op.drop_column('usage_logs', 'request_prompt')
