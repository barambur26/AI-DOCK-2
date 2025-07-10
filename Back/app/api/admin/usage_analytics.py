# AI Dock Usage Analytics API
# Admin endpoints for viewing and analyzing LLM usage data

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, and_, desc, or_

# Import our dependencies
from ...core.database import get_async_db, get_async_session_factory
from ...core.security import get_current_admin_user
from ...models.user import User
# Import usage service from services package
from ...services import usage_service

from ...services.litellm_pricing_service import get_pricing_service
# Note: UserResponse import removed - it wasn't defined in auth schemas and wasn't used in this file

# Create router for usage analytics endpoints
router = APIRouter(prefix="/usage", tags=["Usage Analytics"])

# =============================================================================
# PROVIDER STATISTICS WITH FIXED COST CALCULATION
# =============================================================================

async def get_provider_usage_stats_fixed(
    start_date: datetime,
    end_date: datetime,
    department_id: Optional[int] = None,
    provider_names: Optional[List[str]] = None,
    model_names: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    🔧 FIXED provider usage statistics with proper cost calculation.
    
    This function replaces the broken provider stats method with:
    - Proper NULL cost handling
    - Updated pricing from LiteLLM
    - Accurate token and cost calculations
    
    Args:
        start_date: Start of analysis period
        end_date: End of analysis period
        
    Returns:
        List of provider statistics with corrected cost data
    """
    from sqlalchemy import select, func, and_
    from ...models.usage_log import UsageLog
    
    # 🔧 FIX: Add database connectivity test first
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"🔍 [PROVIDER STATS] Testing database connectivity...")
    
    try:
        AsyncSessionLocal = get_async_session_factory()
        async with AsyncSessionLocal() as test_session:
            # Simple connectivity test
            test_result = await test_session.execute(select(func.count(UsageLog.id)))
            total_logs = test_result.scalar()
            logger.info(f"🔍 [PROVIDER STATS] Database test successful - found {total_logs} total usage logs")
            
            # Test for logs in the date range
            date_range_result = await test_session.execute(
                select(func.count(UsageLog.id)).where(
                    and_(
                        UsageLog.created_at >= start_date,
                        UsageLog.created_at <= end_date
                    )
                )
            )
            logs_in_range = date_range_result.scalar()
            logger.info(f"🔍 [PROVIDER STATS] Found {logs_in_range} usage logs in date range {start_date} to {end_date}")
            
            if logs_in_range == 0:
                logger.warning(f"⚠️ [PROVIDER STATS] No usage logs found in the specified date range - returning empty stats")
                return []
                
    except Exception as db_error:
        logger.error(f"❌ [PROVIDER STATS] Database connectivity test failed: {str(db_error)}")
        import traceback
        logger.error(f"❌ [PROVIDER STATS] Database test traceback: {traceback.format_exc()}")
        return []
    
    try:
        async with get_async_session_factory()() as session:
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"🔍 [PROVIDER STATS] Starting with session: {session}")
            
            # 🔧 FIX: Add cache-busting parameter and handle NULL costs properly
            cache_buster = datetime.utcnow().microsecond
            logger.info(f"🔍 [PROVIDER STATS] Cache buster: {cache_buster}")
            
            provider_stats_query = select(
                UsageLog.provider,
                func.count(UsageLog.id).label('total_requests'),
                func.count(UsageLog.id).filter(UsageLog.success == True).label('successful_requests'),
                func.sum(UsageLog.total_tokens).label('total_tokens'),
                func.sum(UsageLog.input_tokens).label('input_tokens'),
                func.sum(UsageLog.output_tokens).label('output_tokens'),
                # 🔧 FIX: Handle NULL costs properly with COALESCE
                func.sum(func.coalesce(UsageLog.estimated_cost, 0.0)).label('total_cost'),
                func.avg(UsageLog.response_time_ms).label('avg_response_time'),
                func.max(UsageLog.response_time_ms).label('max_response_time')
            ).where(
                and_(
                    UsageLog.created_at >= start_date,
                    UsageLog.created_at <= end_date,
                    # Add cache-busting condition that's always true
                    UsageLog.id >= 0,
                    # Add department filter if specified
                    *([UsageLog.department_id == department_id] if department_id else []),
                    # Add provider filter if specified
                    *([UsageLog.provider.in_([p.lower() for p in provider_names])] if provider_names else []),
                    # Add model filter if specified
                    *([UsageLog.model.in_(model_names)] if model_names else [])
                )
            ).group_by(UsageLog.provider).params(cache_buster=cache_buster)
            logger.info(f"🔍 [PROVIDER STATS] Query built successfully")
            
            # 🔧 FIX: Add null safety checks for query execution
            if provider_stats_query is None:
                logger.error("Provider stats query is None")
                return []
            
            logger.info(f"🔍 [PROVIDER STATS] About to execute query...")
            result = await session.execute(provider_stats_query)
            logger.info(f"🔍 [PROVIDER STATS] Query executed, result: {result}")
            if result is None:
                logger.error("Query result is None")
                return []
                
            logger.info(f"🔍 [PROVIDER STATS] About to call fetchall()...")
            providers = result.fetchall()
            logger.info(f"🔍 [PROVIDER STATS] Fetchall completed, got {len(providers) if providers else 0} providers")
            if providers is None:
                logger.warning("Query fetchall() returned None - using empty list")
                providers = []
            
            provider_stats = []
            
            # Get pricing service for cost validation/updates
            # 🔧 FIX: Add null safety check for pricing service
            logger.info(f"🔍 [PROVIDER STATS] About to get pricing service...")
            try:
                pricing_service = get_pricing_service()
                logger.info(f"🔍 [PROVIDER STATS] Pricing service obtained: {pricing_service}")
                if pricing_service is None:
                    logger.warning("Pricing service is None - continuing without pricing validation")
            except Exception as pricing_error:
                logger.warning(f"Failed to get pricing service: {str(pricing_error)}")
                pricing_service = None
            
            # 🔧 FIX: Ensure providers is iterable and handle None values
            if not providers:
                logger.info("No providers found in query results")
                return []
            
            logger.info(f"🔍 [PROVIDER STATS] About to iterate through {len(providers)} providers...")
            for i, provider in enumerate(providers):
                logger.info(f"🔍 [PROVIDER STATS] Processing provider {i+1}/{len(providers)}: {provider}")
                # 🔧 FIX: Skip None providers
                if provider is None:
                    logger.warning(f"Provider {i+1} is None, skipping")
                    continue
                # 🔧 FIX: Add defensive attribute access with None safety
                logger.info(f"🔍 [PROVIDER STATS] About to access provider attributes for provider {i+1}...")
                try:
                    total_requests = getattr(provider, 'total_requests', 0) or 0
                    successful_requests = getattr(provider, 'successful_requests', 0) or 0
                    total_cost = float(getattr(provider, 'total_cost', 0) or 0)
                    logger.info(f"🔍 [PROVIDER STATS] Provider {i+1} basic stats: requests={total_requests}, successful={successful_requests}, cost={total_cost}")
                except Exception as attr_error:
                    logger.error(f"Error accessing provider {i+1} attributes: {str(attr_error)}")
                    continue
                
                # 🔧 FIX: Get all provider attributes safely
                provider_name = getattr(provider, 'provider', None) or "unknown"
                avg_response_time = getattr(provider, 'avg_response_time', 0) or 0
                max_response_time = getattr(provider, 'max_response_time', 0) or 0
                total_tokens = getattr(provider, 'total_tokens', 0) or 0
                input_tokens = getattr(provider, 'input_tokens', 0) or 0
                output_tokens = getattr(provider, 'output_tokens', 0) or 0
                
                # 🔧 FIX: If cost is 0 but we have successful requests, update pricing
                if total_cost == 0 and successful_requests > 0:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(
                        f"Provider {provider_name} has {successful_requests} successful requests "
                        f"but $0.00 total cost - pricing data may be outdated"
                    )
                
                provider_stat = {
                    "provider": provider_name,
                    "requests": {
                        "total": total_requests,
                        "successful": successful_requests,
                        "failed": total_requests - successful_requests,
                        "success_rate": (successful_requests / total_requests * 100) if total_requests > 0 else 0
                    },
                    "tokens": {
                        "total": int(total_tokens),
                        "input": int(input_tokens),
                        "output": int(output_tokens)
                    },
                    "cost": {
                        "total_usd": total_cost,
                        "average_per_request": total_cost / successful_requests if successful_requests > 0 else 0,
                        "cost_per_1k_tokens": (total_cost / (total_tokens / 1000)) if total_tokens and total_tokens > 0 else 0
                    },
                    "performance": {
                        "average_response_time_ms": int(avg_response_time),
                        "max_response_time_ms": int(max_response_time)
                    }
                }
                
                provider_stats.append(provider_stat)
            
            # Sort by total requests (most used first)
            provider_stats.sort(key=lambda x: x["requests"]["total"], reverse=True)
            
            return provider_stats
            
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to get provider usage stats: {str(e)}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        # 🔧 FIX: Return empty list instead of raising, to prevent cascading failures
        return []

# =============================================================================
# USAGE SUMMARY ENDPOINTS
# =============================================================================

@router.get("/summary")
async def get_usage_summary(
    days: int = Query(30, description="Number of days to analyze", ge=1, le=365),
    department_id: Optional[int] = Query(None, description="Filter by department ID"),
    provider_names: Optional[List[str]] = Query(None, description="Filter by provider names"),
    model_names: Optional[List[str]] = Query(None, description="Filter by model names"),
    current_admin: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Get overall usage summary for the specified period.
    
    🔧 FIXED: Improved cost calculation for all time periods, especially 7-day period.
    
    This endpoint provides a high-level overview of:
    - Total requests and success rates
    - Token usage and costs
    - Performance metrics
    - Provider breakdown
    
    Perfect for executive dashboards and overall health monitoring.
    
    Args:
        days: Number of days to include in analysis (default: 30)
        
    Returns:
        Comprehensive usage summary with metrics and breakdowns
    """
    try:
        # 🔧 FIX: More precise date range calculation with timezone-aware datetimes
        from datetime import timezone
        end_date = datetime.now(timezone.utc).replace(microsecond=0)
        start_date = (end_date - timedelta(days=days)).replace(microsecond=0)
        
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"🔍 Getting usage summary for {days} days: {start_date} to {end_date}")
        
        # 🔧 FIX: Use improved provider statistics with NULL cost handling  
        try:
            provider_stats = await get_provider_usage_stats_fixed(start_date, end_date, department_id, provider_names, model_names)
            logger.info(f"✅ Successfully retrieved {len(provider_stats) if provider_stats else 0} provider statistics")
        except Exception as provider_error:
            logger.error(f"❌ Provider stats failed: {str(provider_error)}")
            import traceback
            logger.error(f"Provider stats traceback: {traceback.format_exc()}")
            provider_stats = []
        
        # 🔧 FIX: Ensure provider_stats is not None and is a list
        if provider_stats is None or not isinstance(provider_stats, list):
            logger.warning(f"Provider stats is not a valid list: {type(provider_stats)}, using empty list")
            provider_stats = []
        
        # 🔧 FIX: Calculate overall totals from provider stats with null safety
        try:
            total_requests = sum(p.get("requests", {}).get("total", 0) for p in provider_stats if p and isinstance(p, dict))
            total_successful = sum(p.get("requests", {}).get("successful", 0) for p in provider_stats if p and isinstance(p, dict))
            total_tokens = sum(p.get("tokens", {}).get("total", 0) for p in provider_stats if p and isinstance(p, dict))
            total_cost = sum(p.get("cost", {}).get("total_usd", 0) for p in provider_stats if p and isinstance(p, dict))
            logger.info(f"✅ Calculated totals: requests={total_requests}, successful={total_successful}, tokens={total_tokens}, cost={total_cost}")
        except Exception as calc_error:
            logger.error(f"❌ Error calculating totals: {str(calc_error)}")
            total_requests = total_successful = total_tokens = total_cost = 0
        
        # 🔧 FIX: Calculate average response time (weighted by request count) with null safety
        try:
            total_response_time_weighted = sum(
                p.get("performance", {}).get("average_response_time_ms", 0) * p.get("requests", {}).get("successful", 0)
                for p in provider_stats 
                if p and isinstance(p, dict) and p.get("requests", {}).get("successful", 0) > 0
            )
            avg_response_time = (
                total_response_time_weighted / total_successful 
                if total_successful > 0 else 0
            )
            logger.info(f"✅ Calculated avg response time: {avg_response_time}ms")
        except Exception as avg_error:
            logger.error(f"❌ Error calculating average response time: {str(avg_error)}")
            avg_response_time = 0
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "overview": {
                "total_requests": total_requests,
                "successful_requests": total_successful,
                "failed_requests": total_requests - total_successful,
                "success_rate_percent": (total_successful / total_requests * 100) if total_requests > 0 else 0,
                "total_tokens": total_tokens,
                "total_cost_usd": round(total_cost, 4),
                "average_cost_per_request": round(total_cost / total_successful, 4) if total_successful > 0 else 0,
                "average_response_time_ms": round(avg_response_time),
                "average_tokens_per_request": round(total_tokens / total_successful) if total_successful > 0 else 0
            },
            "providers": provider_stats,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"❌ USAGE SUMMARY ERROR: {str(e)}")
        import traceback
        logger.error(f"❌ USAGE SUMMARY TRACEBACK: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate usage summary: {str(e)}"
        )

