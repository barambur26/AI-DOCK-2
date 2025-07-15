# User Usage Analytics API
# User-facing endpoints for viewing personal LLM usage data

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

# Import our dependencies
from ..core.database import get_async_db
from ..core.security import get_current_user
from ..models.user import User
from ..services.usage_service import usage_service

# Create router for user usage analytics endpoints
router = APIRouter(prefix="/usage", tags=["User Usage Analytics"])

# =============================================================================
# USER USAGE ANALYTICS ENDPOINTS
# =============================================================================

@router.get("/my-stats")
async def get_my_usage_stats(
    days: int = Query(30, description="Number of days to analyze", ge=1, le=365),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Get detailed usage statistics for the current user.
    
    This shows the current user's:
    - AI usage patterns and costs
    - Performance metrics for their requests
    - Usage trends over time
    - Token consumption
    
    Perfect for users to understand their own usage patterns.
    
    Args:
        days: Number of days to include in analysis (default: 30)
        current_user: Authenticated user (auto-injected)
        session: Database session (auto-injected)
        
    Returns:
        Detailed user usage statistics for the current user
    """
    try:
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"🔍 [MY-STATS] Starting usage stats for user {current_user.id}")
        
        # 🔧 FIX: Eagerly load relationships to prevent SQLAlchemy async errors
        from sqlalchemy import select
        
        # Load user with relationships to avoid lazy loading issues
        stmt = select(User).options(
            selectinload(User.role),
            selectinload(User.department)
        ).where(User.id == current_user.id)
        
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"🔍 [MY-STATS] User loaded: {user.email}")
        
        # Calculate date range with timezone awareness
        from datetime import timezone
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        logger.info(f"🔍 [MY-STATS] Date range (timezone-aware): {start_date} to {end_date}")
        
        # 🔧 FIX: Add null safety check for usage_service
        if usage_service is None:
            logger.error("❌ [MY-STATS] Usage service is None")
            raise HTTPException(
                status_code=500,
                detail="Usage service is not available"
            )
        
        logger.info(f"🔍 [MY-STATS] About to call usage_service.get_user_usage_summary")
        
        # Get user usage summary with comprehensive error handling
        try:
            user_summary = await usage_service.get_user_usage_summary(current_user.id, start_date, end_date)
            logger.info(f"✅ [MY-STATS] Usage summary retrieved successfully")
        except Exception as usage_error:
            logger.error(f"❌ [MY-STATS] Usage service error: {str(usage_error)}")
            import traceback
            logger.error(f"❌ [MY-STATS] Usage service traceback: {traceback.format_exc()}")
            
            # Return empty stats instead of failing
            user_summary = {
                "user_id": current_user.id,
                "period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat()
                },
                "requests": {"total": 0, "successful": 0, "failed": 0, "success_rate": 0},
                "tokens": {"total": 0, "input": 0, "output": 0},
                "cost": {"total_usd": 0, "average_per_request": 0},
                "performance": {"average_response_time_ms": 0, "max_response_time_ms": 0},
                "favorite_provider": None,
                "last_activity": None,
                "debug_info": {
                    "usage_service_error": str(usage_error),
                    "usage_logs_table_accessible": True,
                    "empty_stats_reason": "Usage service error - check server logs"
                }
            }
        
        # 🔧 FIX: Access relationship attributes directly instead of calling methods
        # that could trigger lazy loading outside async context
        user_summary.update({
            "user_info": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "department": user.department.name if user.department else "No Department",
                "role": user.role.name if user.role else "No Role"
            }
        })
        
        logger.info(f"✅ [MY-STATS] Returning user summary for user {current_user.id}")
        return user_summary
        
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"❌ [MY-STATS] Unexpected error: {str(e)}")
        import traceback
        logger.error(f"❌ [MY-STATS] Traceback: {traceback.format_exc()}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get your usage statistics: {str(e)}"
        )

@router.get("/my-recent-activity")
async def get_my_recent_activity(
    limit: int = Query(20, description="Number of recent activities to return", ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Get recent usage activity for the current user.
    
    This provides visibility into the user's recent:
    - AI requests and responses
    - Success/failure patterns
    - Performance metrics
    - Token usage per request
    
    Perfect for users to monitor their recent activity.
    
    Args:
        limit: Maximum number of recent activities to return (default: 20)
        current_user: Authenticated user (auto-injected)
        session: Database session (auto-injected)
        
    Returns:
        List of recent usage activities for the current user
    """
    try:
        from sqlalchemy import select, desc
        from ..models.usage_log import UsageLog
        
        # Build query to get user's recent activity
        query = select(UsageLog).where(
            UsageLog.user_id == current_user.id
        ).order_by(desc(UsageLog.created_at)).limit(limit)
        
        # Execute query
        result = await session.execute(query)
        logs = result.scalars().all()
        
        # Convert to user-friendly format (exclude sensitive data)
        activity_data = []
        for log in logs:
            activity_data.append({
                "id": log.id,
                "timestamp": log.created_at.isoformat() if log.created_at else None,
                "llm": {
                    "provider": log.provider,
                    "model": log.model,
                    "config_name": log.llm_config_name
                },
                "usage": {
                    "input_tokens": log.input_tokens,
                    "output_tokens": log.output_tokens,
                    "total_tokens": log.total_tokens,
                    "estimated_cost": log.estimated_cost
                },
                "performance": {
                    "response_time_ms": log.response_time_ms,
                    "success": log.success
                },
                "request_info": {
                    "messages_count": log.request_messages_count,
                    "total_chars": log.request_total_chars
                },
                "error": {
                    "error_type": log.error_type,
                    "error_message": log.error_message
                } if not log.success else None
            })
        
        return {
            "recent_activity": activity_data,
            "total_records": len(activity_data),
            "user_info": {
                "username": current_user.username,
                "email": current_user.email
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get your recent activity: {str(e)}"
        )

@router.get("/debug/usage-logging")
async def debug_usage_logging(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Debug endpoint to test and verify usage logging functionality.
    
    This endpoint helps diagnose why usage_logs table might be empty.
    """
    try:
        import logging
        logger = logging.getLogger(__name__)
        
        # Test database connectivity
        from sqlalchemy import select, func, text
        from ..models.usage_log import UsageLog
        
        debug_info = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": current_user.id,
            "tests": {}
        }
        
        # Test 1: Basic database connectivity
        try:
            result = await session.execute(text("SELECT 1 as test"))
            test_value = result.scalar()
            debug_info["tests"]["database_connectivity"] = {
                "success": test_value == 1,
                "result": test_value
            }
        except Exception as db_error:
            debug_info["tests"]["database_connectivity"] = {
                "success": False,
                "error": str(db_error)
            }
        
        # Test 2: Usage logs table accessibility
        try:
            count_result = await session.execute(select(func.count(UsageLog.id)))
            total_logs = count_result.scalar()
            debug_info["tests"]["usage_logs_table"] = {
                "success": True,
                "total_records": total_logs,
                "table_accessible": True
            }
        except Exception as table_error:
            debug_info["tests"]["usage_logs_table"] = {
                "success": False,
                "error": str(table_error),
                "table_accessible": False
            }
        
        # Test 3: Usage service availability
        try:
            debug_info["tests"]["usage_service"] = {
                "imported": usage_service is not None,
                "class_name": usage_service.__class__.__name__ if usage_service else None,
                "has_log_method": hasattr(usage_service, 'log_llm_request_isolated') if usage_service else False
            }
        except Exception as service_error:
            debug_info["tests"]["usage_service"] = {
                "imported": False,
                "error": str(service_error)
            }
        
        # Test 4: Recent conversation activity (to see if chats are happening)
        try:
            from ..models.conversation import Conversation
            conv_count_result = await session.execute(
                select(func.count(Conversation.id)).where(Conversation.user_id == current_user.id)
            )
            user_conversations = conv_count_result.scalar()
            debug_info["tests"]["user_activity"] = {
                "user_conversations": user_conversations,
                "has_recent_activity": user_conversations > 0
            }
        except Exception as activity_error:
            debug_info["tests"]["user_activity"] = {
                "error": str(activity_error)
            }
        
        # Test 5: Try a mock usage log to see if it works
        try:
            from datetime import timezone
            import traceback
            mock_request_data = {
                "messages_count": 1,
                "total_chars": 100,
                "parameters": {"temperature": 0.7}
            }
            mock_response_data = {
                "success": True,
                "content": "Mock response",
                "model": "test-model",
                "provider": "test-provider",
                "token_usage": {"total_tokens": 50, "input_tokens": 25, "output_tokens": 25},
                "cost": 0.001
            }
            mock_performance_data = {
                "request_started_at": datetime.now(timezone.utc).isoformat(),
                "request_completed_at": datetime.now(timezone.utc).isoformat(),
                "response_time_ms": 1000
            }
            
            # Try to create a test usage log (in a separate transaction)
            await usage_service.log_llm_request_isolated(
                user_id=current_user.id,
                llm_config_id=1,  # Assuming config 1 exists
                request_data=mock_request_data,
                response_data=mock_response_data,
                performance_data=mock_performance_data,
                request_id=f"debug_test_{datetime.utcnow().timestamp()}"
            )
            
            debug_info["tests"]["mock_usage_log"] = {
                "success": True,
                "message": "Mock usage log created successfully"
            }
            
        except Exception as mock_error:
            debug_info["tests"]["mock_usage_log"] = {
                "success": False,
                "error": str(mock_error),
                "traceback": traceback.format_exc()
            }
        
        return debug_info
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Debug endpoint failed: {str(e)}"
        ) 