#!/usr/bin/env python3
"""
Verify Admin Setup Script

This script verifies that the admin setup completed successfully
and provides diagnostics for any issues.
"""

import sys
import asyncio
from pathlib import Path

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.role import Role
from app.models.department import Department
from sqlalchemy import select, func

async def verify_admin_setup():
    """Verify that admin setup completed successfully."""
    print("🔍 VERIFYING ADMIN SETUP")
    print("=" * 50)
    
    try:
        async with AsyncSessionLocal() as session:
            
            # Check database connection
            print("1. Testing database connection...")
            await session.execute(select(func.count(User.id)))
            print("   ✅ Database connection successful")
            
            # Check roles
            print("\n2. Checking roles...")
            roles = await session.execute(select(Role))
            role_list = list(roles.scalars())
            
            required_roles = ["admin", "manager", "user"]
            existing_roles = [role.name for role in role_list]
            
            for required_role in required_roles:
                if required_role in existing_roles:
                    print(f"   ✅ Role '{required_role}' exists")
                else:
                    print(f"   ❌ Role '{required_role}' missing")
            
            # Check departments
            print("\n3. Checking departments...")
            departments = await session.execute(select(Department))
            dept_list = list(departments.scalars())
            
            if dept_list:
                print(f"   ✅ Found {len(dept_list)} department(s)")
                for dept in dept_list:
                    print(f"      - {dept.name} ({dept.code})")
            else:
                print("   ❌ No departments found")
            
            # Check admin user
            print("\n4. Checking admin user...")
            admin_user = await session.execute(
                select(User).where(User.email == "admin@aidock.local")
            )
            admin = admin_user.scalar_one_or_none()
            
            if admin:
                print("   ✅ Admin user found")
                print(f"      Email: {admin.email}")
                print(f"      Username: {admin.username}")
                print(f"      Active: {admin.is_active}")
                print(f"      Admin: {admin.is_admin}")
                print(f"      Verified: {admin.is_verified}")
                
                if admin.role:
                    print(f"      Role: {admin.role.display_name}")
                if admin.department:
                    print(f"      Department: {admin.department.name}")
            else:
                print("   ❌ Admin user not found")
            
            # Summary
            print("\n" + "=" * 50)
            
            total_users = await session.scalar(select(func.count(User.id)))
            total_roles = await session.scalar(select(func.count(Role.id)))
            total_depts = await session.scalar(select(func.count(Department.id)))
            
            print(f"📊 SUMMARY")
            print(f"   Users: {total_users}")
            print(f"   Roles: {total_roles}")
            print(f"   Departments: {total_depts}")
            
            if admin and len(role_list) >= 3 and len(dept_list) >= 1:
                print("\n🎉 Admin setup verification PASSED!")
                print("\nYou can now:")
                print("  1. Start the backend: uvicorn app.main:app --reload")
                print("  2. Login with admin@aidock.local / admin123")
                print("  3. Access the admin panel")
                return True
            else:
                print("\n❌ Admin setup verification FAILED!")
                print("Run: python scripts/create_admin_user.py")
                return False
                
    except Exception as e:
        print(f"\n❌ Verification failed with error: {e}")
        return False

async def main():
    """Main verification function."""
    success = await verify_admin_setup()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    # Check if we're in the right directory
    if not Path("app").exists():
        print("❌ Error: Please run this script from the /Back directory")
        sys.exit(1)
    
    asyncio.run(main())
