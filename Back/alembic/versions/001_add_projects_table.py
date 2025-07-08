"""Add projects table and project_conversations association table

Revision ID: 001_add_projects
Revises: 
Create Date: 2025-07-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '001_add_projects'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create projects table
    op.create_table('projects',
    sa.Column('id', sa.Integer(), nullable=False, comment='Unique project identifier'),
    sa.Column('name', sa.String(length=100), nullable=False, comment='Human-readable name for the project (e.g., \'Research Assistant\', \'Code Review\')'),
    sa.Column('description', sa.String(length=500), nullable=True, comment='Brief description of what this project is for and its purpose'),
    sa.Column('system_prompt', sa.Text(), nullable=True, comment='The system prompt that defines this project\'s context and behavior'),
    sa.Column('model_preferences', sa.JSON(), nullable=True, comment='JSON object storing LLM preferences: temperature, max_tokens, model, etc.'),
    sa.Column('color', sa.String(length=20), nullable=True, comment='Color for the project in the UI'),
    sa.Column('icon', sa.String(length=50), nullable=True, comment='Icon or emoji representing the project'),
    sa.Column('user_id', sa.Integer(), nullable=False, comment='Foreign key to the user who created this project'),
    sa.Column('is_active', sa.Boolean(), nullable=False, comment='Whether this project is active and available for use'),
    sa.Column('is_archived', sa.Boolean(), nullable=False, comment='Whether this project is archived (hidden from main view)'),
    sa.Column('is_favorited', sa.Boolean(), nullable=False, comment='Whether this project is marked as a favorite'),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False, comment='When this project was created'),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False, comment='When this project was last updated'),
    sa.Column('last_accessed_at', sa.DateTime(timezone=True), nullable=True, comment='When this project was last accessed/used'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for projects table
    op.create_index('idx_project_user_active', 'projects', ['user_id', 'is_active'], unique=False)
    op.create_index('idx_project_name_active', 'projects', ['name', 'is_active'], unique=False)
    op.create_index('idx_project_created', 'projects', [sa.text('created_at DESC')], unique=False)
    op.create_index('idx_project_last_accessed', 'projects', [sa.text('last_accessed_at DESC')], unique=False)
    op.create_index('idx_project_archived', 'projects', ['user_id', 'is_archived'], unique=False)
    op.create_index('idx_project_favorited', 'projects', ['user_id', 'is_favorited'], unique=False)
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)
    op.create_index(op.f('ix_projects_is_active'), 'projects', ['is_active'], unique=False)
    op.create_index(op.f('ix_projects_is_archived'), 'projects', ['is_archived'], unique=False)
    op.create_index(op.f('ix_projects_name'), 'projects', ['name'], unique=False)
    op.create_index(op.f('ix_projects_user_id'), 'projects', ['user_id'], unique=False)
    
    # Create project_conversations association table
    op.create_table('project_conversations',
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.Column('conversation_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('project_id', 'conversation_id')
    )


def downgrade() -> None:
    # Drop project_conversations association table
    op.drop_table('project_conversations')
    
    # Drop projects table indexes
    op.drop_index(op.f('ix_projects_user_id'), table_name='projects')
    op.drop_index(op.f('ix_projects_name'), table_name='projects')
    op.drop_index(op.f('ix_projects_is_archived'), table_name='projects')
    op.drop_index(op.f('ix_projects_is_active'), table_name='projects')
    op.drop_index(op.f('ix_projects_id'), table_name='projects')
    op.drop_index('idx_project_favorited', table_name='projects')
    op.drop_index('idx_project_archived', table_name='projects')
    op.drop_index('idx_project_last_accessed', table_name='projects')
    op.drop_index('idx_project_created', table_name='projects')
    op.drop_index('idx_project_name_active', table_name='projects')
    op.drop_index('idx_project_user_active', table_name='projects')
    
    # Drop projects table
    op.drop_table('projects')