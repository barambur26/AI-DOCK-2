"""
Assistant schemas for AI Dock Custom Assistants feature.

These Pydantic models define the structure and validation rules for:
- Creating and updating custom AI assistants
- Managing assistant conversations
- Data validation and API contracts
- Error handling for assistant operations

🎓 LEARNING: Custom Assistants Data Flow
======================================
The Custom Assistants feature enables users to create specialized AI personas:

1. **Assistant Creation**: User defines name, description, system prompt, model preferences, color
2. **Conversation Integration**: Assistants can be used in chat conversations
3. **Personalization**: Each user has their own private assistants with visual identity
4. **Validation**: Ensures data integrity and security

Think of assistants as "AI characters" - a Data Analyst assistant, Creative Writer, etc.
Each has its own personality (system prompt), preferences (temperature, model), and visual identity (color).

Why separate schemas from models?
- Models = Database structure (SQLAlchemy)
- Schemas = API contracts (Pydantic)
- Validation = Ensure data quality before hitting database
- Security = Control what data can be sent/received
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

# Import related schemas for composition
from .conversation import ConversationSummary, ConversationDetail


# =============================================================================
# ENUMS AND CONSTANTS
# =============================================================================

class AssistantStatus(str, Enum):
    """Status options for assistants."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"


class ModelProvider(str, Enum):
    """Supported LLM providers for assistant preferences."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    AZURE = "azure"
    CUSTOM = "custom"


# Validation constants
MAX_ASSISTANT_NAME_LENGTH = 100
MAX_ASSISTANT_DESCRIPTION_LENGTH = 500
MAX_SYSTEM_PROMPT_LENGTH = 8000
MIN_SYSTEM_PROMPT_LENGTH = 10
MAX_ASSISTANTS_PER_USER = 50


# =============================================================================
# CORE ASSISTANT SCHEMAS
# =============================================================================

class AssistantBase(BaseModel):
    """
    Base schema for assistant data shared across create/update operations.
    
    🎓 LEARNING: Schema Inheritance Pattern
    =====================================
    By creating a base schema, we can:
    - Share common fields between Create/Update schemas
    - Avoid code duplication
    - Ensure consistency across operations
    - Make changes in one place
    """
    name: str = Field(
        ...,
        min_length=1,
        max_length=MAX_ASSISTANT_NAME_LENGTH,
        description="Human-readable name for the assistant (e.g., 'Data Analyst', 'Creative Writer')",
        example="Data Analyst Pro"
    )
    
    description: Optional[str] = Field(
        None,
        max_length=MAX_ASSISTANT_DESCRIPTION_LENGTH,
        description="Brief description of what this assistant does and its personality",
        example="Specialized in analyzing datasets, creating visualizations, and providing statistical insights."
    )
    
    color: Optional[str] = Field(
        None,
        pattern=r'^#[0-9A-Fa-f]{6}$',
        description="Hex color code for visual identification (e.g., '#3B82F6'). Auto-generated if not provided.",
        example="#3B82F6"
    )
    
    system_prompt: str = Field(
        ...,
        min_length=MIN_SYSTEM_PROMPT_LENGTH,
        max_length=MAX_SYSTEM_PROMPT_LENGTH,
        description="The system prompt that defines this assistant's behavior and personality",
        example="You are a skilled data analyst. Help users analyze data, create visualizations, and interpret statistics. Always ask clarifying questions about the data context and goals."
    )
    
    model_preferences: Optional[Dict[str, Any]] = Field(
        default=None,
        description="JSON object storing LLM preferences: temperature, max_tokens, model, etc.",
        example={
            "model": "gpt-4",
            "temperature": 0.3,
            "max_tokens": 3000,
            "top_p": 1.0,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0
        }
    )
    
    @field_validator('name')
    def validate_name(cls, v):
        """Validate assistant name format and content."""
        if not v or not v.strip():
            raise ValueError('Assistant name cannot be empty or just whitespace')
        
        # Remove extra whitespace
        v = v.strip()
        
        # Check for reasonable characters
        if not all(c.isalnum() or c.isspace() or c in '-_()[]{}!?.' for c in v):
            raise ValueError('Assistant name contains invalid characters')
        
        return v
    
    @field_validator('description')
    def validate_description(cls, v):
        """Validate description content if provided."""
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None  # Convert empty string to None
        return v
    
    @field_validator('color')
    def validate_color(cls, v):
        """Validate color format if provided."""
        if v is not None:
            import re
            if not re.match(r'^#[0-9A-Fa-f]{6}$', v):
                raise ValueError('Color must be a valid hex code (e.g., #3B82F6)')
        return v
    
    @field_validator('system_prompt')
    def validate_system_prompt(cls, v):
        """Validate system prompt content and security."""
        if not v or not v.strip():
            raise ValueError('System prompt cannot be empty or just whitespace')
        
        v = v.strip()
        
        # Basic prompt injection checks
        dangerous_patterns = [
            'ignore previous instructions',
            'ignore the above',
            'disregard the above',
            'forget everything',
            'new instructions:',
        ]
        
        v_lower = v.lower()
        for pattern in dangerous_patterns:
            if pattern in v_lower:
                raise ValueError(f'System prompt contains potentially unsafe content: "{pattern}"')
        
        return v
    
    @field_validator('model_preferences')
    def validate_model_preferences(cls, v):
        """Validate model preferences structure and values."""
        if v is None:
            return v
        
        if not isinstance(v, dict):
            raise ValueError('Model preferences must be a dictionary')
        
        # Validate temperature
        if 'temperature' in v:
            temp = v['temperature']
            if not isinstance(temp, (int, float)):
                raise ValueError('Temperature must be a number')
            if not 0 <= temp <= 2:
                raise ValueError('Temperature must be between 0 and 2')
        
        # Validate max_tokens
        if 'max_tokens' in v:
            tokens = v['max_tokens']
            if not isinstance(tokens, int):
                raise ValueError('Max tokens must be an integer')
            if tokens <= 0:
                raise ValueError('Max tokens must be positive')
            if tokens > 32000:
                raise ValueError('Max tokens cannot exceed 32,000')
        
        # Validate model name if provided
        if 'model' in v:
            model = v['model']
            if not isinstance(model, str) or not model.strip():
                raise ValueError('Model must be a non-empty string')
        
        return v


class AssistantCreate(AssistantBase):
    """Schema for creating a new assistant."""
    pass  # Inherits all fields from AssistantBase
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Creative Writing Assistant",
                "description": "Helps with creative writing, storytelling, character development, and narrative structure.",
                "color": "#8B5CF6",
                "system_prompt": "You are a creative writing assistant. Help users with storytelling, character development, plot ideas, and creative content. Be imaginative, inspiring, and supportive of creative expression.",
                "model_preferences": {
                    "model": "gpt-4",
                    "temperature": 0.9,
                    "max_tokens": 4000,
                    "top_p": 1.0,
                    "frequency_penalty": 0.1,
                    "presence_penalty": 0.1
                }
            }
        }


class AssistantUpdate(BaseModel):
    """Schema for updating an existing assistant."""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=MAX_ASSISTANT_NAME_LENGTH,
        description="Updated name for the assistant"
    )
    
    description: Optional[str] = Field(
        None,
        max_length=MAX_ASSISTANT_DESCRIPTION_LENGTH,
        description="Updated description"
    )
    
    color: Optional[str] = Field(
        None,
        pattern=r'^#[0-9A-Fa-f]{6}$',
        description="Updated hex color code"
    )
    
    system_prompt: Optional[str] = Field(
        None,
        min_length=MIN_SYSTEM_PROMPT_LENGTH,
        max_length=MAX_SYSTEM_PROMPT_LENGTH,
        description="Updated system prompt"
    )
    
    model_preferences: Optional[Dict[str, Any]] = Field(
        None,
        description="Updated model preferences"
    )
    
    is_active: Optional[bool] = Field(
        None,
        description="Whether to activate/deactivate the assistant"
    )
    
    # Apply same validators as base schema
    _validate_name = field_validator('name')(AssistantBase.validate_name)
    _validate_description = field_validator('description')(AssistantBase.validate_description)
    _validate_color = field_validator('color')(AssistantBase.validate_color)
    _validate_system_prompt = field_validator('system_prompt')(AssistantBase.validate_system_prompt)
    _validate_model_preferences = field_validator('model_preferences')(AssistantBase.validate_model_preferences)
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Advanced Data Analyst",
                "description": "Enhanced with statistical analysis and machine learning capabilities.",
                "color": "#3B82F6",
                "system_prompt": "You are an expert data analyst with advanced statistical knowledge. Help users with complex data analysis, statistical modeling, and machine learning insights.",
                "model_preferences": {
                    "temperature": 0.2,
                    "max_tokens": 4000
                },
                "is_active": True
            }
        }


class AssistantResponse(BaseModel):
    """Schema for assistant API responses."""
    id: int = Field(..., description="Unique assistant identifier")
    name: str = Field(..., description="Assistant name")
    description: Optional[str] = Field(None, description="Assistant description")
    color: str = Field(..., description="Hex color code for visual identification")
    system_prompt: str = Field(..., description="System prompt defining assistant behavior")
    system_prompt_preview: str = Field(..., description="Truncated system prompt for list views")
    model_preferences: Dict[str, Any] = Field(..., description="LLM model preferences")
    user_id: int = Field(..., description="ID of the user who owns this assistant")
    is_active: bool = Field(..., description="Whether assistant is active")
    conversation_count: int = Field(..., description="Number of conversations using this assistant")
    
    # Timestamps
    created_at: datetime = Field(..., description="When assistant was created")
    updated_at: datetime = Field(..., description="When assistant was last updated")
    
    # Computed properties for UI
    is_new: bool = Field(..., description="Whether assistant was created recently (last 24 hours)")
    status_label: str = Field(..., description="Human-readable status")
    has_custom_preferences: bool = Field(..., description="Whether assistant has custom model preferences")
    
    # File attachment information
    file_count: int = Field(0, description="Number of files attached to this assistant")
    has_files: bool = Field(False, description="Whether this assistant has any attached files")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        json_schema_extra = {
            "example": {
                "id": 123,
                "name": "Data Analyst Pro",
                "description": "Specialized in analyzing datasets and providing statistical insights.",
                "color": "#3B82F6",
                "system_prompt": "You are a skilled data analyst. Help users analyze data, create visualizations...",
                "system_prompt_preview": "You are a skilled data analyst. Help users analyze data, create...",
                "model_preferences": {
                    "model": "gpt-4",
                    "temperature": 0.3,
                    "max_tokens": 3000
                },
                "user_id": 456,
                "is_active": True,
                "conversation_count": 7,
                "created_at": "2025-06-18T10:00:00Z",
                "updated_at": "2025-06-18T14:30:00Z",
                "is_new": False,
                "status_label": "Active",
                "has_custom_preferences": True,
                "file_count": 3,
                "has_files": True
            }
        }


class AssistantSummary(BaseModel):
    """Lightweight assistant summary for list views and dropdowns."""
    id: int = Field(..., description="Assistant ID")
    name: str = Field(..., description="Assistant name")
    description: Optional[str] = Field(None, description="Brief description")
    color: str = Field(..., description="Assistant color")
    system_prompt_preview: str = Field(..., description="Preview of system prompt")
    is_active: bool = Field(..., description="Whether assistant is active")
    conversation_count: int = Field(..., description="Number of conversations")
    created_at: datetime = Field(..., description="Creation timestamp")
    is_new: bool = Field(..., description="Whether created recently")
    
    # File attachment information
    file_count: int = Field(0, description="Number of files attached to this assistant")
    has_files: bool = Field(False, description="Whether this assistant has any attached files")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# =============================================================================
# ASSISTANT CONVERSATION SCHEMAS
# =============================================================================

class AssistantConversationCreate(BaseModel):
    """Schema for creating a conversation with a specific assistant."""
    title: str = Field(..., max_length=255, description="Conversation title")
    llm_config_id: Optional[int] = Field(None, description="LLM configuration to use (optional, assistant preferences will be used if not provided)")
    model_used: Optional[str] = Field(None, description="Specific model to use (optional, assistant preferences will be used if not provided)")
    project_id: Optional[int] = Field(None, description="Project/folder to assign conversation to")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Data Analysis Session",
                "llm_config_id": 1,
                "model_used": "gpt-4",
                "project_id": 5
            }
        }


class AssistantConversationResponse(BaseModel):
    """Schema for assistant conversation responses."""
    id: int = Field(..., description="Conversation ID")
    title: str = Field(..., description="Conversation title")
    user_id: int = Field(..., description="User who owns the conversation")
    assistant_id: int = Field(..., description="Assistant used in this conversation")
    assistant_name: Optional[str] = Field(None, description="Name of the assistant")
    assistant_description: Optional[str] = Field(None, description="Description of the assistant")
    message_count: int = Field(..., description="Number of messages in the conversation")
    last_message_at: Optional[datetime] = Field(None, description="Timestamp of last message")
    is_active: bool = Field(..., description="Whether conversation is active")
    created_at: datetime = Field(..., description="When conversation was created")
    updated_at: datetime = Field(..., description="When conversation was last updated")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        json_schema_extra = {
            "example": {
                "id": 123,
                "title": "Data Analysis Session",
                "user_id": 456,
                "assistant_id": 789,
                "assistant_name": "Data Analyst Pro",
                "assistant_description": "Specialized in analyzing datasets and providing statistical insights.",
                "message_count": 15,
                "last_message_at": "2025-06-18T14:30:00Z",
                "is_active": True,
                "created_at": "2025-06-18T10:00:00Z",
                "updated_at": "2025-06-18T14:30:00Z"
            }
        }


# =============================================================================
# ASSISTANT LIST AND OPERATION SCHEMAS
# =============================================================================

class AssistantListRequest(BaseModel):
    """Schema for listing assistants with filters."""
    limit: int = Field(50, ge=1, le=100, description="Maximum assistants to return")
    offset: int = Field(0, ge=0, description="Number of assistants to skip")
    search: Optional[str] = Field(None, description="Search term for assistant name or description")
    status_filter: Optional[str] = Field(None, description="Filter by status (active, inactive, draft)")
    sort_by: Optional[str] = Field("updated_at", description="Field to sort by (name, created_at, updated_at, conversation_count)")
    sort_order: Optional[str] = Field("desc", description="Sort order (asc or desc)")
    include_inactive: Optional[bool] = Field(False, description="Include inactive assistants")
    
    class Config:
        json_schema_extra = {
            "example": {
                "limit": 20,
                "offset": 0,
                "search": "data analyst",
                "status_filter": "active",
                "sort_by": "updated_at",
                "sort_order": "desc",
                "include_inactive": False
            }
        }


class AssistantListResponse(BaseModel):
    """Response schema for assistant lists."""
    assistants: List[AssistantSummary]
    total_count: int
    limit: int
    offset: int
    has_more: bool
    filters_applied: Optional[Dict[str, Any]] = Field(None, description="Applied filters for debugging")
    
    class Config:
        json_schema_extra = {
            "example": {
                "assistants": [],
                "total_count": 5,
                "limit": 20,
                "offset": 0,
                "has_more": False,
                "filters_applied": {
                    "search": "data analyst",
                    "status_filter": "active",
                    "include_inactive": False,
                    "sort_by": "updated_at",
                    "sort_order": "desc"
                }
            }
        }


class AssistantOperationResponse(BaseModel):
    """Generic response for assistant operations."""
    success: bool
    message: str
    assistant_id: Optional[int] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Assistant created successfully",
                "assistant_id": 123
            }
        }


class AssistantStatsResponse(BaseModel):
    """Response schema for assistant statistics."""
    total_assistants: int
    active_assistants: int
    total_conversations: int
    average_conversations_per_assistant: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_assistants": 10,
                "active_assistants": 8,
                "total_conversations": 150,
                "average_conversations_per_assistant": 15.0
            }
        }


class AssistantErrorResponse(BaseModel):
    """Error response schema for assistant operations."""
    error: str
    detail: Optional[str] = None
    assistant_id: Optional[int] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": "not_found",
                "detail": "Assistant not found",
                "assistant_id": 123
            }
        }


class AssistantPermissionError(BaseModel):
    """Permission error response for assistant operations."""
    error: str = "permission_denied"
    detail: str = "You don't have permission to access this assistant"
    assistant_id: Optional[int] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": "permission_denied",
                "detail": "You don't have permission to access this assistant",
                "assistant_id": 123
            }
        }


class AssistantBulkAction(BaseModel):
    """Schema for bulk assistant operations."""
    action: str = Field(..., description="Action to perform: 'delete', 'activate', 'deactivate'")
    assistant_ids: List[int] = Field(..., description="List of assistant IDs to operate on")
    
    @field_validator('action')
    def validate_action(cls, v):
        allowed_actions = ['delete', 'activate', 'deactivate']
        if v not in allowed_actions:
            raise ValueError(f'Action must be one of: {allowed_actions}')
        return v
    
    @field_validator('assistant_ids')
    def validate_ids(cls, v):
        if len(v) < 1:
            raise ValueError('At least one assistant ID is required')
        if len(v) > 50:
            raise ValueError('Cannot operate on more than 50 assistants at once')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "action": "activate",
                "assistant_ids": [1, 2, 3]
            }
        }


class AssistantBulkResponse(BaseModel):
    """Response schema for bulk assistant operations."""
    success: bool
    message: str
    processed_count: int
    failed_count: int
    failed_ids: List[int] = Field(default_factory=list)
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Bulk operation completed",
                "processed_count": 3,
                "failed_count": 0,
                "failed_ids": []
            }
        }


class AssistantExport(BaseModel):
    """Schema for assistant export data."""
    assistants: List[AssistantResponse]
    export_date: datetime
    total_count: int
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class AssistantImport(BaseModel):
    """Schema for assistant import data."""
    assistants: List[AssistantCreate]
    import_mode: str = Field("create", description="Import mode: 'create' or 'update'")
    
    @field_validator('import_mode')
    def validate_import_mode(cls, v):
        if v not in ['create', 'update']:
            raise ValueError('Import mode must be "create" or "update"')
        return v


def validate_assistant_ownership(assistant_user_id: int, current_user_id: int) -> bool:
    """Utility function to validate assistant ownership."""
    return assistant_user_id == current_user_id


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def create_assistant_response_from_model(
    assistant_model, 
    conversation_count: Optional[int] = None
) -> AssistantResponse:
    """Utility function to convert an Assistant model instance to AssistantResponse."""
    # Compute conversation count safely
    if conversation_count is None:
        if hasattr(assistant_model, 'conversations') and assistant_model.conversations is not None:
            conversation_count = len(assistant_model.conversations)
        else:
            conversation_count = 0
    
    # Compute is_new without accessing potentially lazy-loaded properties
    is_new = False
    if assistant_model.created_at:
        from datetime import datetime, timedelta, timezone
        day_ago = datetime.now(timezone.utc) - timedelta(hours=24)
        # Ensure both datetimes are timezone-aware for comparison
        created_at = assistant_model.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        is_new = created_at > day_ago
    
    # Get system prompt preview safely
    system_prompt_preview = assistant_model.system_prompt[:147] + "..." if len(assistant_model.system_prompt) > 150 else assistant_model.system_prompt
    
    # Get effective model preferences safely
    defaults = {
        "model": "gpt-3.5-turbo",
        "temperature": 0.7,
        "max_tokens": 2048,
        "top_p": 1.0,
        "frequency_penalty": 0.0,
        "presence_penalty": 0.0
    }
    
    if assistant_model.model_preferences and isinstance(assistant_model.model_preferences, dict):
        defaults.update(assistant_model.model_preferences)
    
    # Get color safely (avoid relationship access)
    color = assistant_model.color
    if not color:
        # Generate color based on assistant name/id for consistency  
        from ..models.assistant import generate_assistant_color
        color = generate_assistant_color(assistant_model.name or str(assistant_model.id))
    
    # For newly created assistants, avoid accessing assistant_files relationship
    # which can cause async/sync issues. New assistants have no files.
    file_count = 0
    has_files = False
    
    # If assistant has been loaded with relationships, we can safely access them
    if hasattr(assistant_model, 'assistant_files') and assistant_model.assistant_files is not None:
        try:
            file_count = len(assistant_model.assistant_files)
            has_files = file_count > 0
        except Exception:
            # If there's any issue accessing the relationship, use defaults
            file_count = 0
            has_files = False
    
    return AssistantResponse(
        id=assistant_model.id,
        name=assistant_model.name,
        description=assistant_model.description,
        color=color,
        system_prompt=assistant_model.system_prompt,
        system_prompt_preview=system_prompt_preview,
        model_preferences=defaults,
        user_id=assistant_model.user_id,
        is_active=assistant_model.is_active,
        conversation_count=conversation_count,
        created_at=assistant_model.created_at,
        updated_at=assistant_model.updated_at,
        is_new=is_new,
        status_label="Active" if assistant_model.is_active else "Inactive",
        has_custom_preferences=bool(assistant_model.model_preferences),
        file_count=file_count,
        has_files=has_files
    )
