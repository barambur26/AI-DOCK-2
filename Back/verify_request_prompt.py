#!/usr/bin/env python3
"""
Verification script for request_prompt implementation
Run this from the Back/ directory to verify the implementation
"""

import asyncio
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

async def verify_implementation():
    """Verify that the request_prompt implementation is working"""
    
    print("🔍 Verifying request_prompt implementation...")
    print()
    
    # Test 1: Check if the UsageLog model has the new field
    try:
        from app.models.usage_log import UsageLog
        
        # Check if request_prompt field exists
        if hasattr(UsageLog, 'request_prompt'):
            print("✅ Test 1: UsageLog model has request_prompt field")
        else:
            print("❌ Test 1: UsageLog model missing request_prompt field")
            return False
    except Exception as e:
        print(f"❌ Test 1: Error importing UsageLog model: {e}")
        return False
    
    # Test 2: Check usage service parameters
    try:
        from app.services.usage_service import usage_service
        import inspect
        
        # Check log_llm_request_isolated signature
        sig = inspect.signature(usage_service.log_llm_request_isolated)
        if 'request_prompt' in sig.parameters:
            print("✅ Test 2: usage_service.log_llm_request_isolated accepts request_prompt")
        else:
            print("❌ Test 2: usage_service.log_llm_request_isolated missing request_prompt parameter")
            return False
    except Exception as e:
        print(f"❌ Test 2: Error checking usage service: {e}")
        return False
    
    # Test 3: Check usage logger functionality
    try:
        from app.services.llm.usage_logger import get_usage_logger
        
        logger = get_usage_logger()
        
        # Test create_request_data with sample messages
        test_messages = [
            {"role": "system", "content": "You are a helpful assistant"},
            {"role": "user", "content": "What is the capital of France?"}
        ]
        
        request_data = logger.create_request_data(
            messages=test_messages,
            parameters={"temperature": 0.7}
        )
        
        if 'request_prompt' in request_data and request_data['request_prompt'] == "What is the capital of France?":
            print("✅ Test 3: usage_logger correctly extracts request_prompt from messages")
        else:
            print(f"❌ Test 3: usage_logger failed to extract request_prompt. Got: {request_data.get('request_prompt')}")
            return False
    except Exception as e:
        print(f"❌ Test 3: Error testing usage logger: {e}")
        return False
    
    # Test 4: Check database migration
    try:
        from app.core.database import get_async_session_factory
        from sqlalchemy import text
        
        async with get_async_session_factory()() as session:
            # Check if the column exists in the database
            result = await session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'usage_logs' 
                AND column_name = 'request_prompt'
            """))
            
            column_exists = result.scalar_one_or_none()
            
            if column_exists:
                print("✅ Test 4: request_prompt column exists in database")
            else:
                print("❌ Test 4: request_prompt column not found in database")
                print("   Run: alembic upgrade head")
                return False
    except Exception as e:
        print(f"❌ Test 4: Error checking database: {e}")
        print("   Make sure the migration has been run: alembic upgrade head")
        return False
    
    # Test 5: Check API response structure
    try:
        # Create a mock usage log to test to_dict method
        from datetime import datetime
        
        mock_log = UsageLog(
            id=1,
            user_id=1,
            user_email="test@example.com",
            user_role="user",
            llm_config_id=1,
            llm_config_name="test-config",
            provider="openai",
            model="gpt-4",
            request_prompt="Test user message",
            response_preview="Test AI response",
            success=True,
            created_at=datetime.utcnow()
        )
        
        log_dict = mock_log.to_dict()
        
        if 'request_prompt' in log_dict and log_dict['request_prompt'] == "Test user message":
            print("✅ Test 5: UsageLog.to_dict() includes request_prompt")
        else:
            print("❌ Test 5: UsageLog.to_dict() missing request_prompt")
            return False
    except Exception as e:
        print(f"❌ Test 5: Error testing to_dict method: {e}")
        return False
    
    print()
    print("🎉 All tests passed! The request_prompt implementation is working correctly.")
    print()
    print("📋 Next steps:")
    print("1. Restart your FastAPI backend")
    print("2. Send a test chat message through the frontend")
    print("3. Check the admin usage analytics to see request_prompt populated")
    
    return True

if __name__ == "__main__":
    # Run the verification
    success = asyncio.run(verify_implementation())
    
    if not success:
        print()
        print("🚨 Some tests failed. Please check the errors above.")
        sys.exit(1)
    else:
        sys.exit(0)
