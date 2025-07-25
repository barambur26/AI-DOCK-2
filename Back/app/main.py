# AI Dock Backend - Main FastAPI Application
# This is the "entry point" of our backend - like main() in a program

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import logging
import os
from pathlib import Path

# Import our database and configuration
from .core.config import settings, validate_config
from .core.database import startup_database, shutdown_database, check_database_connection


# Initialize Sentry error monitoring
if os.getenv('SENTRY_DSN'):
    sentry_sdk.init(
        dsn=os.getenv('SENTRY_DSN'),
        integrations=[
            FastApiIntegration(),
            StarletteIntegration(),
            SqlalchemyIntegration(),
        ],
        traces_sample_rate=1.0 if settings.debug else 0.1,
        send_default_pii=settings.debug,  # Only send PII in debug mode
        environment=settings.environment,
        release=settings.app_version,
    )
    logger = logging.getLogger(__name__)
    logger.info(f"🔍 Sentry initialized for environment: {settings.environment}")
else:
    logger = logging.getLogger(__name__)
    logger.info("🔍 Sentry DSN not configured - error monitoring disabled")

# Import our security middleware
from .middleware.security import SecurityHeadersMiddleware, create_security_test_response

# Import our API routers
from .api.auth import router as auth_router
from .api.admin.users import router as admin_users_router
from .api.admin.llm_configs import router as admin_llm_configs_router
from .api.admin.quotas import router as admin_quotas_router
from .api.chat import router as chat_router
from .api.chat_streaming import router as chat_streaming_router  # 🆕 NEW: Streaming chat
# 🔧 FIXED: Project routers are imported below where they're used

# Setup logging
logging.basicConfig(level=logging.INFO)
if 'logger' not in locals():
    logger = logging.getLogger(__name__)

# Create our FastAPI application instance
# Think of this as creating a "web server" object
app = FastAPI(
    title=settings.app_name,
    description="Secure internal LLM gateway for enterprises", 
    version=settings.app_version,
    # This creates automatic documentation at /docs
    docs_url="/docs",
    redoc_url="/redoc",
    debug=settings.debug
)

# =============================================================================
# SECURITY MIDDLEWARE - MUST BE FIRST!
# =============================================================================

# Security Headers Middleware - adds protection against common attacks
# This MUST be added before other middleware to ensure security headers
# are applied to all responses, including error responses from other middleware
app.add_middleware(
    SecurityHeadersMiddleware,
    environment=settings.environment  # Production vs development security
)

# CORS Middleware - allows our React frontend to talk to this backend
# Without this, browsers block requests between different ports
# Note: CORS is added AFTER security so security headers are applied to CORS responses
logger.info(f"🌐 Configuring CORS for frontend: {settings.frontend_url}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:8080", 
        "http://localhost:3000",
        "http://127.0.0.1:8080",  # Alternative localhost format
        "http://127.0.0.1:3000"   # Alternative localhost format
    ],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (includes OPTIONS for preflight)
    allow_headers=["*"],  # Allow all headers for maximum compatibility
    expose_headers=["*"],  # Expose all headers to frontend
    max_age=86400,  # Cache preflight response for 24 hours
)

# =============================================================================
# STATIC FILE SERVING - Serve React Frontend
# =============================================================================

# Define static file paths
STATIC_DIR = Path(__file__).parent.parent / "static"
STATIC_INDEX = STATIC_DIR / "index.html"

# Serve static files for React frontend (if they exist)
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
    logger.info(f"📁 Serving static files from: {STATIC_DIR}")
else:
    logger.info("📁 Static directory not found - frontend not built")

# Health check endpoint - like a "ping" to see if the server is alive
# This is often the first endpoint you create in any API
# Basic status endpoint (no database required) - useful for Railway debugging
@app.get("/status")
async def status_check():
    """
    Basic status check without database dependency.
    Useful for Railway deployment debugging.
    """
    return {
        "status": "running",
        "message": "AI Dock API is alive! 📡",
        "version": settings.app_version,
        "environment": settings.environment,
        "port": settings.api_port,
        "debug_mode": settings.debug,
        "railway_detected": bool(os.getenv("RAILWAY_ENVIRONMENT")),
        "database_url_configured": bool(os.getenv("DATABASE_URL"))
    }

# Health check endpoint - like a "ping" to see if the server is alive
# This is often the first endpoint you create in any API
@app.get("/health")
async def health_check():
    """
    Enhanced health check endpoint.
    Returns API status and database connectivity.
    """
    # Check database connection
    db_healthy = await check_database_connection()
    
    return {
        "status": "healthy" if db_healthy else "degraded",
        "message": "AI Dock API is running! 🚀",
        "version": settings.app_version,
        "environment": settings.environment,
        "database": "connected" if db_healthy else "disconnected",
        "debug_mode": settings.debug,
        "security_enabled": True  # Indicates security middleware is active
    }

