"""Add color column to assistants table

Revision ID: 002_add_assistant_colors
Revises: 001_add_projects
Create Date: 2025-07-03 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '002_add_assistant_colors'
down_revision = '001_add_projects'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add color column to assistants table
    op.add_column('assistants', 
        sa.Column('color', 
                  sa.String(length=7), 
                  nullable=True, 
                  comment='Hex color code for assistant personalization (e.g., #FF5733)')
    )
    
    # Create index for color-based queries (for future sorting/filtering)
    op.create_index('idx_assistant_color', 'assistants', ['color'], unique=False)
    
    # Update existing assistants with default colors from predefined palette
    # This ensures backward compatibility and provides good default colors
    connection = op.get_bind()
    
    # Predefined color palette (same as backend)
    default_colors = [
        '#3B82F6',  # Blue
        '#10B981',  # Emerald  
        '#8B5CF6',  # Violet
        '#F59E0B',  # Amber
        '#EF4444',  # Red
        '#06B6D4',  # Cyan
        '#84CC16',  # Lime
        '#F97316',  # Orange
        '#EC4899',  # Pink
        '#6366F1',  # Indigo
        '#14B8A6',  # Teal
        '#A855F7',  # Purple
        '#FBBF24',  # Yellow
        '#F87171',  # Red Light
        '#60A5FA',  # Blue Light
        '#34D399',  # Emerald Light
        '#A78BFA',  # Violet Light
        '#FBBF24',  # Amber Light
        '#FB7185',  # Rose
        '#38BDF8'   # Sky
    ]
    
    # Assign colors to existing assistants in a round-robin fashion
    existing_assistants = connection.execute(
        sa.text("SELECT id FROM assistants ORDER BY id")
    ).fetchall()
    
    for i, assistant in enumerate(existing_assistants):
        color = default_colors[i % len(default_colors)]
        connection.execute(
            sa.text("UPDATE assistants SET color = :color WHERE id = :id"),
            {"color": color, "id": assistant.id}
        )


def downgrade() -> None:
    # Drop color index
    op.drop_index('idx_assistant_color', table_name='assistants')
    
    # Remove color column from assistants table
    op.drop_column('assistants', 'color')
