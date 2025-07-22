# AI Dock Conversation Models
# Database models for conversation save/load functionality

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Index, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, List, Dict, Any

from ..core.database import Base
from .project import project_conversations

class Conversation(Base):
    """
    Conversation model - stores chat conversation metadata
    Each conversation contains multiple messages and belongs to one user
    """
    __tablename__ = "conversations"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Assistant Integration - NEW for Custom Assistants feature
    # Links conversation to a specific custom assistant (optional)
    assistant_id = Column(
        Integer, 
        ForeignKey("assistants.id"), 
        nullable=True,  # Can be null for conversations without custom assistants
        index=True,     # Index for fast assistant-based queries
        comment="Optional: ID of the custom assistant used in this conversation"
    )
    
    # Conversation metadata
    title = Column(String(255), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Session tracking - NEW for linking conversations to usage logs
    session_id = Column(
        String(100), 
        nullable=True,  # Nullable for backward compatibility with existing conversations
        index=True,     # Index for fast session-based queries
        comment="Session ID to link conversation to usage logs for admin analytics"
    )
    
    # Conversation status - NEW for better conversation management
    is_active = Column(
        Boolean, 
        default=True, 
        nullable=False,
        comment="Whether this conversation is active (not deleted/archived)"
    )
    
    # Conversation stats (denormalized for performance)
    message_count = Column(Integer, default=0, nullable=False)
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    
    # LLM configuration used (for context)
    llm_config_id = Column(Integer, ForeignKey("llm_configurations.id"), nullable=True)
    model_used = Column(String(100), nullable=True)  # Last model used
    
    # Relationships
    user = relationship("User", back_populates="conversations")
    assistant = relationship("Assistant", back_populates="conversations")  # NEW: Link to custom assistant
    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ConversationMessage.created_at")
    llm_config = relationship("LLMConfiguration")
    
    # Many-to-many relationship to Projects
    projects = relationship(
        "Project",
        secondary=project_conversations,
        back_populates="conversations",
        lazy="select"
    )
    
    def __repr__(self) -> str:
        try:
            # Safely access attributes that might not be loaded
            conv_id = getattr(self, 'id', '?')
            title = getattr(self, 'title', 'Unknown')
            message_count = getattr(self, 'message_count', 0)
            return f"<Conversation(id={conv_id}, title='{title}', messages={message_count})>"
        except Exception:
            # Fallback if any attribute access fails
            return f"<Conversation(id=?, title='Unknown', messages=0)>"
    
    def update_stats(self):
        """Update denormalized stats"""
        self.message_count = len(self.messages)
        if self.messages:
            self.last_message_at = max(msg.created_at for msg in self.messages)
        self.updated_at = datetime.utcnow()
    
    # =============================================================================
    # ASSISTANT-RELATED METHODS - NEW for Custom Assistants feature
    # =============================================================================
    
    def set_assistant(self, assistant_id: Optional[int]) -> None:
        """
        Associate this conversation with a custom assistant.
        
        Args:
            assistant_id: ID of the assistant to use (None to remove association)
        """
        self.assistant_id = assistant_id
        self.updated_at = datetime.utcnow()
    
    def get_system_prompt(self) -> Optional[str]:
        """
        Get the system prompt for this conversation.
        Returns the assistant's system prompt if available, None otherwise.
        
        Returns:
            System prompt string or None if no assistant is associated
        """
        if self.assistant and self.assistant.system_prompt:
            return self.assistant.system_prompt
        return None
    
    def get_model_preferences(self) -> Dict[str, Any]:
        """
        Get LLM model preferences for this conversation.
        Uses assistant preferences if available, otherwise returns defaults.
        
        Returns:
            Dictionary of model preferences
        """
        if self.assistant:
            return self.assistant.get_effective_model_preferences()
        
        # Default preferences when no assistant is specified
        return {
            "model": "gpt-3.5-turbo",
            "temperature": 0.7,
            "max_tokens": 2048,
            "top_p": 1.0,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0
        }
    
    def is_using_assistant(self) -> bool:
        """
        Check if this conversation is using a custom assistant.
        
        Returns:
            True if conversation has an active assistant
        """
        return self.assistant_id is not None and self.assistant is not None
    
    def can_use_assistant(self, assistant) -> bool:
        """
        Check if this conversation can use the specified assistant.
        Validates ownership and assistant status.
        
        Args:
            assistant: Assistant object to check
            
        Returns:
            True if the assistant can be used for this conversation
        """
        if not assistant or not assistant.is_active:
            return False
        
        # Assistant must belong to the same user as the conversation
        return assistant.user_id == self.user_id
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dict for API responses"""
        # 🔧 ENHANCED: Get project information with comprehensive debugging
        project_info = None
        try:
            print(f"🔍 Conversation {self.id} to_dict() debug:")
            print(f"  - hasattr(self, 'projects'): {hasattr(self, 'projects')}")
            
            if hasattr(self, 'projects'):
                print(f"  - self.projects: {self.projects}")
                print(f"  - len(self.projects): {len(self.projects) if self.projects else 'None'}")
                
                if self.projects and len(self.projects) > 0:
                    first_project = self.projects[0]  # Use first project as primary folder
                    print(f"  - first_project: {first_project}")
                    print(f"  - first_project.id: {first_project.id}")
                    print(f"  - first_project.name: {first_project.name}")
                    
                    project_info = {
                        "id": first_project.id,
                        "name": first_project.name,
                        "color": first_project.color,
                        "icon": first_project.icon
                    }
                    print(f"  - Created project_info: {project_info}")
                else:
                    print(f"  - projects is empty or None")
            else:
                print(f"  - projects attribute not found")
                
        except (AttributeError, IndexError) as e:
            # Handle cases where projects relationship isn't loaded or is empty
            print(f"  - Exception in project extraction: {e}")
            project_info = None
        
        print(f"  - Final project_info: {project_info}")
        
        # Get assistant information safely
        assistant_name = None
        assistant_info = None
        try:
            if hasattr(self, 'assistant') and self.assistant:
                assistant_name = self.assistant.name
                assistant_info = {
                    "id": self.assistant.id,
                    "name": self.assistant.name,
                    "description": self.assistant.description,
                    "is_active": self.assistant.is_active
                }
        except AttributeError:
            # Handle cases where assistant relationship isn't loaded
            assistant_name = None
            assistant_info = None
        
        result = {
            "id": self.id,
            "title": self.title,
            "user_id": self.user_id,
            "assistant_id": self.assistant_id,  # NEW: Include assistant reference
            "assistant_name": assistant_name,  # NEW: Include assistant name for UI
            "assistant": assistant_info,  # NEW: Include full assistant information
            "project_id": project_info["id"] if project_info else None,  # Add project_id for easy access
            "project": project_info,  # Add full project information
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "is_active": getattr(self, 'is_active', True),  # NEW: Include active status with fallback
            "message_count": getattr(self, 'message_count', 0),  # Safe fallback
            "last_message_at": self.last_message_at.isoformat() if self.last_message_at else None,
            "model_used": getattr(self, 'model_used', None),  # Safe fallback for None
            "session_id": getattr(self, 'session_id', None)  # NEW: Include session_id with fallback
        }
        
        print(f"📤 Conversation {self.id} API response: project_id={result['project_id']}, project_name={result['project']['name'] if result['project'] else None}")
        return result

class ConversationMessage(Base):
    """
    Individual message within a conversation
    Stores the actual chat messages (user and assistant)
    """
    __tablename__ = "conversation_messages"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)
    
    # Message content
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Message metadata
    model_used = Column(String(100), nullable=True)  # Model used for this response
    tokens_used = Column(Integer, nullable=True)     # Tokens consumed
    cost = Column(String(20), nullable=True)         # Cost estimate
    response_time_ms = Column(Integer, nullable=True)
    
    # Additional metadata as JSON
    message_metadata = Column(JSON, nullable=True)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    
    @property
    def meta_data(self) -> Dict[str, Any]:
        """Property to safely access message_metadata as meta_data for API responses"""
        # Ensure meta_data is always a valid dictionary
        if self.message_metadata is None:
            return {}
        elif isinstance(self.message_metadata, dict):
            return self.message_metadata
        else:
            # Handle any edge cases where metadata isn't a dict
            return {}
    
    @meta_data.setter
    def meta_data(self, value: Dict[str, Any]):
        """Setter for meta_data property to update message_metadata"""
        self.message_metadata = value if isinstance(value, dict) else {}
    
    def __repr__(self) -> str:
        try:
            # Safely access attributes that might not be loaded
            msg_id = getattr(self, 'id', '?')
            role = getattr(self, 'role', 'unknown')
            content = getattr(self, 'content', '')
            preview = content[:50] + "..." if len(content) > 50 else content
            return f"<Message(id={msg_id}, role='{role}', content='{preview}')>"
        except Exception:
            # Fallback if any attribute access fails
            return f"<Message(id=?, role='unknown', content='...')>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dict for API responses with safe metadata handling"""
        # Safely handle metadata field - ensure it's always a dict
        safe_metadata = self.message_metadata
        if not isinstance(safe_metadata, dict):
            safe_metadata = {} if safe_metadata is None else {}
            
        return {
            "id": self.id,
            "role": self.role,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
            "model_used": self.model_used,
            "tokens_used": self.tokens_used,
            "cost": self.cost,
            "response_time_ms": self.response_time_ms,
            "metadata": safe_metadata  # Using safe_metadata instead of the meta_data property
        }

# Performance indexes
# Note: Indexes should be defined after all table definitions to avoid metadata conflicts
def create_indexes():
    """Create performance indexes for conversation tables"""
    Index('idx_conversation_user_updated', Conversation.user_id, Conversation.updated_at.desc())
    Index('idx_conversation_assistant_updated', Conversation.assistant_id, Conversation.updated_at.desc())  # NEW: For assistant-based queries
    Index('idx_conversation_user_assistant', Conversation.user_id, Conversation.assistant_id)  # NEW: For user+assistant filtering
    Index('idx_message_conversation_created', ConversationMessage.conversation_id, ConversationMessage.created_at)