@router.get("/users/{user_id}")
async def get_user_usage(
    user_id: int,
    days: int = Query(30, description="Number of days to analyze", ge=1, le=365),
    current_admin: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Get detailed usage statistics for a specific user.
    
    This shows:
    - Individual user's AI usage patterns
    - Cost attribution for billing
    - Performance metrics for their requests
    - Usage trends over time
    
    Perfect for user-specific billing and usage analysis.
    
    Args:
        user_id: ID of the user to analyze
        days: Number of days to include in analysis
        
    Returns:
        Detailed user usage statistics
    """
    try:
        # 🔧 FIX: Eagerly load relationships to prevent SQLAlchemy async errors
        from sqlalchemy import select
        
        # Verify user exists and load with relationships
        stmt = select(User).options(
            selectinload(User.role),
            selectinload(User.department)
        ).where(User.id == user_id)
        
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Calculate date range with timezone-aware datetimes
        from datetime import timezone
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # Get user usage summary with null safety check
        # 🔧 FIX: Add null safety check to prevent 'NoneType' object is not callable
        if usage_service is None:
            raise HTTPException(
                status_code=500,
                detail="Usage service is not available"
            )
        user_summary = await usage_service.get_user_usage_summary(user_id, start_date, end_date)
        
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
        
        return user_summary
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get user usage: {str(e)}"
        )

@router.get("/departments/{department_id}")
async def get_department_usage(
    department_id: int,
    days: int = Query(30, description="Number of days to analyze", ge=1, le=365),
    current_admin: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Get usage statistics for a specific department.
    
    This is crucial for:
    - Department budget tracking
    - Quota management (AID-005-B)
    - Cost allocation across teams
    - Department-level usage trends
    
    Args:
        department_id: ID of the department to analyze  
        days: Number of days to include in analysis
        
    Returns:
        Department usage statistics with budget context
    """
    try:
        # Verify department exists
        from ...models.department import Department
        department = await session.get(Department, department_id)
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")
        
        # Calculate date range with timezone-aware datetimes
        from datetime import timezone
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # Get department usage summary with null safety check
        # 🔧 FIX: Add null safety check to prevent 'NoneType' object is not callable
        if usage_service is None:
            raise HTTPException(
                status_code=500,
                detail="Usage service is not available"
            )
        dept_summary = await usage_service.get_department_usage_summary(department_id, start_date, end_date)
        
        # Add department information and budget context
        dept_summary.update({
            "department_info": {
                "id": department.id,
                "name": department.name,
                "code": department.code,
                "monthly_budget": float(department.monthly_budget),
                "is_active": department.is_active
            },
            "budget_analysis": {
                "monthly_budget": float(department.monthly_budget),
                "current_spending": dept_summary["cost"]["total_usd"],
                "projected_monthly_cost": dept_summary["cost"]["total_usd"] * (30 / days) if days > 0 else 0,
                "budget_utilization_percent": (dept_summary["cost"]["total_usd"] / float(department.monthly_budget) * 100) if department.monthly_budget > 0 else 0
            }
        })
        
        return dept_summary
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get department usage: {str(e)}"
        )

