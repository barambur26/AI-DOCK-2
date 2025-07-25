# AI Dock Conversation API Endpoints
# REST API for conversation save/load functionality

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging

# Setup logging
logger = logging.getLogger(__name__)

from ..core.database import get_async_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.project import Project  # Add Project import
from ..models.conversation import Conversation  # Add Conversation import
from sqlalchemy import select, func  # Add SQLAlchemy imports
from ..services.conversation_service import conversation_service
from ..schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationSummary,
    ConversationDetail,
    ConversationSaveFromMessages,
    ConversationListResponse,
    ConversationStatsResponse,
    ConversationOperationResponse,
    ConversationListRequest,
    ConversationSearchRequest
)

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.post("/", response_model=ConversationDetail)
async def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Create a new empty conversation"""
    try:
        conversation = await conversation_service.create_conversation(
            db=db,
            user_id=current_user.id,
            title=conversation_data.title,
            llm_config_id=conversation_data.llm_config_id,
            model_used=conversation_data.model_used,
            project_id=conversation_data.project_id,
            assistant_id=conversation_data.assistant_id,
            session_id=conversation_data.session_id  # NEW: Pass session_id for usage log tracking
        )
        
        return await conversation_service.get_conversation(
            db=db,
            conversation_id=conversation.id,
            user_id=current_user.id
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}"
        )

@router.post("/save-from-messages", response_model=ConversationDetail)
async def save_conversation_from_messages(
    conversation_data: ConversationSaveFromMessages,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Save a complete conversation from a list of messages"""
    try:
        # Convert Pydantic models to dicts for service layer
        messages = [msg.dict() for msg in conversation_data.messages]
        
        conversation = await conversation_service.save_conversation_from_messages(
            db=db,
            user_id=current_user.id,
            messages=messages,
            llm_config_id=conversation_data.llm_config_id,
            model_used=conversation_data.model_used,
            title=conversation_data.title,
            project_id=conversation_data.project_id,
            assistant_id=conversation_data.assistant_id,
            session_id=conversation_data.session_id  # NEW: Pass session_id for usage log tracking
        )
        
        return await conversation_service.get_conversation(
            db=db,
            conversation_id=conversation.id,
            user_id=current_user.id
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save conversation: {str(e)}"
        )

@router.get("/", response_model=ConversationListResponse)
async def list_conversations(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get user's conversations with pagination"""
    try:
        conversations = await conversation_service.get_user_conversations(
            db=db,
            user_id=current_user.id,
            limit=limit,
            offset=offset
        )
        
        # Get total count for pagination
        stats = await conversation_service.get_conversation_stats(
            db=db,
            user_id=current_user.id
        )
        
        # 🔧 ENHANCED: Convert conversations to dictionaries with better error handling
        conversation_dicts = []
        for conv in conversations:
            try:
                # 🔧 DEBUG: Log conversation details before serialization
                logger.info(f"💾 API: Serializing conversation {conv.id}: '{conv.title}'")
                
                conv_dict = conv.to_dict()
                # 🔧 DEBUG: Log project info to verify it's being included (using info level for visibility)
                if conv_dict.get('project'):
                    logger.info(f"✅ API: Conversation {conv.id} serialized with project: {conv_dict['project']['name']}")
                else:
                    logger.info(f"❌ API: Conversation {conv.id} has NO project info after serialization")
                    logger.info(f"   - project_id: {conv_dict.get('project_id')}")
                    logger.info(f"   - project: {conv_dict.get('project')}")
                    
                    # 🔧 DEBUG: Check if the conversation object itself has projects
                    if hasattr(conv, 'projects'):
                        logger.info(f"   - Raw conversation.projects: {conv.projects}")
                        logger.info(f"   - Raw conversation.projects length: {len(conv.projects) if conv.projects else 0}")
                    else:
                        logger.info(f"   - Raw conversation has no 'projects' attribute")
                
                conversation_dicts.append(conv_dict)
            except Exception as conv_error:
                logger.error(f"❌ API: Failed to serialize conversation {conv.id}: {conv_error}")
                # Create a minimal dict to avoid breaking the entire response
                conversation_dicts.append({
                    "id": conv.id,
                    "title": conv.title,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat(),
                    "message_count": conv.message_count,
                    "last_message_at": conv.last_message_at.isoformat() if conv.last_message_at else None,
                    "model_used": conv.model_used,
                    "project_id": None,
                    "project": None,  # Set to None if serialization fails
                    "assistant_id": conv.assistant_id,
                    "assistant": None,
                    "session_id": conv.session_id
                })
        
        return ConversationListResponse(
            conversations=conversation_dicts,
            total_count=stats["total_conversations"],
            limit=limit,
            offset=offset,
            has_more=len(conversations) == limit
        )
        
    except Exception as e:
        logger.error(f"Failed to fetch conversations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch conversations: {str(e)}"
        )

@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get a specific conversation with all messages"""
    conversation = await conversation_service.get_conversation(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id
    )
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Ensure all relationships are loaded before returning
    await db.refresh(conversation, attribute_names=['messages', 'projects', 'assistant', 'user'])
    
    return conversation

@router.put("/{conversation_id}", response_model=ConversationDetail)
async def update_conversation(
    conversation_id: int,
    conversation_data: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update conversation (currently only title)"""
    if conversation_data.title:
        conversation = await conversation_service.update_conversation_title(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id,
            new_title=conversation_data.title
        )
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        conversation = await conversation_service.get_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id
        )
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Ensure all relationships are loaded before returning
        await db.refresh(conversation, attribute_names=['messages', 'projects', 'assistant', 'user'])
        
        return conversation
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="No valid fields to update"
    )

