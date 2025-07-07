# AI Dock Assistant File Service
# Business logic for managing file attachments on assistants

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, func
from typing import List, Optional, Dict, Any, Tuple
import logging

from ..models.assistant import Assistant
from ..models.assistant_file import AssistantFile
from ..models.file_upload import FileUpload
from ..models.user import User
from ..schemas.assistant_file import (
    AssistantFileAttach,
    AssistantFileDetach,
    AssistantFileInfo,
    AssistantFilesResponse,
    AssistantFileOperationResponse
)

# Setup logging
logger = logging.getLogger(__name__)

class AssistantFileService:
    """
    Service for managing file attachments on assistants.
    
    This service handles:
    - Attaching files to assistants
    - Detaching files from assistants
    - Listing files attached to assistants
    - Validating file ownership and permissions
    - Including assistant files in chat context
    """
    
    # =============================================================================
    # FILE ATTACHMENT OPERATIONS
    # =============================================================================
    
    async def attach_files_to_assistant(
        self,
        db: AsyncSession,
        assistant_id: int,
        user_id: int,
        attach_data: AssistantFileAttach
    ) -> AssistantFileOperationResponse:
        """
        Attach files to an assistant.
        
        Args:
            db: Async database session
            assistant_id: ID of the assistant
            user_id: ID of the user performing the operation
            attach_data: File attachment data
            
        Returns:
            Operation response with results
            
        Raises:
            ValueError: If assistant not found or not owned by user
            PermissionError: If user doesn't own one or more files
        """
        try:
            # Validate assistant ownership
            assistant = await self._get_user_assistant(db, assistant_id, user_id)
            if not assistant:
                raise ValueError(f"Assistant {assistant_id} not found or not owned by user")
            
            # Validate file ownership and existence
            valid_files = []
            errors = []
            skipped_files = []
            
            for file_id in attach_data.file_ids:
                # Check if file exists and is owned by user
                file_obj = await self._get_user_file(db, file_id, user_id)
                if not file_obj:
                    errors.append(f"File {file_id} not found or not owned by user")
                    continue
                
                # Check if file is already attached
                existing_attachment = await self._get_assistant_file_relationship(
                    db, assistant_id, file_id
                )
                if existing_attachment:
                    skipped_files.append({
                        "file_id": file_id,
                        "filename": file_obj.original_filename,
                        "reason": "already_attached"
                    })
                    continue
                
                valid_files.append(file_obj)
            
            # Create attachments for valid files
            attachments_created = 0
            for file_obj in valid_files:
                try:
                    assistant_file = AssistantFile(
                        assistant_id=assistant_id,
                        file_id=file_obj.id,
                        created_by=user_id
                    )
                    db.add(assistant_file)
                    attachments_created += 1
                except Exception as e:
                    errors.append(f"Failed to attach file {file_obj.id}: {str(e)}")
            
            await db.commit()
            
            # Get current file count
            current_count = await self._get_assistant_file_count(db, assistant_id)
            
            # Prepare response
            success = attachments_created > 0
            message = f"Successfully attached {attachments_created} files to assistant"
            if errors:
                message += f" ({len(errors)} errors)"
            if skipped_files:
                message += f" ({len(skipped_files)} skipped)"
            
            logger.info(
                f"Attached {attachments_created} files to assistant {assistant_id} "
                f"for user {user_id}"
            )
            
            return AssistantFileOperationResponse(
                success=success,
                message=message,
                assistant_id=assistant_id,
                files_affected=attachments_created,
                current_file_count=current_count,
                errors=errors if errors else None,
                skipped_files=skipped_files if skipped_files else None
            )
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to attach files to assistant {assistant_id}: {str(e)}")
            raise
    
    async def detach_files_from_assistant(
        self,
        db: AsyncSession,
        assistant_id: int,
        user_id: int,
        detach_data: AssistantFileDetach
    ) -> AssistantFileOperationResponse:
        """
        Detach files from an assistant.
        
        Args:
            db: Async database session
            assistant_id: ID of the assistant
            user_id: ID of the user performing the operation
            detach_data: File detachment data
            
        Returns:
            Operation response with results
        """
        try:
            # Validate assistant ownership
            assistant = await self._get_user_assistant(db, assistant_id, user_id)
            if not assistant:
                raise ValueError(f"Assistant {assistant_id} not found or not owned by user")
            
            # Find and remove attachments
            attachments_removed = 0
            errors = []
            skipped_files = []
            
            for file_id in detach_data.file_ids:
                # Find the attachment relationship
                attachment = await self._get_assistant_file_relationship(
                    db, assistant_id, file_id
                )
                
                if not attachment:
                    skipped_files.append({
                        "file_id": file_id,
                        "reason": "not_attached"
                    })
                    continue
                
                try:
                    await db.delete(attachment)
                    attachments_removed += 1
                except Exception as e:
                    errors.append(f"Failed to detach file {file_id}: {str(e)}")
            
            await db.commit()
            
            # Get current file count
            current_count = await self._get_assistant_file_count(db, assistant_id)
            
            # Prepare response
            success = attachments_removed > 0
            message = f"Successfully detached {attachments_removed} files from assistant"
            if errors:
                message += f" ({len(errors)} errors)"
            if skipped_files:
                message += f" ({len(skipped_files)} not attached)"
            
            logger.info(
                f"Detached {attachments_removed} files from assistant {assistant_id} "
                f"for user {user_id}"
            )
            
            return AssistantFileOperationResponse(
                success=success,
                message=message,
                assistant_id=assistant_id,
                files_affected=attachments_removed,
                current_file_count=current_count,
                errors=errors if errors else None,
                skipped_files=skipped_files if skipped_files else None
            )
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to detach files from assistant {assistant_id}: {str(e)}")
            raise
    
    # =============================================================================
    # FILE LISTING AND INFORMATION
    # =============================================================================
    
    async def get_assistant_files(
        self,
        db: AsyncSession,
        assistant_id: int,
        user_id: int
    ) -> AssistantFilesResponse:
        """
        Get all files attached to an assistant.
        
        Args:
            db: Async database session
            assistant_id: ID of the assistant
            user_id: ID of the user requesting the files
            
        Returns:
            Response with assistant files information
        """
        try:
            # Validate assistant ownership
            assistant = await self._get_user_assistant(db, assistant_id, user_id)
            if not assistant:
                raise ValueError(f"Assistant {assistant_id} not found or not owned by user")
            
            # Get all files attached to the assistant
            stmt = select(AssistantFile, FileUpload).join(
                FileUpload, AssistantFile.file_id == FileUpload.id
            ).where(
                AssistantFile.assistant_id == assistant_id
            ).order_by(AssistantFile.created_at.desc())
            
            result = await db.execute(stmt)
            rows = result.all()
            
            # Build file info list
            files = []
            total_size = 0
            
            for assistant_file, file_upload in rows:
                file_info = AssistantFileInfo(
                    id=assistant_file.id,
                    file_id=file_upload.id,
                    filename=file_upload.original_filename,
                    file_size=file_upload.file_size,
                    file_size_human=file_upload.get_file_size_human(),
                    mime_type=file_upload.mime_type,
                    upload_date=file_upload.upload_date,
                    attached_at=assistant_file.created_at,
                    attached_by=assistant_file.created_by
                )
                files.append(file_info)
                total_size += file_upload.file_size
            
            # Calculate total size human readable
            total_size_human = self._format_file_size(total_size)
            
            logger.debug(
                f"Retrieved {len(files)} files for assistant {assistant_id} "
                f"(total size: {total_size_human})"
            )
            
            return AssistantFilesResponse(
                assistant_id=assistant_id,
                assistant_name=assistant.name,
                files=files,
                total_files=len(files),
                total_size=total_size,
                total_size_human=total_size_human
            )
            
        except Exception as e:
            logger.error(f"Failed to get files for assistant {assistant_id}: {str(e)}")
            raise
    
    async def get_assistant_files_for_chat(
        self,
        db: AsyncSession,
        assistant_id: int,
        user_id: int
    ) -> List[FileUpload]:
        """
        Get file objects for an assistant to include in chat context.
        
        Args:
            db: Async database session
            assistant_id: ID of the assistant
            user_id: ID of the user (for ownership validation)
            
        Returns:
            List of FileUpload objects
        """
        try:
            # Validate assistant ownership
            assistant = await self._get_user_assistant(db, assistant_id, user_id)
            if not assistant:
                return []
            
            # Get file objects
            stmt = select(FileUpload).join(
                AssistantFile, AssistantFile.file_id == FileUpload.id
            ).where(
                and_(
                    AssistantFile.assistant_id == assistant_id,
                    FileUpload.upload_status == 'completed'  # Only include successfully processed files
                )
            ).order_by(AssistantFile.created_at.asc())  # Include in order of attachment
            
            result = await db.execute(stmt)
            files = result.scalars().all()
            
            logger.debug(f"Retrieved {len(files)} files for chat context (assistant {assistant_id})")
            return list(files)
            
        except Exception as e:
            logger.error(f"Failed to get chat files for assistant {assistant_id}: {str(e)}")
            return []
    
    # =============================================================================
    # HELPER METHODS
    # =============================================================================
    
    async def _get_user_assistant(
        self,
        db: AsyncSession,
        assistant_id: int,
        user_id: int
    ) -> Optional[Assistant]:
        """Get assistant with ownership validation."""
        stmt = select(Assistant).where(
            and_(
                Assistant.id == assistant_id,
                Assistant.user_id == user_id
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def _get_user_file(
        self,
        db: AsyncSession,
        file_id: int,
        user_id: int
    ) -> Optional[FileUpload]:
        """Get file with ownership validation."""
        stmt = select(FileUpload).where(
            and_(
                FileUpload.id == file_id,
                FileUpload.user_id == user_id,
                FileUpload.upload_status == 'completed'  # Only allow completed uploads
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def _get_assistant_file_relationship(
        self,
        db: AsyncSession,
        assistant_id: int,
        file_id: int
    ) -> Optional[AssistantFile]:
        """Get existing assistant-file relationship."""
        stmt = select(AssistantFile).where(
            and_(
                AssistantFile.assistant_id == assistant_id,
                AssistantFile.file_id == file_id
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def _get_assistant_file_count(
        self,
        db: AsyncSession,
        assistant_id: int
    ) -> int:
        """Get current count of files attached to assistant."""
        stmt = select(func.count(AssistantFile.id)).where(
            AssistantFile.assistant_id == assistant_id
        )
        result = await db.execute(stmt)
        return result.scalar() or 0
    
    def _format_file_size(self, size_bytes: int) -> str:
        """Format file size in human-readable format."""
        if size_bytes == 0:
            return "0 B"
        
        units = ['B', 'KB', 'MB', 'GB', 'TB']
        size = float(size_bytes)
        unit_index = 0
        
        while size >= 1024 and unit_index < len(units) - 1:
            size /= 1024
            unit_index += 1
        
        if size == int(size):
            return f"{int(size)} {units[unit_index]}"
        else:
            return f"{size:.1f} {units[unit_index]}"


# =============================================================================
# SERVICE INSTANCE
# =============================================================================

# Create singleton instance
assistant_file_service = AssistantFileService()
