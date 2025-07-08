#!/usr/bin/env python3
"""
Test script to verify admin setup dependencies
"""
import sys
from pathlib import Path

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

def test_imports():
    """Test that all required imports work."""
    print("🧪 Testing imports...")
    
    try:
        from app.core.database import async_engine, AsyncSessionLocal, Base
        print("   ✅ Database core imports OK")
    except Exception as e:
        print(f"   ❌ Database imports failed: {e}")
        return False
    
    try:
        from app.models.user import User
        print("   ✅ User model import OK")
    except Exception as e:
        print(f"   ❌ User model import failed: {e}")
        return False
    
    try:
        from app.models.role import Role
        print("   ✅ Role model import OK")
    except Exception as e:
        print(f"   ❌ Role model import failed: {e}")
        return False
    
    try:
        from app.models.department import Department
        print("   ✅ Department model import OK")
    except Exception as e:
        print(f"   ❌ Department model import failed: {e}")
        return False
    
    try:
        from app.core.security import get_password_hash
        print("   ✅ Security imports OK")
    except Exception as e:
        print(f"   ❌ Security imports failed: {e}")
        return False
    
    print("   ✅ All imports successful!")
    return True

if __name__ == "__main__":
    print("🚀 Testing Admin Setup Dependencies")
    print("=" * 40)
    
    if test_imports():
        print("\n✅ Admin setup script should work correctly!")
        print("You can now run: python scripts/create_admin_user.py")
    else:
        print("\n❌ Some imports failed. Please fix the errors above.")
        sys.exit(1)