# Security test endpoint - verify security headers are working
@app.get("/security/test")
async def security_test():
    """
    Test endpoint to verify security headers are being applied.
    
    This endpoint returns information about security features and
    allows you to inspect the response headers to confirm protection
    is active. Check the browser's developer tools Network tab to
    see the security headers in the response.
    
    Learning: This is a great way to test middleware functionality!
    """
    return create_security_test_response()

# CORS test endpoint - verify CORS configuration is working
@app.get("/cors/test")
@app.post("/cors/test")
@app.options("/cors/test")
async def cors_test():
    """
    Test endpoint to verify CORS configuration is working properly.
    
    This endpoint accepts GET, POST, and OPTIONS requests to test
    that CORS preflight requests are handled correctly.
    
    Learning: CORS issues often happen during preflight (OPTIONS) requests!
    """
    return {
        "message": "CORS is working! 🌍",
        "cors_config": {
            "allowed_origins": [
                settings.frontend_url,
                "http://localhost:8080",
                "http://localhost:3000",
                "http://127.0.0.1:8080",
                "http://127.0.0.1:3000"
            ],
            "methods_allowed": "All methods (*)",
            "headers_allowed": "All headers (*)",
            "credentials_allowed": True
        },
        "test_instructions": "Make a POST request to this endpoint from your frontend to test CORS"
    }

# Sentry test endpoint - verify Sentry error monitoring is working
@app.get("/sentry/test")
async def sentry_test(
    error: bool = Query(False, description="Trigger a test error"),
    exception: bool = Query(False, description="Trigger a test exception")
):
    """
    Test endpoint to verify Sentry error monitoring is working.
    
    This endpoint can trigger different types of events to test Sentry integration:
    - GET /sentry/test - Returns Sentry configuration status
    - GET /sentry/test?error=true - Triggers a test error
    - GET /sentry/test?exception=true - Triggers a test exception
    """
    
    if error:
        # Trigger a test error for Sentry
        import sentry_sdk
        sentry_sdk.capture_message("Test error from AI Dock API", level="error")
        return {"message": "Test error sent to Sentry! 🔍"}
    
    if exception:
        # Trigger a test exception for Sentry
        raise Exception("Test exception from AI Dock API for Sentry monitoring")
    
    # Return Sentry configuration status
    sentry_enabled = bool(os.getenv('SENTRY_DSN'))
    return {
        "message": "Sentry monitoring endpoint 🔍",
        "sentry_enabled": sentry_enabled,
        "environment": settings.environment,
        "test_options": {
            "trigger_error": "GET /sentry/test?error=true",
            "trigger_exception": "GET /sentry/test?exception=true"
        },
        "instructions": "Use the test options to verify Sentry is capturing errors properly"
    }

# =============================================================================
# API ROUTERS
# =============================================================================

# Include authentication endpoints
# This adds all /auth/* endpoints to our application
app.include_router(auth_router)

# Include admin user management endpoints
# This adds all /admin/users/* endpoints to our application
app.include_router(
    admin_users_router,
    prefix="/admin",
    tags=["Admin"]
)

# Include admin LLM configuration endpoints
# This adds all /admin/llm-configs/* endpoints to our application
app.include_router(
    admin_llm_configs_router,
    prefix="/admin",
    tags=["Admin LLM"]
)

# Include admin quota management endpoints
# This adds all /admin/quotas/* endpoints to our application
app.include_router(
    admin_quotas_router,
    prefix="/admin",
    tags=["Admin Quotas"]
)

# Include admin department management endpoints
# This adds all /admin/departments/* endpoints to our application
from .api.admin.departments import router as admin_departments_router
app.include_router(
    admin_departments_router,
    tags=["Admin Departments"]
)

# Include admin role management endpoints
# This adds all /admin/roles/* endpoints to our application
from .api.admin.roles import router as admin_roles_router
app.include_router(
    admin_roles_router,
    prefix="/admin",
    tags=["Admin Roles"]
)

# Include admin usage analytics endpoints
# This adds all /admin/usage/* endpoints to our application
from .api.admin.usage_analytics import router as admin_usage_router
app.include_router(
    admin_usage_router,
    prefix="/admin",
    tags=["Admin Usage Analytics"]
)

# Include admin pricing update endpoints
# This adds all /admin/pricing/* endpoints to our application
from .api.admin.pricing_update import router as admin_pricing_router
app.include_router(
    admin_pricing_router,
    prefix="/admin",
    tags=["Admin Pricing"]
)

# Include user usage analytics endpoints
# This adds all /usage/* endpoints to our application
from .api.usage_analytics import router as user_usage_router
app.include_router(
    user_usage_router,
    tags=["User Usage Analytics"]
)

