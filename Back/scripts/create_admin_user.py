#!/usr/bin/env python3
"""
AI Dock Admin User Setup Script

This script creates a single admin user and sets up the database for AI Dock.
Perfect for initial system setup!

Features:
- Creates database tables if they don't exist
- Sets up default roles (admin, manager, user)
- Creates a default department
- Creates a single admin user with secure credentials
- Provides clear feedback and next steps

Usage:
    python scripts/create_admin_user.py
"""

import sys
import asyncio
import getpass
from pathlib import Path
from typing import Optional

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import async_engine, AsyncSessionLocal, Base
from app.models.user import User
from app.models.role import Role
from app.models.department import Department
from app.core.security import get_password_hash
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdminSetupError(Exception):
    """Custom exception for admin setup errors."""
    pass

async def check_database_connection():
    """Test database connection and ensure it's working."""
    print("🔗 Testing database connection...")
    
    try:
        async with async_engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            await result.fetchone()
        print("   ✅ Database connection successful!")
        return True
    except Exception as e:
        print(f"   ❌ Database connection failed: {e}")
        return False

async def create_database_tables():
    """Create all database tables if they don't exist."""
    print("🗄️  Creating database tables...")
    
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("   ✅ Database tables created successfully!")
        return True
    except Exception as e:
        print(f"   ❌ Failed to create database tables: {e}")
        raise AdminSetupError(f"Database table creation failed: {e}")

async def create_default_roles() -> dict:
    """Create default system roles if they don't exist."""
    print("🏷️  Setting up default roles...")
    
    async with AsyncSessionLocal() as session:
        try:
            # Check existing roles
            existing_roles = await session.execute(select(Role))
            role_names = {role.name for role in existing_roles.scalars()}
            
            roles_to_create = [
                {
                    "name": "admin",
                    "display_name": "Administrator",
                    "level": 100,
                    "is_system_role": True,
                    "permissions": {
                        "can_manage_users": True,
                        "can_manage_departments": True,
                        "can_manage_roles": True,
                        "can_view_all_usage": True,
                        "can_manage_quotas": True,
                        "can_configure_llms": True,
                        "can_access_admin_panel": True,
                        "can_use_llms": True,
                        "can_view_admin_panel": True,
                        "can_manage_system_settings": True,
                        "can_view_system_logs": True
                    }
                },
                {
                    "name": "manager",
                    "display_name": "Department Manager",
                    "level": 50,
                    "is_system_role": True,
                    "permissions": {
                        "can_manage_department_users": True,
                        "can_view_department_usage": True,
                        "can_use_llms": True,
                        "can_access_admin_panel": True,
                        "can_manage_department_quotas": True
                    }
                },
                {
                    "name": "user",
                    "display_name": "Standard User",
                    "level": 10,
                    "is_system_role": True,
                    "permissions": {
                        "can_use_llms": True,
                        "can_view_own_usage": True,
                        "can_access_ai_history": True
                    }
                }
            ]
            
            created_roles = {}
            
            for role_data in roles_to_create:
                if role_data["name"] not in role_names:
                    role = Role(**role_data)
                    session.add(role)
                    created_roles[role_data["name"]] = role
                    print(f"   ✅ Created role: {role_data['display_name']}")
                else:
                    existing_role = await session.execute(
                        select(Role).where(Role.name == role_data["name"])
                    )
                    created_roles[role_data["name"]] = existing_role.scalar_one()
                    print(f"   ℹ️  Role already exists: {role_data['display_name']}")
            
            await session.commit()
            print("   ✅ Role setup complete!")
            return created_roles
            
        except Exception as e:
            await session.rollback()
            print(f"   ❌ Failed to create roles: {e}")
            raise AdminSetupError(f"Role creation failed: {e}")

