"""
Assistant file attachment schemas for AI Dock.

These Pydantic models define the structure and validation for managing
file attachments on assistants.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

# =============================================================================
# ASSISTANT FILE ATTACHMENT SCHEMAS
# =============================================================================

class AssistantFileAttach(BaseModel):
    """
    Schema for attaching files to an assistant.
    """
    file_ids: List[int] = Field(
        ...,
        min_items=1,
        max_items=10,  # Reasonable limit per request
        description="List of file IDs to attach to the assistant"
    )
    
    @validator('file_ids')
    def validate_unique_file_ids(cls, v):
        """Ensure no duplicate file IDs."""
        if len(set(v)) != len(v):
            raise ValueError('Duplicate file IDs are not allowed')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "file_ids": [123, 124, 125]
            }
        }


class AssistantFileDetach(BaseModel):
    """
    Schema for detaching files from an assistant.
    """
    file_ids: List[int] = Field(
        ...,
        min_items=1,
        description="List of file IDs to detach from the assistant"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "file_ids": [123, 124]
            }
        }


class AssistantFileInfo(BaseModel):
    """
    Information about a file attached to an assistant.
    """
    id: int = Field(..., description="Assistant-file relationship ID")
    file_id: int = Field(..., description="File ID")
    filename: str = Field(..., description="Original filename")
    file_size: int = Field(..., description="File size in bytes")
    file_size_human: str = Field(..., description="Human-readable file size")
    mime_type: str = Field(..., description="MIME type of the file")
    upload_date: datetime = Field(..., description="When file was uploaded")
    attached_at: datetime = Field(..., description="When file was attached to assistant")
    attached_by: int = Field(..., description="User ID who attached the file")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        schema_extra = {
            "example": {
                "id": 1,
                "file_id": 123,
                "filename": "requirements.txt",
                "file_size": 2048,
                "file_size_human": "2.0 KB",
                "mime_type": "text/plain",
                "upload_date": "2025-07-05T10:00:00Z",
                "attached_at": "2025-07-05T10:05:00Z",
                "attached_by": 1
            }
        }


class AssistantFilesResponse(BaseModel):
    """
    Response schema for listing assistant files.
    """
    assistant_id: int = Field(..., description="Assistant ID")
    assistant_name: str = Field(..., description="Assistant name")
    files: List[AssistantFileInfo] = Field(..., description="List of attached files")
    total_files: int = Field(..., description="Total number of attached files")
    total_size: int = Field(..., description="Total size of all files in bytes")
    total_size_human: str = Field(..., description="Human-readable total size")
    
    class Config:
        schema_extra = {
            "example": {
                "assistant_id": 456,
                "assistant_name": "Data Analyst Pro",
                "files": [
                    {
                        "id": 1,
                        "file_id": 123,
                        "filename": "requirements.txt",
                        "file_size": 2048,
                        "file_size_human": "2.0 KB",
                        "mime_type": "text/plain",
                        "upload_date": "2025-07-05T10:00:00Z",
                        "attached_at": "2025-07-05T10:05:00Z",
                        "attached_by": 1
                    }
                ],
                "total_files": 1,
                "total_size": 2048,
                "total_size_human": "2.0 KB"
            }
        }


class AssistantFileOperationResponse(BaseModel):
    """
    Response schema for file attachment/detachment operations.
    """
    success: bool = Field(..., description="Whether operation succeeded")
    message: str = Field(..., description="Human-readable operation result")
    assistant_id: int = Field(..., description="Assistant ID")
    files_affected: int = Field(..., description="Number of files affected")
    current_file_count: int = Field(..., description="Current total files on assistant")
    errors: Optional[List[str]] = Field(None, description="Any errors that occurred")
    skipped_files: Optional[List[Dict[str, Any]]] = Field(
        None, 
        description="Files that were skipped (already attached/not found)"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Successfully attached 2 files to assistant",
                "assistant_id": 456,
                "files_affected": 2,
                "current_file_count": 3,
                "errors": None,
                "skipped_files": None
            }
        }


# =============================================================================
# EXTENDED ASSISTANT SCHEMAS WITH FILE INFO
# =============================================================================

class AssistantWithFiles(BaseModel):
    """
    Assistant information including attached files.
    """
    id: int = Field(..., description="Assistant ID")
    name: str = Field(..., description="Assistant name")
    description: Optional[str] = Field(None, description="Assistant description")
    color: str = Field(..., description="Assistant color")
    is_active: bool = Field(..., description="Whether assistant is active")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    conversation_count: int = Field(..., description="Number of conversations")
    file_count: int = Field(..., description="Number of attached files")
    has_files: bool = Field(..., description="Whether assistant has files")
    files: List[AssistantFileInfo] = Field(..., description="Attached files")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# =============================================================================
# ERROR SCHEMAS
# =============================================================================

class AssistantFileError(BaseModel):
    """
    Error response for assistant file operations.
    """
    error_type: str = Field(..., description="Type of error")
    message: str = Field(..., description="Human-readable error message")
    assistant_id: Optional[int] = Field(None, description="Assistant ID if applicable")
    file_ids: Optional[List[int]] = Field(None, description="File IDs involved in error")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    
    class Config:
        schema_extra = {
            "example": {
                "error_type": "file_not_found",
                "message": "One or more files were not found or not owned by user",
                "assistant_id": 456,
                "file_ids": [999],
                "details": {
                    "missing_files": [999],
                    "valid_files": [123, 124]
                }
            }
        }