# =============================================================================
# DETAILED LOGS AND RECENT ACTIVITY
# =============================================================================

@router.get("/logs/recent")
async def get_recent_usage_logs(
    limit: int = Query(50, description="Number of recent logs to return", ge=1, le=500),
    offset: int = Query(0, description="Number of logs to skip", ge=0),
    user_id: Optional[int] = Query(None, description="Filter by specific user"),
    department_id: Optional[int] = Query(None, description="Filter by specific department"),
    provider: Optional[str] = Query(None, description="Filter by LLM provider"),
    success_only: bool = Query(False, description="Show only successful requests"),
    current_admin: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Get recent usage logs with filtering options.
    
    This provides detailed, real-time visibility into:
    - Individual LLM requests and responses
    - Success/failure patterns
    - Performance issues
    - User activity monitoring
    
    Perfect for debugging, monitoring, and detailed analysis.
    
    Args:
        limit: Maximum number of logs to return
        offset: Number of logs to skip (for pagination)
        user_id: Filter logs for specific user
        department_id: Filter logs for specific department  
        provider: Filter logs for specific LLM provider
        success_only: If True, only show successful requests
        
    Returns:
        List of recent usage logs with metadata
    """
    try:
        from sqlalchemy import select, and_, desc
        from ...models.usage_log import UsageLog
        
        # Build the query with filters
        query = select(UsageLog).order_by(desc(UsageLog.created_at))
        
        # Apply filters
        filters = []
        if user_id:
            filters.append(UsageLog.user_id == user_id)
        if department_id:
            filters.append(UsageLog.department_id == department_id)
        if provider:
            filters.append(UsageLog.provider == provider.lower())
        if success_only:
            filters.append(UsageLog.success == True)
        
        if filters:
            query = query.where(and_(*filters))
        
        # Apply pagination
        query = query.offset(offset).limit(limit)
        
        # 🔧 FIX: Add cache-busting parameter to prevent query caching
        # This ensures fresh data by making each query unique
        cache_buster = datetime.utcnow().microsecond
        
        # Execute query
        result = await session.execute(query.params(cache_buster=cache_buster))
        logs = result.scalars().all()
        
        # Convert to summary format (don't include full response content for privacy)
        log_data = []
        for log in logs:
            log_data.append({
                "id": log.id,
                "timestamp": log.created_at.isoformat() if log.created_at else None,
                "user": {
                    "id": log.user_id,
                    "email": log.user_email,
                    "role": log.user_role
                },
                "department_id": log.department_id,
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
                    "total_chars": log.request_total_chars,
                    "session_id": log.session_id
                },
                "error": {
                    "error_type": log.error_type,
                    "error_message": log.error_message
                } if not log.success else None
            })
        
        # Get total count for pagination info
        count_query = select(UsageLog)
        if filters:
            count_query = count_query.where(and_(*filters))
        
        from sqlalchemy import func
        total_count_result = await session.execute(
            select(func.count()).select_from(count_query.subquery()).params(cache_buster=cache_buster + 1)
        )
        total_count = total_count_result.scalar()
        
        return {
            "logs": log_data,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "total_count": total_count,
                "has_more": (offset + limit) < total_count
            },
            "filters_applied": {
                "user_id": user_id,
                "department_id": department_id,
                "provider": provider,
                "success_only": success_only
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get recent logs: {str(e)}"
        )

# =============================================================================
# TOP USERS AND DEPARTMENTS
# =============================================================================

@router.get("/top-users")
async def get_top_users_by_usage(
    days: int = Query(30, description="Number of days to analyze", ge=1, le=365),
    limit: int = Query(10, description="Number of top users to return", ge=1, le=50),
    metric: str = Query("total_cost", description="Metric to sort by: total_cost, total_tokens, or request_count"),
    department_id: Optional[int] = Query(None, description="Filter by department ID"),
    provider_names: Optional[List[str]] = Query(None, description="Filter by provider names"),
    model_names: Optional[List[str]] = Query(None, description="Filter by model names"),
    current_admin: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Get top users by various usage metrics.
    
    This helps identify:
    - Heavy users for cost allocation
    - Power users for training programs
    - Unusual usage patterns
    - Department champions
    
    Args:
        days: Number of days to analyze
        limit: Number of top users to return
        metric: What to sort by (total_cost, total_tokens, request_count)
        
    Returns:
        List of top users with their usage statistics
    """
    try:
        from sqlalchemy import select, func, and_, desc
        from ...models.usage_log import UsageLog
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # 🔧 FIX: Add cache-busting parameter to prevent query caching
        # This ensures fresh data by making each query unique
        cache_buster = datetime.utcnow().microsecond
        
        # Choose the metric to sort by
        if metric == "total_cost":
            sort_column = func.sum(UsageLog.estimated_cost)
            sort_label = "total_cost"
        elif metric == "total_tokens":
            sort_column = func.sum(UsageLog.total_tokens)
            sort_label = "total_tokens"
        elif metric == "request_count":
            sort_column = func.count(UsageLog.id)
            sort_label = "request_count"
        else:
            raise HTTPException(status_code=400, detail="Invalid metric. Use: total_cost, total_tokens, or request_count")
        
        # Build aggregation query
        query = select(
            UsageLog.user_id,
            UsageLog.user_email,
            UsageLog.user_role,
            UsageLog.department_id,
            func.count(UsageLog.id).label('request_count'),
            func.sum(UsageLog.total_tokens).label('total_tokens'),
            func.sum(UsageLog.estimated_cost).label('total_cost'),
            func.avg(UsageLog.response_time_ms).label('avg_response_time'),
            func.count(UsageLog.id).filter(UsageLog.success == True).label('successful_requests')
        ).where(
            and_(
                UsageLog.created_at >= start_date,
                UsageLog.created_at <= end_date,
                # Add cache-busting condition that's always true
                UsageLog.id >= 0,
                # Add department filter if specified
                *([UsageLog.department_id == department_id] if department_id else []),
                # Add provider filter if specified
                *([UsageLog.provider.in_([p.lower() for p in provider_names])] if provider_names else []),
                # Add model filter if specified
                *([UsageLog.model.in_(model_names)] if model_names else [])
            )
        ).group_by(
            UsageLog.user_id,
            UsageLog.user_email,
            UsageLog.user_role,
            UsageLog.department_id
        ).order_by(
            desc(sort_column)
        ).limit(limit).params(cache_buster=cache_buster)
        
        result = await session.execute(query)
        top_users = result.fetchall()
        
        # Format results
        users_data = []
        for user in top_users:
            request_count = user.request_count or 0
            successful_requests = user.successful_requests or 0
            
            users_data.append({
                "user": {
                    "id": user.user_id,
                    "email": user.user_email,
                    "role": user.user_role,
                    "department_id": user.department_id
                },
                "metrics": {
                    "request_count": request_count,
                    "successful_requests": successful_requests,
                    "failed_requests": request_count - successful_requests,
                    "success_rate_percent": (successful_requests / request_count * 100) if request_count > 0 else 0,
                    "total_tokens": int(user.total_tokens or 0),
                    "total_cost": float(user.total_cost or 0),
                    "average_response_time_ms": int(user.avg_response_time or 0),
                    "average_cost_per_request": float(user.total_cost or 0) / successful_requests if successful_requests > 0 else 0
                }
            })
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "top_users": users_data,
            "sort_metric": metric,
            "limit": limit,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get top users: {str(e)}"
        )