@router.delete("/{conversation_id}", response_model=ConversationOperationResponse)
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Delete a conversation and all its messages"""
    success = await conversation_service.delete_conversation(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return ConversationOperationResponse(
        success=True,
        message="Conversation deleted successfully",
        conversation_id=conversation_id
    )

@router.post("/search", response_model=List[ConversationSummary])
async def search_conversations(
    search_data: ConversationSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Search conversations by title"""
    try:
        conversations = await conversation_service.search_conversations(
            db=db,
            user_id=current_user.id,
            query=search_data.query,
            limit=search_data.limit
        )
        
        # Convert conversations to dictionaries for Pydantic validation
        conversation_dicts = [conv.to_dict() for conv in conversations]
        return conversation_dicts
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )

@router.get("/stats/summary", response_model=ConversationStatsResponse)
async def get_conversation_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get user's conversation statistics"""
    try:
        stats = await conversation_service.get_conversation_stats(
            db=db,
            user_id=current_user.id
        )
        
        return ConversationStatsResponse(**stats)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )

@router.post("/debug/database-check")
async def debug_database_check(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Debug endpoint to check database state for folder assignments.
    """
    try:
        from ..models.project import project_conversations
        from sqlalchemy import text
        
        # Check total associations
        total_query = select(func.count()).select_from(project_conversations)
        total_result = await db.execute(total_query)
        total_associations = total_result.scalar()
        
        # Check user's associations
        user_query = select(func.count()).select_from(project_conversations).join(
            Conversation, project_conversations.c.conversation_id == Conversation.id
        ).where(Conversation.user_id == current_user.id)
        
        user_result = await db.execute(user_query)
        user_associations = user_result.scalar()
        
        # Get sample associations for this user
        sample_query = select(
            project_conversations.c.project_id,
            project_conversations.c.conversation_id,
            project_conversations.c.created_at
        ).join(
            Conversation, project_conversations.c.conversation_id == Conversation.id
        ).where(Conversation.user_id == current_user.id).limit(5)
        
        sample_result = await db.execute(sample_query)
        sample_associations = sample_result.fetchall()
        
        # Get user's projects
        projects_query = select(Project).where(Project.user_id == current_user.id)
        projects_result = await db.execute(projects_query)
        user_projects = projects_result.scalars().all()
        
        # Get user's conversations
        convs_query = select(Conversation).where(Conversation.user_id == current_user.id).limit(5)
        convs_result = await db.execute(convs_query)
        user_conversations = convs_result.scalars().all()
        
        return {
            "database_state": {
                "total_associations": total_associations,
                "user_associations": user_associations,
                "sample_associations": [
                    {
                        "project_id": assoc.project_id,
                        "conversation_id": assoc.conversation_id,
                        "created_at": assoc.created_at.isoformat()
                    } for assoc in sample_associations
                ]
            },
            "user_data": {
                "user_id": current_user.id,
                "projects_count": len(user_projects),
                "projects": [{
                    "id": p.id,
                    "name": p.name,
                    "conversation_count": len(p.conversations) if hasattr(p, 'conversations') and p.conversations else 0
                } for p in user_projects],
                "conversations_count": len(user_conversations),
                "sample_conversations": [{
                    "id": c.id,
                    "title": c.title,
                    "project_count": len(c.projects) if hasattr(c, 'projects') and c.projects else 0
                } for c in user_conversations]
            }
        }
        
    except Exception as e:
        logger.error(f"Debug database check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Debug check failed: {str(e)}"
        )

@router.post("/debug/test-assignment")
async def debug_test_assignment(
    conversation_id: int,
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Debug endpoint to test folder assignment.
    """
    try:
        from ..services.project_service import ProjectService
        
        service = ProjectService(db)
        
        logger.info(f"🔧 DEBUG API: Testing assignment of conversation {conversation_id} to project {project_id}")
        
        result = await service.add_conversation_to_project(
            project_id=project_id,
            conversation_id=conversation_id,
            user_id=current_user.id
        )
        
        logger.info(f"🔧 DEBUG API: Assignment result: {result}")
        
        return {
            "success": result,
            "message": f"Assignment of conversation {conversation_id} to project {project_id}: {'SUCCESS' if result else 'FAILED'}"
        }
        
    except Exception as e:
        logger.error(f"Debug test assignment failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Test assignment failed: {str(e)}"
        )

@router.post("/{conversation_id}/messages", response_model=ConversationOperationResponse)
async def add_message_to_conversation(
    conversation_id: int,
    role: str,
    content: str,
    model_used: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Add a single message to existing conversation"""
    try:
        # Verify conversation exists and belongs to user
        conversation = await conversation_service.get_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id
        )
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        message = await conversation_service.save_message_to_conversation(
            db=db,
            conversation_id=conversation_id,
            role=role,
            content=content,
            model_used=model_used
        )
        
        return ConversationOperationResponse(
            success=True,
            message="Message added successfully",
            conversation_id=conversation_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add message: {str(e)}"
        )