async def create_default_department() -> Department:
    """Create a default department if none exists."""
    print("🏢 Setting up default department...")
    
    async with AsyncSessionLocal() as session:
        try:
            # Check if any departments exist
            existing_dept = await session.execute(select(Department))
            departments = list(existing_dept.scalars())
            
            if not departments:
                department = Department(
                    name="Administration",
                    code="ADMIN",
                    description="Administrative Department - Default department for system administrators",
                    monthly_budget=10000.00,
                    cost_center="ADMIN-001",
                    manager_email="admin@aidock.dev",
                    location="System Default",
                    created_by="system"
                )
                session.add(department)
                await session.commit()
                print("   ✅ Created default department: Administration")
                return department
            else:
                print(f"   ℹ️  Department already exists: {departments[0].name}")
                return departments[0]
                
        except Exception as e:
            await session.rollback()
            print(f"   ❌ Failed to create department: {e}")
            raise AdminSetupError(f"Department creation failed: {e}")

async def create_admin_user(roles: dict, department: Department) -> User:
    """Create the admin user."""
    print("👑 Creating admin user...")
    
    async with AsyncSessionLocal() as session:
        try:
            # Check if admin user already exists
            admin_check = await session.execute(
                select(User).where(User.email == "admin@aidock.dev")
            )
            existing_admin = admin_check.scalar_one_or_none()
            
            if existing_admin:
                print("   ℹ️  Admin user already exists!")
                print(f"   📧 Email: {existing_admin.email}")
                print(f"   👤 Username: {existing_admin.username}")
                print(f"   🔓 Status: {'Active' if existing_admin.is_active else 'Inactive'}")
                
                # Ensure admin is active and has correct role
                if not existing_admin.is_active:
                    existing_admin.is_active = True
                    print("   🔄 Activated existing admin user")
                
                if existing_admin.role_id != roles["admin"].id:
                    existing_admin.role_id = roles["admin"].id
                    print("   🔄 Updated admin user role")
                
                await session.commit()
                return existing_admin
            
            # Create new admin user
            admin_user = User(
                email="admin@aidock.dev",
                username="admin",
                full_name="System Administrator",
                password_hash=get_password_hash("admin123"),
                is_admin=True,
                is_active=True,
                is_verified=True,
                role_id=roles["admin"].id,
                department_id=department.id,
                job_title="System Administrator",
                bio="Default system administrator account"
            )
            
            session.add(admin_user)
            await session.commit()
            
            print("   ✅ Admin user created successfully!")
            print("   📧 Email: admin@aidock.dev")
            print("   👤 Username: admin")
            print("   🔑 Password: admin123")
            print("   ⚠️  IMPORTANT: Change this password after first login!")
            
            return admin_user
            
        except Exception as e:
            await session.rollback()
            print(f"   ❌ Failed to create admin user: {e}")
            raise AdminSetupError(f"Admin user creation failed: {e}")

async def verify_setup() -> bool:
    """Verify that the setup was successful."""
    print("🔍 Verifying setup...")
    
    try:
        async with AsyncSessionLocal() as session:
            # Check roles
            role_count = await session.scalar(select(func.count(Role.id)))
            if role_count < 3:
                print(f"   ❌ Expected at least 3 roles, found {role_count}")
                return False
            
            # Check departments
            dept_count = await session.scalar(select(func.count(Department.id)))
            if dept_count < 1:
                print(f"   ❌ Expected at least 1 department, found {dept_count}")
                return False
            
            # Check admin user
            admin_user = await session.execute(
                select(User).where(User.email == "admin@aidock.dev")
            )
            admin = admin_user.scalar_one_or_none()
            
            if not admin:
                print("   ❌ Admin user not found")
                return False
            
            if not admin.is_active:
                print("   ❌ Admin user is not active")
                return False
            
            if not admin.is_admin:
                print("   ❌ Admin user does not have admin privileges")
                return False
            
            print("   ✅ Setup verification passed!")
            return True
            
    except Exception as e:
        print(f"   ❌ Setup verification failed: {e}")
        return False