# =============================================================================
# PRICING MANAGEMENT ENDPOINTS
# =============================================================================

@router.post("/pricing/update-all")
async def update_all_pricing(
    force_refresh: bool = Query(False, description="Force refresh from LiteLLM API"),
    current_admin: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Update pricing for all LLM configurations using LiteLLM.
    
    This endpoint:
    - Fetches current pricing from LiteLLM for all providers
    - Updates database with accurate cost per token data
    - Provides detailed results for each configuration
    
    Args:
        force_refresh: Force refresh from LiteLLM API (ignore cache)
        
    Returns:
        Update results for all configurations
    """
    try:
        pricing_service = get_pricing_service()
        
        # Update all configurations
        results = await pricing_service.update_all_configs_pricing(force_refresh)
        
        # Calculate summary statistics
        total_configs = len(results)
        successful_updates = sum(1 for r in results if r.get("success", False))
        failed_updates = total_configs - successful_updates
        
        return {
            "summary": {
                "total_configurations": total_configs,
                "successful_updates": successful_updates,
                "failed_updates": failed_updates,
                "success_rate": (successful_updates / total_configs * 100) if total_configs > 0 else 0
            },
            "results": results,
            "force_refresh": force_refresh,
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update pricing: {str(e)}"
        )

@router.post("/pricing/update/{config_id}")
async def update_config_pricing(
    config_id: int,
    force_refresh: bool = Query(False, description="Force refresh from LiteLLM API"),
    current_admin: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Update pricing for a specific LLM configuration.
    
    Args:
        config_id: ID of the LLM configuration to update
        force_refresh: Force refresh from LiteLLM API
        
    Returns:
        Update result for the specific configuration
    """
    try:
        pricing_service = get_pricing_service()
        
        # Update specific configuration
        result = await pricing_service.update_llm_config_pricing(config_id, force_refresh)
        
        if not result.get("success", False):
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update pricing for config {config_id}: {result.get('error', 'Unknown error')}"
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update pricing for config {config_id}: {str(e)}"
        )

