"""
Assistant file management API endpoints.

This module provides endpoints for:
- Attaching files to assistants
- Detaching files from assistants  
- Listing files attached to assistants
- Managing assistant file relationships
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from ...core.database import get_async_db
from ...core.security import get_current_user
from ...models.user import User
from ...schemas.assistant_file import (
    AssistantFileAttach,
    AssistantFileDetach,
    AssistantFilesResponse,
    AssistantFileOperationResponse,
    AssistantFileError
)
from ...services.assistant_file_service import assistant_file_service

# Setup logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/{assistant_id}/files",
    tags=["assistant-files"],
    dependencies=[Depends(get_current_user)],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        404: {"description": "Assistant not found"},
        422: {"description": "Validation Error"}
    }
)

# =============================================================================
# FILE ATTACHMENT ENDPOINTS
# =============================================================================

@router.post("/attach", response_model=AssistantFileOperationResponse)
async def attach_files_to_assistant(
    assistant_id: int,
    attach_data: AssistantFileAttach,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Attach files to an assistant.
    
    **Requirements:**
    - User must own the assistant
    - User must own all files being attached
    - Files must be successfully uploaded (completed status)
    - No duplicate attachments allowed
    
    **Response:**
    - Success status and number of files attached
    - Current total file count on assistant
    - Any errors or skipped files
    
    **Example Request:**
    ```json
    {
        "file_ids": [123, 124, 125]
    }
    ```
    """
    try:
        result = await assistant_file_service.attach_files_to_assistant(
            db=db,
            assistant_id=assistant_id,
            user_id=current_user.id,
            attach_data=attach_data
        )
        
        logger.info(
            f"User {current_user.email} attached {result.files_affected} files "
            f"to assistant {assistant_id}"
        )
        
        return result
        
    except ValueError as e:
        logger.warning(f"Invalid request from {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_type": "not_found",
                "message": str(e),
                "assistant_id": assistant_id
            }
        )
    except PermissionError as e:
        logger.warning(f"Permission denied for {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error_type": "permission_denied",
                "message": str(e),
                "assistant_id": assistant_id
            }
        )
    except Exception as e:
        logger.error(f"Error attaching files to assistant {assistant_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_type": "internal_error",
                "message": "Failed to attach files to assistant",
                "assistant_id": assistant_id
            }
        )


@router.post("/detach", response_model=AssistantFileOperationResponse)
async def detach_files_from_assistant(
    assistant_id: int,
    detach_data: AssistantFileDetach,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Detach files from an assistant.
    
    **Requirements:**
    - User must own the assistant
    - Files must be currently attached to the assistant
    
    **Response:**
    - Success status and number of files detached
    - Current total file count on assistant
    - Any errors or files that weren't attached
    
    **Example Request:**
    ```json
    {
        "file_ids": [123, 124]
    }
    ```
    """
    try:
        result = await assistant_file_service.detach_files_from_assistant(
            db=db,
            assistant_id=assistant_id,
            user_id=current_user.id,
            detach_data=detach_data
        )
        
        logger.info(
            f"User {current_user.email} detached {result.files_affected} files "
            f"from assistant {assistant_id}"
        )
        
        return result
        
    except ValueError as e:
        logger.warning(f"Invalid request from {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_type": "not_found",
                "message": str(e),
                "assistant_id": assistant_id
            }
        )
    except Exception as e:
        logger.error(f"Error detaching files from assistant {assistant_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_type": "internal_error",
                "message": "Failed to detach files from assistant",
                "assistant_id": assistant_id
            }
        )


# =============================================================================
# FILE LISTING ENDPOINTS
# =============================================================================

@router.get("/", response_model=AssistantFilesResponse)
async def get_assistant_files(
    assistant_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Get all files attached to an assistant.
    
    **Requirements:**
    - User must own the assistant
    
    **Response:**
    - List of all attached files with metadata
    - Total file count and size information
    - File attachment timestamps
    
    **Response includes:**
    - File ID, name, size, type
    - Upload and attachment dates
    - User who attached each file
    """
    try:
        result = await assistant_file_service.get_assistant_files(
            db=db,
            assistant_id=assistant_id,
            user_id=current_user.id
        )
        
        logger.debug(
            f"User {current_user.email} retrieved {result.total_files} files "
            f"for assistant {assistant_id}"
        )
        
        return result
        
    except ValueError as e:
        logger.warning(f"Invalid request from {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_type": "not_found",
                "message": str(e),
                "assistant_id": assistant_id
            }
        )
    except Exception as e:
        logger.error(f"Error getting files for assistant {assistant_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_type": "internal_error",
                "message": "Failed to retrieve assistant files",
                "assistant_id": assistant_id
            }
        )


# =============================================================================
# BULK OPERATIONS
# =============================================================================

@router.delete("/all", response_model=AssistantFileOperationResponse)
async def detach_all_files_from_assistant(
    assistant_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Detach all files from an assistant.
    
    **Requirements:**
    - User must own the assistant
    
    **Response:**
    - Success status and number of files detached
    - Assistant will have zero files after successful operation
    
    **Warning:** This operation cannot be undone.
    """
    try:
        # Get current files to build detach request
        files_response = await assistant_file_service.get_assistant_files(
            db=db,
            assistant_id=assistant_id,
            user_id=current_user.id
        )
        
        if files_response.total_files == 0:
            return AssistantFileOperationResponse(
                success=True,
                message="Assistant has no files to detach",
                assistant_id=assistant_id,
                files_affected=0,
                current_file_count=0,
                errors=None,
                skipped_files=None
            )
        
        # Build detach request with all file IDs
        file_ids = [f.file_id for f in files_response.files]
        detach_data = AssistantFileDetach(file_ids=file_ids)
        
        result = await assistant_file_service.detach_files_from_assistant(
            db=db,
            assistant_id=assistant_id,
            user_id=current_user.id,
            detach_data=detach_data
        )
        
        logger.info(
            f"User {current_user.email} detached all {result.files_affected} files "
            f"from assistant {assistant_id}"
        )
        
        return result
        
    except ValueError as e:
        logger.warning(f"Invalid request from {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error_type": "not_found",
                "message": str(e),
                "assistant_id": assistant_id
            }
        )
    except Exception as e:
        logger.error(f"Error detaching all files from assistant {assistant_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error_type": "internal_error",
                "message": "Failed to detach all files from assistant",
                "assistant_id": assistant_id
            }
        )
