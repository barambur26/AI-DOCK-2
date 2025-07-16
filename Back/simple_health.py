#!/usr/bin/env python3
"""
Simple health check script for Railway debugging.
This bypasses all the app dependencies to test basic Python execution.
"""

import os
import sys
from datetime import datetime

def main():
    print("🔍 Railway Health Check Debug")
    print(f"📅 Timestamp: {datetime.now()}")
    print(f"🐍 Python Version: {sys.version}")
    print(f"📂 Working Directory: {os.getcwd()}")
    
    # Check critical environment variables
    print("\n🔧 Environment Variables:")
    env_vars = [
        "PORT", "DATABASE_URL", "SECRET_KEY", "ENVIRONMENT", 
        "RAILWAY_ENVIRONMENT", "RAILWAY_PROJECT_ID"
    ]
    
    for var in env_vars:
        value = os.getenv(var)
        if var in ["SECRET_KEY", "DATABASE_URL"] and value:
            # Hide sensitive values
            print(f"   {var}: {'*' * 20} (SET)")
        else:
            print(f"   {var}: {value or 'NOT SET'}")
    
    # Test basic imports
    print("\n📦 Testing Critical Imports:")
    try:
        import fastapi
        print(f"   ✅ FastAPI: {fastapi.__version__}")
    except Exception as e:
        print(f"   ❌ FastAPI: {e}")
    
    try:
        import uvicorn
        print(f"   ✅ Uvicorn: Available")
    except Exception as e:
        print(f"   ❌ Uvicorn: {e}")
    
    try:
        import sqlalchemy
        print(f"   ✅ SQLAlchemy: {sqlalchemy.__version__}")
    except Exception as e:
        print(f"   ❌ SQLAlchemy: {e}")
    
    # Test database URL format
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        print(f"\n🗄️  Database Analysis:")
        if db_url.startswith("postgres://"):
            print("   ✅ PostgreSQL URL detected")
            print("   💡 Will be converted to postgresql+asyncpg://")
        elif db_url.startswith("postgresql://"):
            print("   ✅ PostgreSQL URL detected (modern format)")
        elif db_url.startswith("sqlite"):
            print("   ✅ SQLite URL detected")
        else:
            print(f"   ⚠️  Unknown database type: {db_url[:20]}...")
    
    print("\n🎯 Recommendations:")
    if not os.getenv("PORT"):
        print("   ❌ PORT not set - Railway should provide this")
    if not os.getenv("DATABASE_URL"):
        print("   ❌ DATABASE_URL not set - Add PostgreSQL service")
    if not os.getenv("SECRET_KEY"):
        print("   ❌ SECRET_KEY not set - Add to Railway variables")
    
    print("\n✅ Health check completed")
    return True

if __name__ == "__main__":
    main()
