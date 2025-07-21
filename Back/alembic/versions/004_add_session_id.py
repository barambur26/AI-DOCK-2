"""Add session_id to conversations table

Revision ID: 004_add_session_id
Revises: 003_add_request_prompt
Create Date: 2025-07-21 20:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '004_add_session_id'
down_revision = '003_add_request_prompt'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add session_id column to conversations table"""
    # Add session_id column (nullable for backward compatibility)
    op.add_column('conversations', sa.Column('session_id', sa.String(length=100), nullable=True, comment='Session ID to link conversation to usage logs for admin analytics'))
    
    # Add index for performance (matching the model definition)
    op.create_index('ix_conversations_session_id', 'conversations', ['session_id'])


def downgrade() -> None:
    """Remove session_id column and index from conversations table"""
    # Drop index first
    op.drop_index('ix_conversations_session_id', table_name='conversations')
    
    # Drop column
    op.drop_column('conversations', 'session_id')