# Include chat endpoints
# This adds all /chat/* endpoints to our application
app.include_router(chat_router)

# 🚀 Include streaming chat endpoints
# This adds streaming functionality to /chat/* endpoints
app.include_router(chat_streaming_router)

# Include manager endpoints
# This adds all /manager/* endpoints to our application
from .api.manager import router as manager_router
app.include_router(
    manager_router,
    tags=["Manager"]
)

# Include conversation endpoints
# This adds all /conversations/* endpoints to our application
from .api.conversations import router as conversations_router
app.include_router(
    conversations_router,
    tags=["Conversations"]
)

# Include file upload endpoints
# This adds all /api/files/* endpoints to our application
from .api.files import router as files_router
app.include_router(
    files_router,
    prefix="/api",
    tags=["Files"]
)

# Include assistant endpoints
# This adds all /api/assistants/* endpoints to our application
from .api.assistants import router as assistants_router, health_router_public as assistants_health_router
app.include_router(
    assistants_router,
    prefix="/api",
    tags=["Assistants"]
)
# Include assistant health endpoints (no auth required)
app.include_router(
    assistants_health_router,
    prefix="/api",
    tags=["Assistants"]
)

# Include project endpoints
# This adds all /api/projects/* endpoints to our application
# 🔧 FIXED: Import routers directly from individual files
from .api.projects.crud import router as projects_crud_router
from .api.projects.conversations import router as projects_conversations_router
from .api.projects.statistics import router as projects_statistics_router
app.include_router(
    projects_crud_router,
    prefix="/api",
    tags=["Projects"]
)
app.include_router(
    projects_conversations_router,
    prefix="/api",
    tags=["Projects"]
)
app.include_router(
    projects_statistics_router,
    prefix="/api",
    tags=["Projects"]
)

# Root endpoint - what users see when they visit the API directly
@app.get("/")
def read_root():
    """
    Welcome message for the AI Dock API.
    """
    return {
        "message": f"Welcome to {settings.app_name}! 🤖",
        "new_features": {
            "streaming_chat": "Real-time streaming responses via Server-Sent Events",
            "dynamic_models": "Live model fetching from OpenAI and other providers",
            "smart_filtering": "Intelligent model filtering to show only relevant models",
            "file_upload": "Secure file upload system for document analysis and AI processing",
            "custom_assistants": "Create personalized AI assistants with custom prompts and preferences"
        },
        "version": settings.app_version,
        "documentation": "/docs",
        "health_check": "/health",
        "environment": settings.environment,
        "available_endpoints": {
            "authentication": {
                "login": "/auth/login",
                "logout": "/auth/logout",
                "current_user": "/auth/me",
                "auth_health": "/auth/health"
            },
            "admin": {
                "user_management": "/admin/users/",
                "search_users": "/admin/users/search",
                "user_statistics": "/admin/users/statistics",
                "bulk_operations": "/admin/users/bulk",
                "llm_configurations": "/admin/llm-configs/",
                "quota_management": {
                    "quotas": "/admin/quotas/",
                    "department_status": "/admin/quotas/department/{id}/status",
                    "reset_quota": "/admin/quotas/{id}/reset",
                    "bulk_reset": "/admin/quotas/bulk/reset",
                    "analytics": "/admin/quotas/analytics/summary"
                },
                "role_management": {
                    "list_roles": "/admin/roles/list",
                    "get_all_roles": "/admin/roles/",
                    "get_role": "/admin/roles/{id}",
                    "all_permissions": "/admin/roles/permissions/all",
                    "permissions_by_category": "/admin/roles/permissions/by-category"
                },
                "usage_analytics": {
                    "summary": "/admin/usage/summary",
                    "user_usage": "/admin/usage/users/{user_id}",
                    "department_usage": "/admin/usage/departments/{department_id}",
                    "recent_logs": "/admin/usage/logs/recent",
                    "top_users": "/admin/usage/top-users",
                    "system_health": "/admin/usage/health"
                },
                "pricing_management": {
                    "refresh_config": "/admin/pricing/refresh/{config_id}",
                    "refresh_all": "/admin/pricing/refresh-all",
                    "preview_update": "/admin/pricing/preview/{config_id}",
                    "cache_stats": "/admin/pricing/cache-stats",
                    "clear_cache": "/admin/pricing/clear-cache"
                }
            },
            "chat": {
                "send_message": "/chat/send",
                "stream_message": "/chat/stream",  # 🆕 NEW: Real-time streaming
                "get_configurations": "/chat/configurations",
                "test_configuration": "/chat/test-configuration",
                "estimate_cost": "/chat/estimate-cost",
                "get_models": "/chat/models/{config_id}",
                "get_dynamic_models": "/chat/models/{config_id}/dynamic",
                "chat_health": "/chat/health",
                "streaming_health": "/chat/stream/health"  # 🆕 NEW: Streaming health check
            },
            "files": {
                "upload": "/files/upload",
                "validate": "/files/validate",
                "list_files": "/files/",
                "search_files": "/files/search",
                "download": "/files/{file_id}/download",
                "metadata": "/files/{file_id}/metadata",
                "preview": "/files/{file_id}/content-preview",
                "delete": "/files/{file_id}",
                "bulk_delete": "/files/bulk-delete",
                "statistics": "/files/statistics",
                "limits": "/files/limits",
                "health": "/files/health"
            },
            "assistants": {
                "create": "/assistants/",
                "list": "/assistants/",
                "get": "/assistants/{id}",
                "update": "/assistants/{id}",
                "delete": "/assistants/{id}",
                "search": "/assistants/search",
                "statistics": "/assistants/stats/overview",
                "conversations": "/assistants/{id}/conversations",
                "create_conversation": "/assistants/{id}/conversations",
                "bulk_operations": "/assistants/bulk",
                "health": "/assistants/health"
            },
            "manager": {
                "dashboard": "/manager/dashboard",
                "user_management": {
                    "list_users": "/manager/users/",
                    "create_user": "/manager/users/",
                    "get_user": "/manager/users/{user_id}",
                    "update_user": "/manager/users/{user_id}",
                    "activate_user": "/manager/users/{user_id}/activate",
                    "deactivate_user": "/manager/users/{user_id}/deactivate",
                    "user_statistics": "/manager/users/statistics"
                },
                "quota_management": {
                    "list_quotas": "/manager/quotas/",
                    "create_quota": "/manager/quotas/",
                    "get_quota": "/manager/quotas/{quota_id}",
                    "update_quota": "/manager/quotas/{quota_id}",
                    "reset_quota": "/manager/quotas/{quota_id}/reset",
                    "dashboard": "/manager/quotas/dashboard",
                    "statistics": "/manager/quotas/statistics"
                }
            }
        }
    }

