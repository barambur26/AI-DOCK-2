#!/usr/bin/env python3
"""
Quick test to verify auth_service imports correctly after fixing session usage.
"""

import sys
import os

# Add the Back directory to the Python path
sys.path.insert(0, os.path.abspath("."))

def test_auth_service_import():
    """Test that auth_service imports without errors."""
    try:
        print("🔍 Testing auth_service import...")
        
        # Import the auth service module
        from app.services.auth_service import authenticate_user
        
        # Check if authenticate_user is callable
        if authenticate_user is None:
            print("❌ authenticate_user is None (import failed)")
            return False
        
        if not callable(authenticate_user):
            print(f"❌ authenticate_user is not callable: {type(authenticate_user)}")
            return False
        
        print("✅ authenticate_user imported successfully and is callable")
        print(f"   Function type: {type(authenticate_user)}")
        print(f"   Function name: {authenticate_user.__name__}")
        
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_all_auth_functions():
    """Test that all main auth functions import correctly."""
    try:
        from app.services.auth_service import (
            authenticate_user,
            logout_user,
            get_current_user_from_token,
            AuthenticationError
        )
        
        functions_to_test = [
            ("authenticate_user", authenticate_user),
            ("logout_user", logout_user),
            ("get_current_user_from_token", get_current_user_from_token),
            ("AuthenticationError", AuthenticationError)
        ]
        
        all_good = True
        for name, func in functions_to_test:
            if func is None:
                print(f"❌ {name} is None")
                all_good = False
            elif name != "AuthenticationError" and not callable(func):
                print(f"❌ {name} is not callable: {type(func)}")
                all_good = False
            else:
                print(f"✅ {name} imported correctly")
        
        return all_good
        
    except Exception as e:
        print(f"❌ Error importing auth functions: {e}")
        return False

if __name__ == "__main__":
    print("🚀 AI Dock Auth Service Import Test")
    print("=" * 50)
    
    # Test basic import
    test1_passed = test_auth_service_import()
    print()
    
    # Test all functions
    test2_passed = test_all_auth_functions()
    print()
    
    if test1_passed and test2_passed:
        print("🎉 ALL TESTS PASSED! Auth service should work now.")
        print("💡 You can now test the login endpoint:")
        print("   POST https://ai-dock-2-production.up.railway.app/auth/login")
    else:
        print("❌ TESTS FAILED. There are still import issues.")
    
    print("\nNext steps:")
    print("1. Deploy this fix to Railway")
    print("2. Test the login endpoint")
    print("3. Check Railway logs for any remaining errors")
