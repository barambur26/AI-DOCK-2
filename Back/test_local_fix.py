#!/usr/bin/env python3
"""
Quick test to verify Pydantic V2 compatibility fix works locally.
Run this from your /Back directory to test the import chain.
"""

import sys
sys.path.append('.')

try:
    print("🔍 Testing imports...")
    
    # Test the problematic schema import
    from app.schemas.assistant import AssistantBase, AssistantCreate, AssistantUpdate
    print("✅ Assistant schemas imported successfully")
    
    # Test auth import (which was failing in deployment)
    from app.api.auth import router as auth_router
    print("✅ Auth router imported successfully")
    
    # Test main app import
    from app.main import app
    print("✅ Main FastAPI app imported successfully")
    
    # Test a quick schema validation
    assistant_data = {
        "name": "Test Assistant",
        "system_prompt": "You are a helpful test assistant.",
        "color": "#3B82F6"
    }
    
    assistant = AssistantCreate(**assistant_data)
    print(f"✅ Schema validation works: {assistant.name}")
    
    print("\n🎉 All tests passed! Your local environment is ready.")
    print("\nTo start the backend:")
    print("uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("This suggests there might be other compatibility issues.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("There might be other issues to investigate.")
