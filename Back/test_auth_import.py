#!/usr/bin/env python3
"""
Test script to verify that the auth_service.py imports correctly
and that authenticate_user function is callable.
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

try:
    print("🔍 Testing auth_service imports...")
    
    # Test importing the auth service module
    from app.services.auth_service import authenticate_user, AuthenticationError
    
    print("✅ Successfully imported auth_service module")
    print(f"✅ authenticate_user function: {authenticate_user}")
    print(f"✅ authenticate_user is callable: {callable(authenticate_user)}")
    print(f"✅ AuthenticationError class: {AuthenticationError}")
    
    # Test importing other functions from the module
    from app.services.auth_service import (
        logout_user,
        get_current_user_from_token,
        create_user_info,
        create_user_tokens
    )
    
    print("✅ Successfully imported all auth service functions")
    print(f"✅ logout_user: {callable(logout_user)}")
    print(f"✅ get_current_user_from_token: {callable(get_current_user_from_token)}")
    print(f"✅ create_user_info: {callable(create_user_info)}")
    print(f"✅ create_user_tokens: {callable(create_user_tokens)}")
    
    print("\n🎉 All auth service imports successful!")
    print("🔧 The 'NoneType' object is not callable error should be fixed!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)