# =============================================================================
# FRONTEND SERVING - MUST BE LAST!
# =============================================================================

# Serve React frontend for all non-API routes (catch-all route)
# This MUST be defined AFTER all API routes to avoid conflicts
if STATIC_DIR.exists() and STATIC_INDEX.exists():
    @app.get("/{path:path}")
    async def serve_frontend(path: str):
        """
        Serve React frontend for all non-API routes.
        This enables client-side routing to work properly.
        
        IMPORTANT: This route is defined LAST to ensure it doesn't
        interfere with API endpoints.
        """
        # Only serve frontend for paths that don't look like API endpoints
        if not path.startswith(("api", "auth", "admin", "manager", "chat", "health", "docs", "redoc", "openapi.json", "conversations", "files", "assistants", "projects", "usage", "static")):
            return FileResponse(str(STATIC_INDEX))
        
        # For API-like paths, return 404
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="API endpoint not found")

# =============================================================================
# APPLICATION LIFECYCLE EVENTS
# =============================================================================

@app.on_event("startup")
async def startup_event():
    """
    Initialize the application on startup.
    This runs once when the server starts.
    """
    logger.info(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"📍 Environment: {settings.environment}")
    logger.info(f"🔧 Port: {settings.api_port}")
    logger.info(f"🔧 Debug Mode: {settings.debug}")
    logger.info(f"🔧 Database Type: {'PostgreSQL' if settings.database_url.startswith(('postgresql', 'postgres')) else 'SQLite'}")
    
    # Railway-specific logging
    railway_env = os.getenv("RAILWAY_ENVIRONMENT")
    if railway_env:
        logger.info(f"🚂 Railway Environment: {railway_env}")
    if os.getenv("DATABASE_URL"):
        logger.info("🚂 Railway DATABASE_URL detected")
    
    # Validate configuration
    try:
        validate_config()
        logger.info("✅ Configuration validation passed")
    except Exception as e:
        logger.error(f"❌ Configuration validation failed: {e}")
        raise
    
    # Initialize database
    try:
        await startup_database()
        logger.info("✅ Database initialization completed")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise
    
    logger.info("🎉 Application startup completed successfully!")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Clean up resources on application shutdown.
    This runs when the server is stopping.
    """
    logger.info("🔌 Shutting down AI Dock API...")
    
    # Clean up database connections
    await shutdown_database()
    
    logger.info("✅ Application shutdown completed")

# This runs the server when you execute this file directly
# Like if __name__ == "__main__": in regular Python scripts
if __name__ == "__main__":
    # uvicorn is the web server that runs our FastAPI app
    uvicorn.run(
        "app.main:app",         # module:app_variable
        host=settings.api_host,  # Listen on all network interfaces
        port=settings.api_port,  # Port from configuration
        reload=settings.debug    # Auto-restart in development mode
    )
