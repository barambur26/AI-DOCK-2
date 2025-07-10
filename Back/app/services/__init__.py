"""
Services package for AI Dock application.

This package contains all business logic services.
Services handle the "what should happen" while endpoints handle the "how to respond to HTTP".
"""

# Import authentication functions (auth_service.py exports functions, not a class)
from .auth_service import (
    authenticate_user,
    logout_user,
    get_current_user_from_token,
    AuthenticationError
)

# Import admin service factory function
from .admin_service import get_admin_service

# Import quota service factory function
from .quota_service import get_quota_service

# Import LLM service (assuming it follows a similar pattern)
# TODO: Check and update when LLM service is implemented
try:
    from .llm_service import llm_service
except ImportError:
    # LLM service might not be fully implemented yet
    llm_service = None

# Import assistant service
from .assistant_service import assistant_service

# Import conversation service
from .conversation_service import conversation_service

# Import usage service
try:
    from .usage_service import usage_service
except ImportError:
    usage_service = None

__all__ = [
    # Auth functions
    "authenticate_user",
    "logout_user", 
    "get_current_user_from_token",
    "AuthenticationError",
    # Admin service
    "get_admin_service",
    # Quota service
    "get_quota_service",
    # LLM service (if available)
    "llm_service",
    # Assistant service
    "assistant_service",
    # Conversation service
    "conversation_service",
    # Usage service
    "usage_service"
]
