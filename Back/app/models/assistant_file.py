# AI Dock Assistant File Relationship Model
# Database model for linking assistants to files

from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from ..core.database import Base

class AssistantFile(Base):
    """
    AssistantFile model - represents the many-to-many relationship between assistants and files.
    
    This model enables assistants to have persistent file attachments that are automatically
    included in any conversation using that assistant.
    
    Table: assistant_files
    Purpose: Link assistants to uploaded files for persistent file context
    """
    
    # =============================================================================
    # TABLE CONFIGURATION
    # =============================================================================
    
    __tablename__ = "assistant_files"
    
    # =============================================================================
    # COLUMNS (DATABASE FIELDS)
    # =============================================================================
    
    # Primary key
    id = Column(
        Integer, 
        primary_key=True, 
        index=True,
        comment="Unique relationship identifier"
    )
    
    # Foreign keys
    assistant_id = Column(
        Integer,
        ForeignKey('assistants.id', ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key to the assistant"
    )
    
    file_id = Column(
        Integer,
        ForeignKey('file_uploads.id', ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key to the uploaded file"
    )
    
    created_by = Column(
        Integer,
        ForeignKey('users.id', ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="User who attached this file to the assistant"
    )
    
    # Metadata
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="When the file was attached to the assistant"
    )
    
    # =============================================================================
    # RELATIONSHIPS
    # =============================================================================
    
    # Relationship to Assistant
    assistant = relationship(
        "Assistant",
        back_populates="assistant_files",
        lazy="select"
    )
    
    # Relationship to FileUpload
    file = relationship(
        "FileUpload",
        lazy="select"
    )
    
    # Relationship to User (who attached the file)
    user = relationship(
        "User",
        lazy="select"
    )
    
    # =============================================================================
    # TABLE CONSTRAINTS
    # =============================================================================
    
    __table_args__ = (
        # Ensure no duplicate file attachments per assistant
        UniqueConstraint('assistant_id', 'file_id', name='uk_assistant_files_unique'),
        
        # Indexes for performance
        Index('idx_assistant_files_assistant_id', 'assistant_id'),
        Index('idx_assistant_files_file_id', 'file_id'),
        Index('idx_assistant_files_created_at', 'created_at'),
    )
    
    # =============================================================================
    # MODEL METHODS
    # =============================================================================
    
    def __repr__(self) -> str:
        """String representation for debugging."""
        return f"<AssistantFile(assistant_id={self.assistant_id}, file_id={self.file_id})>"
    
    def __str__(self) -> str:
        """Human-friendly string representation."""
        if self.assistant and self.file:
            return f"{self.assistant.name} -> {self.file.original_filename}"
        return f"Assistant {self.assistant_id} -> File {self.file_id}"