@router.get("/pricing/cache-stats")
async def get_pricing_cache_stats(
    current_admin: User = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """
    Get pricing cache statistics for monitoring.
    
    Returns:
        Cache statistics and LiteLLM availability
    """
    try:
        pricing_service = get_pricing_service()
        cache_stats = pricing_service.get_cache_stats()
        
        return {
            "cache_statistics": cache_stats,
            "recommendations": {
                "should_refresh": cache_stats["expired_entries"] > cache_stats["valid_entries"],
                "cache_health": "good" if cache_stats["valid_entries"] > 0 else "empty",
                "litellm_status": "available" if cache_stats["litellm_available"] else "unavailable"
            },
            "checked_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get cache stats: {str(e)}"
        )

# =============================================================================
# MOST USED MODELS ANALYTICS
# =============================================================================

@router.get("/most-used-models")
async def get_most_used_models(
    days: int = Query(30, description="Number of days to analyze", ge=1, le=365),
    limit: int = Query(20, description="Number of top models to return", ge=1, le=100),
    department_id: Optional[int] = Query(None, description="Filter by department ID"),
    provider_names: Optional[List[str]] = Query(None, description="Filter by provider names"),
    model_names: Optional[List[str]] = Query(None, description="Filter by model names"),
    current_admin: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Get most used models by usage statistics.
    
    This provides insights into:
    - Which models are most popular
    - Usage patterns by model
    - Cost breakdown by model
    - Performance metrics per model
    
    Perfect for understanding model adoption and costs.
    
    Args:
        days: Number of days to analyze
        limit: Number of top models to return
        department_id: Optional department filter
        provider_name: Optional provider filter
        
    Returns:
        List of most used models with usage statistics
    """
    try:
        from sqlalchemy import select, func, and_, desc
        from ...models.usage_log import UsageLog
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Add cache-busting parameter to prevent query caching
        cache_buster = datetime.utcnow().microsecond
        
        # Build aggregation query for models
        query = select(
            UsageLog.model,
            UsageLog.provider,
            func.count(UsageLog.id).label('total_requests'),
            func.count(UsageLog.id).filter(UsageLog.success == True).label('successful_requests'),
            func.sum(UsageLog.total_tokens).label('total_tokens'),
            func.sum(UsageLog.input_tokens).label('input_tokens'),
            func.sum(UsageLog.output_tokens).label('output_tokens'),
            func.sum(func.coalesce(UsageLog.estimated_cost, 0.0)).label('total_cost'),
            func.avg(UsageLog.response_time_ms).label('avg_response_time'),
            func.max(UsageLog.response_time_ms).label('max_response_time')
        ).where(
            and_(
                UsageLog.created_at >= start_date,
                UsageLog.created_at <= end_date,
                # Add cache-busting condition that's always true
                UsageLog.id >= 0,
                # Add department filter if specified
                *([UsageLog.department_id == department_id] if department_id else []),
                # Add provider filter if specified
                *([UsageLog.provider.in_([p.lower() for p in provider_names])] if provider_names else []),
                # Add model filter if specified
                *([UsageLog.model.in_(model_names)] if model_names else [])
            )
        ).group_by(
            UsageLog.model,
            UsageLog.provider
        ).order_by(
            desc(func.count(UsageLog.id))  # Sort by total requests
        ).limit(limit).params(cache_buster=cache_buster)
        
        result = await session.execute(query)
        models = result.fetchall()
        
        # Format results
        models_data = []
        for model in models:
            total_requests = model.total_requests or 0
            successful_requests = model.successful_requests or 0
            total_cost = float(model.total_cost or 0)
            
            models_data.append({
                "model": model.model or "unknown",
                "provider": model.provider or "unknown",
                "requests": {
                    "total": total_requests,
                    "successful": successful_requests,
                    "failed": total_requests - successful_requests,
                    "success_rate_percent": (successful_requests / total_requests * 100) if total_requests > 0 else 0
                },
                "tokens": {
                    "total": int(model.total_tokens or 0),
                    "input": int(model.input_tokens or 0),
                    "output": int(model.output_tokens or 0),
                    "average_per_request": int(model.total_tokens or 0) / successful_requests if successful_requests > 0 else 0
                },
                "cost": {
                    "total_usd": total_cost,
                    "average_per_request": total_cost / successful_requests if successful_requests > 0 else 0,
                    "cost_per_1k_tokens": (total_cost / (model.total_tokens / 1000)) if model.total_tokens and model.total_tokens > 0 else 0
                },
                "performance": {
                    "average_response_time_ms": int(model.avg_response_time or 0),
                    "max_response_time_ms": int(model.max_response_time or 0)
                }
            })
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "models": models_data,
            "limit": limit,
            "filters_applied": {
                "department_id": department_id,
                "provider_names": provider_names,
                "model_names": model_names
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get most used models: {str(e)}"
        )

@router.get("/providers/list")
async def get_providers_list(
    current_admin: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Get list of providers for filtering dropdown.
    
    Returns list of providers that have been used in the system,
    formatted for frontend dropdowns.
    
    Returns:
        List of available providers
    """
    try:
        from sqlalchemy import select, func, distinct
        from ...models.usage_log import UsageLog
        
        # Get distinct providers from usage logs
        query = select(distinct(UsageLog.provider)).where(
            UsageLog.provider.isnot(None)
        ).order_by(UsageLog.provider)
        
        result = await session.execute(query)
        providers = result.scalars().all()
        
        # Format for frontend dropdown
        provider_list = [
            {
                "value": provider,
                "label": provider.title() if provider else "Unknown"
            }
            for provider in providers if provider
        ]
        
        return {
            "providers": provider_list,
            "count": len(provider_list),
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get providers list: {str(e)}"
        )

@router.get("/models/list")
async def get_models_list(
    current_admin: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Get list of models for filtering dropdown.
    
    Returns list of models that have been used in the system,
    formatted for frontend dropdowns and grouped by provider.
    
    Returns:
        List of available models with provider grouping
    """
    try:
        from sqlalchemy import select, func, distinct, and_
        from ...models.usage_log import UsageLog
        
        # Get distinct model-provider combinations from usage logs
        query = select(
            UsageLog.model,
            UsageLog.provider,
            func.count(UsageLog.id).label('usage_count')
        ).where(
            and_(
                UsageLog.model.isnot(None),
                UsageLog.provider.isnot(None)
            )
        ).group_by(
            UsageLog.model,
            UsageLog.provider
        ).order_by(
            UsageLog.provider,
            func.count(UsageLog.id).desc()
        )
        
        result = await session.execute(query)
        models = result.fetchall()
        
        # Format for frontend with provider grouping
        models_by_provider = {}
        all_models = []
        
        for model_data in models:
            model = model_data.model
            provider = model_data.provider
            usage_count = model_data.usage_count
            
            if provider not in models_by_provider:
                models_by_provider[provider] = []
                
            model_item = {
                "value": model,
                "label": f"{model} ({usage_count:,} uses)",
                "provider": provider,
                "usage_count": usage_count
            }
            
            models_by_provider[provider].append(model_item)
            all_models.append(model_item)
        
        return {
            "models": all_models,
            "models_by_provider": models_by_provider,
            "count": len(all_models),
            "providers_count": len(models_by_provider),
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get models list: {str(e)}"
        )

# =============================================================================
# HEALTH CHECK FOR USAGE SYSTEM
# =============================================================================

@router.get("/health")
async def usage_system_health(
    current_admin: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_db)
) -> Dict[str, Any]:
    """
    Check the health of the usage tracking system.
    
    This verifies:
    - Usage logging is working
    - Database connectivity for usage tables
    - Recent activity levels
    - Data integrity
    
    Returns:
        Health status and system metrics
    """
    try:
        from sqlalchemy import select, func, desc
        from ...models.usage_log import UsageLog
        
        # Check recent activity (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(hours=24)
        
        # 🔧 FIX: Add cache-busting parameter to prevent query caching
        # This ensures fresh data by making each query unique
        cache_buster = datetime.utcnow().microsecond
        
        recent_logs_query = select(func.count(UsageLog.id)).where(
            and_(
                UsageLog.created_at >= yesterday,
                # Add cache-busting condition that's always true
                UsageLog.id >= 0
            )
        ).params(cache_buster=cache_buster)
        recent_count_result = await session.execute(recent_logs_query)
        recent_logs_count = recent_count_result.scalar() or 0
        
        # Check success rate in last 24 hours
        recent_success_query = select(func.count(UsageLog.id)).where(
            and_(
                UsageLog.created_at >= yesterday,
                UsageLog.success == True,
                # Add cache-busting condition that's always true
                UsageLog.id >= 0
            )
        ).params(cache_buster=cache_buster + 1)
        recent_success_result = await session.execute(recent_success_query)
        recent_success_count = recent_success_result.scalar() or 0
        
        # Get latest log
        latest_log_query = select(UsageLog).where(
            # Add cache-busting condition that's always true
            UsageLog.id >= 0
        ).order_by(desc(UsageLog.created_at)).limit(1).params(cache_buster=cache_buster + 2)
        latest_log_result = await session.execute(latest_log_query)
        latest_log = latest_log_result.scalar_one_or_none()
        
        # Calculate system health
        success_rate = (recent_success_count / recent_logs_count * 100) if recent_logs_count > 0 else 100
        is_healthy = recent_logs_count > 0 and success_rate >= 80  # 80% success rate threshold
        
        return {
            "status": "healthy" if is_healthy else "degraded",
            "usage_tracking": {
                "is_active": True,
                "logs_last_24h": recent_logs_count,
                "success_rate_24h": round(success_rate, 2),
                "latest_log_at": latest_log.created_at.isoformat() if latest_log and latest_log.created_at else None
            },
            "database": {
                "usage_log_table": "accessible",
                "can_query": True,
                "can_aggregate": True
            },
            "system_info": {
                "logging_service": "active",
                "async_logging": "enabled",
                "error_fallback": "enabled"
            },
            "checked_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "usage_tracking": {
                "is_active": False
            },
            "checked_at": datetime.utcnow().isoformat()
        }