async def show_setup_summary():
    """Show a summary of what was created."""
    print("\n📊 SETUP SUMMARY")
    print("=" * 50)
    
    try:
        async with AsyncSessionLocal() as session:
            # Count everything
            user_count = await session.scalar(select(func.count(User.id)))
            role_count = await session.scalar(select(func.count(Role.id)))
            dept_count = await session.scalar(select(func.count(Department.id)))
            
            print(f"👥 Total Users: {user_count}")
            print(f"🏷️  Total Roles: {role_count}")
            print(f"🏢 Total Departments: {dept_count}")
            
            # Show admin user details
            admin_user = await session.execute(
                select(User).where(User.email == "admin@aidock.dev")
            )
            admin = admin_user.scalar_one_or_none()
            
            if admin:
                print("\n👑 ADMIN USER DETAILS")
                print("-" * 30)
                print(f"📧 Email: {admin.email}")
                print(f"👤 Username: {admin.username}")
                print(f"👨‍💼 Full Name: {admin.full_name}")
                print(f"🔓 Active: {'Yes' if admin.is_active else 'No'}")
                print(f"✅ Verified: {'Yes' if admin.is_verified else 'No'}")
                print(f"⚡ Admin: {'Yes' if admin.is_admin else 'No'}")
                
                # Show role and department
                if admin.role:
                    print(f"🏷️  Role: {admin.role.display_name}")
                if admin.department:
                    print(f"🏢 Department: {admin.department.name}")
                    
    except Exception as e:
        print(f"❌ Error generating summary: {e}")

async def main():
    """Main function to set up admin user and database."""
    print("🚀 AI DOCK ADMIN SETUP")
    print("=" * 50)
    print("This script will:")
    print("  • Create database tables if they don't exist")
    print("  • Set up default roles (admin, manager, user)")
    print("  • Create a default department")
    print("  • Create a system administrator account")
    print("=" * 50)
    
    try:
        # Step 1: Test database connection
        if not await check_database_connection():
            print("\n❌ Database connection failed. Please check your database configuration.")
            print("   Make sure PostgreSQL is running and DATABASE_URL is correct.")
            sys.exit(1)
        
        # Step 2: Create database tables
        await create_database_tables()
        
        # Step 3: Create default roles
        roles = await create_default_roles()
        
        # Step 4: Create default department
        department = await create_default_department()
        
        # Step 5: Create admin user
        admin_user = await create_admin_user(roles, department)
        
        # Step 6: Verify setup
        if not await verify_setup():
            print("\n❌ Setup verification failed. Please check the logs above.")
            sys.exit(1)
        
        # Step 7: Show summary
        await show_setup_summary()
        
        # Step 8: Show next steps
        print("\n🎉 ADMIN SETUP COMPLETE!")
        print("\n🔑 LOGIN CREDENTIALS")
        print("-" * 30)
        print("Email: admin@aidock.dev")
        print("Username: admin")
        print("Password: admin123")
        
        print("\n⚠️  SECURITY IMPORTANT")
        print("-" * 30)
        print("1. Change the admin password immediately after first login")
        print("2. Consider creating a unique admin email address")
        print("3. Review and adjust department quotas as needed")
        
        print("\n🌐 NEXT STEPS")
        print("-" * 30)
        print("1. Start the backend server:")
        print("   cd Back && uvicorn app.main:app --reload")
        print("\n2. Test the API at: http://localhost:8000/docs")
        print("\n3. Login using the /auth/login endpoint with the credentials above")
        print("\n4. Access the admin panel to configure users and departments")
        
        print("\n✨ Your AI Dock system is ready to go!")
        
    except AdminSetupError as e:
        print(f"\n❌ Setup failed: {e}")
        print("\nPlease fix the error and run the script again.")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⏸️  Setup cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error during setup: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    # Check if we're in the right directory
    if not Path("app").exists():
        print("❌ Error: Please run this script from the /Back directory")
        print("   Example: cd Back && python scripts/create_admin_user.py")
        sys.exit(1)
    
    # Run the admin setup
    asyncio.run(main())
