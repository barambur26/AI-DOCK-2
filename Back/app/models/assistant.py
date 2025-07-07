# AI Dock Assistant Model
# Database model for user-created custom AI assistants

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, Dict, Any, List
import random
import re

from ..core.database import Base

class Assistant(Base):
    """
    Assistant model - stores custom AI assistants created by users.
    
    Each assistant represents a unique AI persona with its own:
    - Custom system prompt defining behavior and personality
    - Model preferences (temperature, max tokens, etc.)
    - Visual identity (color for UI display)
    - Separate conversation threads
    - Private to the user who created it
    
    Think of assistants like "AI characters" - a Data Analyst assistant,
    a Creative Writer assistant, a Code Reviewer assistant, etc.
    
    Table: assistants
    Purpose: Store user-created custom AI assistants with their configurations
    """
    
    # =============================================================================
    # TABLE CONFIGURATION
    # =============================================================================
    
    __tablename__ = "assistants"
    
    # =============================================================================
    # COLUMNS (DATABASE FIELDS)
    # =============================================================================
    
    # Primary Key - unique identifier for each assistant
    id = Column(
        Integer, 
        primary_key=True, 
        index=True,
        comment="Unique assistant identifier"
    )
    
    # Assistant Identification and Description
    name = Column(
        String(100),                # Keep names concise but descriptive
        nullable=False,             # Every assistant must have a name
        index=True,                 # Index for fast searching
        comment="Human-readable name for the assistant (e.g., 'Data Analyst', 'Creative Writer')"
    )
    
    description = Column(
        String(500),                # Brief description of assistant's purpose
        nullable=True,              # Optional field
        comment="Brief description of what this assistant does and its personality"
    )
    
    # Visual Identity
    color = Column(
        String(7),                  # Hex color code format #RRGGBB
        nullable=True,              # Will be auto-generated if not provided
        comment="Hex color code for visual identification of the assistant (e.g., #3B82F6)"
    )
    
    # Core Assistant Configuration
    system_prompt = Column(
        Text,                       # Use Text for longer content (no character limit)
        nullable=False,             # System prompt is required
        comment="The system prompt that defines this assistant's behavior and personality"
    )
    
    # Model Preferences stored as JSON
    # This allows flexible configuration per assistant
    model_preferences = Column(
        JSON,
        nullable=True,              # Optional - will use defaults if not set
        default={},                 # Empty dict as default
        comment="JSON object storing LLM preferences: temperature, max_tokens, model, etc."
    )
    
    # =============================================================================
    # OWNERSHIP AND ACCESS CONTROL
    # =============================================================================
    
    # Foreign key to User - who owns this assistant?
    user_id = Column(
        Integer,
        ForeignKey('users.id',ondelete="CASCADE"),     # References the 'id' column in 'users' table
        nullable=False,             # Every assistant must have an owner
        index=True,                 # Index for fast user lookups
        comment="Foreign key to the user who created this assistant"
    )
    
    # Status Control
    is_active = Column(
        Boolean,
        default=True,               # New assistants are active by default
        nullable=False,
        index=True,                 # Index for filtering active assistants
        comment="Whether this assistant is active and available for use"
    )
    
    # =============================================================================
    # METADATA AND TRACKING
    # =============================================================================
    
    # Timestamps for tracking creation and updates
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),  # Database sets this automatically
        nullable=False,
        comment="When this assistant was created"
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),        # Update this every time record changes
        nullable=False,
        comment="When this assistant was last updated"
    )
    
    # =============================================================================
    # RELATIONSHIPS (SQLALCHEMY CONNECTIONS TO OTHER TABLES)
    # =============================================================================
    
    # Relationship to User - the owner of this assistant
    user = relationship(
        "User",
        back_populates="assistants",    # User model will have an 'assistants' attribute
        lazy="select"                   # Load user data when needed
    )
    
    # Relationship to Conversations - all conversations using this assistant
    conversations = relationship(
        "Conversation", 
        back_populates="assistant",
        cascade="all, delete-orphan",  # Delete conversations when assistant is deleted
        order_by="Conversation.updated_at.desc()"
    )
    
    # Relationship to ChatConversations - enhanced chat interface support
    chat_conversations = relationship(
        "ChatConversation", 
        back_populates="assistant",
        cascade="all, delete-orphan",  # Delete chat conversations when assistant is deleted
        order_by="ChatConversation.updated_at.desc()"
    )
    
    # Relationship to AssistantFiles - file attachments for this assistant
    assistant_files = relationship(
        "AssistantFile",
        back_populates="assistant",
        cascade="all, delete-orphan",  # Delete file relationships when assistant is deleted
        order_by="AssistantFile.created_at.desc()"
    )
    
    # =============================================================================
    # MODEL METHODS
    # =============================================================================
    
    def __repr__(self) -> str:
        """String representation of the Assistant object."""
        try:
            assistant_id = getattr(self, 'id', '?')
            name = getattr(self, 'name', 'Unknown')
            user_id = getattr(self, 'user_id', '?')
            color = getattr(self, 'color', 'No color')
            return f"<Assistant(id={assistant_id}, name='{name}', color='{color}', user_id={user_id})>"
        except Exception:
            return f"<Assistant(id=?, name='Unknown', color='Unknown', user_id=?)>"
    
    def __str__(self) -> str:
        """Human-friendly string representation."""
        return f"{self.name} (by {self.user.username if self.user else 'Unknown'})"
    
    # =============================================================================
    # PROPERTY METHODS
    # =============================================================================
    
    @property
    def display_name(self) -> str:
        """Get the display name for this assistant."""
        return self.name or f"Assistant #{self.id}"
    
    @property
    def short_description(self) -> str:
        """Get a shortened version of the description for UI display."""
        if not self.description:
            return "No description provided"
        
        if len(self.description) <= 100:
            return self.description
        
        return self.description[:97] + "..."
    
    @property
    def system_prompt_preview(self) -> str:
        """Get a preview of the system prompt for UI display."""
        if not self.system_prompt:
            return "No system prompt defined"
        
        if len(self.system_prompt) <= 150:
            return self.system_prompt
        
        return self.system_prompt[:147] + "..."
    
    @property
    def conversation_count(self) -> int:
        """Get the number of conversations associated with this assistant."""
        return len(self.conversations) if self.conversations else 0
    
    @property
    def is_new(self) -> bool:
        """Check if this assistant was created recently (within last 24 hours)."""
        if not self.created_at:
            return False
        
        from datetime import timedelta
        day_ago = datetime.utcnow() - timedelta(hours=24)
        return self.created_at > day_ago
    
    @property
    def display_color(self) -> str:
        """Get the display color for this assistant, generating one if needed."""
        if self.color:
            return self.color
        
        # Generate a color based on assistant name/id for consistency
        return generate_assistant_color(self.name or str(self.id))
    
    @property
    def file_count(self) -> int:
        """Get the number of files attached to this assistant."""
        return len(self.assistant_files) if self.assistant_files else 0
    
    @property
    def has_files(self) -> bool:
        """Check if this assistant has any attached files."""
        return self.file_count > 0
    
    @property
    def attached_files(self) -> List[Any]:
        """Get list of file objects attached to this assistant."""
        return [af.file for af in self.assistant_files] if self.assistant_files else []
    
    @property
    def attached_file_ids(self) -> List[int]:
        """Get list of file IDs attached to this assistant."""
        return [af.file_id for af in self.assistant_files] if self.assistant_files else []
    
    # =============================================================================
    # COLOR MANAGEMENT METHODS
    # =============================================================================
    
    def set_random_color(self) -> None:
        """Set a random color from the predefined palette."""
        self.color = get_random_assistant_color()
        self.updated_at = datetime.utcnow()
    
    def set_color(self, color: str) -> bool:
        """
        Set a specific color if valid.
        
        Args:
            color: Hex color code (e.g., "#3B82F6")
            
        Returns:
            True if color was set, False if invalid
        """
        if self._is_valid_color(color):
            self.color = color
            self.updated_at = datetime.utcnow()
            return True
        return False
    
    def _is_valid_color(self, color: str) -> bool:
        """Check if color is a valid hex code."""
        if not isinstance(color, str):
            return False
        
        hex_pattern = r'^#[0-9A-Fa-f]{6}$'
        return bool(re.match(hex_pattern, color))
    
    # =============================================================================
    # VALIDATION METHODS
    # =============================================================================
    
    def validate_name(self) -> bool:
        """Validate assistant name format."""
        if not self.name:
            return False
        
        name = self.name.strip()
        return 1 <= len(name) <= 100
    
    def validate_system_prompt(self) -> bool:
        """Validate system prompt content."""
        if not self.system_prompt:
            return False
        
        prompt = self.system_prompt.strip()
        return len(prompt) > 0
    
    def validate_model_preferences(self) -> bool:
        """Validate model preferences structure."""
        if self.model_preferences is None:
            return True
        
        if not isinstance(self.model_preferences, dict):
            return False
        
        preferences = self.model_preferences
        
        # Validate temperature
        if 'temperature' in preferences:
            temp = preferences['temperature']
            if not isinstance(temp, (int, float)) or not 0 <= temp <= 2:
                return False
        
        # Validate max_tokens
        if 'max_tokens' in preferences:
            tokens = preferences['max_tokens']
            if not isinstance(tokens, int) or tokens <= 0:
                return False
        
        return True
    
    def validate_color(self) -> bool:
        """Validate color format (hex code)."""
        if self.color is None:
            return True  # Null is allowed - will be auto-generated
        
        return self._is_valid_color(self.color)
    
    def is_valid(self) -> bool:
        """Check if the assistant data is valid overall."""
        return (
            self.validate_name() and
            self.validate_system_prompt() and
            self.validate_model_preferences() and
            self.validate_color()
        )
    
    def get_effective_model_preferences(self) -> Dict[str, Any]:
        """Get the effective model preferences, with defaults for missing values."""
        # Start with default preferences
        defaults = {
            "temperature": 0.7,
            "max_tokens": 2048,
            "model": None  # Will use LLM config's default model
        }
        
        # Override with assistant's custom preferences
        if self.model_preferences:
            defaults.update(self.model_preferences)
        
        return defaults
    
    # =============================================================================
    # SERIALIZATION METHODS
    # =============================================================================
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Convert assistant to dictionary for API responses."""
        base_dict = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "color": self.display_color,  # Always include color (auto-generated if needed)
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "conversation_count": self.conversation_count,
            "file_count": self.file_count,
            "has_files": self.has_files,
            "user_id": self.user_id
        }
        
        # Include sensitive data only if requested
        if include_sensitive:
            base_dict.update({
                "system_prompt": self.system_prompt,
                "model_preferences": self.model_preferences or {}
            })
        else:
            # Provide safe previews for public API
            base_dict.update({
                "system_prompt_preview": self.system_prompt_preview,
                "has_custom_preferences": bool(self.model_preferences)
            })
        
        return base_dict


# =============================================================================
# COLOR UTILITY FUNCTIONS
# =============================================================================

# Predefined color palette for assistants - professional colors that work well in UI
ASSISTANT_COLOR_PALETTE = [
    "#3B82F6",  # Blue
    "#EF4444",  # Red
    "#10B981",  # Green
    "#F59E0B",  # Yellow
    "#8B5CF6",  # Purple
    "#06B6D4",  # Cyan
    "#F97316",  # Orange
    "#84CC16",  # Lime
    "#EC4899",  # Pink
    "#6366F1",  # Indigo
    "#14B8A6",  # Teal
    "#F43F5E",  # Rose
    "#A855F7",  # Violet
    "#22C55E",  # Green-500
    "#0EA5E9",  # Sky
    "#DC2626",  # Red-600
    "#7C3AED",  # Violet-600
    "#059669",  # Emerald-600
    "#D97706",  # Amber-600
    "#DB2777"   # Pink-600
]

def get_random_assistant_color() -> str:
    """Get a random color from the predefined palette."""
    return random.choice(ASSISTANT_COLOR_PALETTE)

def generate_assistant_color(seed: str) -> str:
    """
    Generate a consistent color based on a seed string.
    Same seed will always return the same color.
    
    Args:
        seed: String to use as seed (e.g., assistant name)
        
    Returns:
        Hex color code from the predefined palette
    """
    # Use hash of seed to pick color consistently
    hash_value = hash(seed) % len(ASSISTANT_COLOR_PALETTE)
    return ASSISTANT_COLOR_PALETTE[hash_value]

def is_valid_assistant_color(color: str) -> bool:
    """Check if a color is valid for assistants."""
    if not isinstance(color, str):
        return False
    
    hex_pattern = r'^#[0-9A-Fa-f]{6}$'
    return bool(re.match(hex_pattern, color))


# =============================================================================
# MODEL INDEXES FOR PERFORMANCE
# =============================================================================

# Index for finding user's assistants
Index('idx_assistant_user_active', Assistant.user_id, Assistant.is_active)

# Index for searching assistants by name
Index('idx_assistant_name_active', Assistant.name, Assistant.is_active)

# Index for ordering by creation time
Index('idx_assistant_created', Assistant.created_at.desc())


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def create_default_assistant(user_id: int, name: str = "General Assistant") -> Assistant:
    """Create a default assistant for a new user."""
    return Assistant(
        name=name,
        description="A helpful AI assistant for general tasks and questions.",
        system_prompt="You are a helpful, knowledgeable, and friendly AI assistant. Provide clear, accurate, and useful responses to help users with their questions and tasks.",
        color=get_random_assistant_color(),  # Assign random color
        model_preferences={
            "temperature": 0.7,
            "max_tokens": 2048,
            "model": "gpt-3.5-turbo"
        },
        user_id=user_id,
        is_active=True
    )

def create_sample_assistants(user_id: int) -> List[Assistant]:
    """Create a set of sample assistants with predefined colors."""
    assistants = []
    
    # Data Analyst Assistant
    assistants.append(Assistant(
        name="Data Analyst",
        description="Specialized in data analysis, statistics, and creating insights from datasets.",
        system_prompt="You are a skilled data analyst. Help users analyze data, create visualizations, interpret statistics, and draw meaningful insights. Always ask clarifying questions about the data context and goals.",
        color="#3B82F6",  # Blue for analytical thinking
        model_preferences={
            "temperature": 0.3,
            "max_tokens": 3000,
            "model": "gpt-4"
        },
        user_id=user_id,
        is_active=True
    ))
    
    # Creative Writer Assistant
    assistants.append(Assistant(
        name="Creative Writer",
        description="Helps with creative writing, storytelling, and content creation.",
        system_prompt="You are a creative writing assistant. Help users with storytelling, character development, plot ideas, and creative content. Be imaginative, inspiring, and supportive of creative expression.",
        color="#8B5CF6",  # Purple for creativity
        model_preferences={
            "temperature": 0.9,
            "max_tokens": 4000,
            "model": "gpt-4"
        },
        user_id=user_id,
        is_active=True
    ))
    
    # Code Reviewer Assistant
    assistants.append(Assistant(
        name="Code Reviewer",
        description="Focuses on code review, debugging, and programming best practices.",
        system_prompt="You are an experienced software engineer specializing in code review. Help users improve their code quality, find bugs, suggest optimizations, and follow best practices. Always explain your reasoning and provide examples.",
        color="#10B981",  # Green for code/success
        model_preferences={
            "temperature": 0.4,
            "max_tokens": 3000,
            "model": "gpt-4"
        },
        user_id=user_id,
        is_active=True
    ))
    
    return assistants
