#!/usr/bin/env python3
"""
Test script to verify Pydantic v2 compatibility fixes.
This script tries to import all schema modules to catch any remaining issues.
"""

import sys
import traceback
from pathlib import Path

# Add the Back directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "Back"))

def test_schema_imports():
    """Test importing all schema modules."""
    
    schema_modules = [
        'app.schemas.auth',
        'app.schemas.chat', 
        'app.schemas.conversation',
        'app.schemas.department',
        'app.schemas.file_upload',
        'app.schemas.llm_config',
        'app.schemas.quota',
        'app.schemas.role',
        'app.schemas.admin',
        'app.schemas.assistant',
        'app.schemas.assistant_file'
    ]
    
    print("🧪 Testing schema imports for Pydantic v2 compatibility...")
    
    success_count = 0
    total_count = len(schema_modules)
    
    for module_name in schema_modules:
        try:
            # Try to import the module
            __import__(module_name)
            print(f"✅ {module_name}")
            success_count += 1
        except ImportError as e:
            print(f"❌ {module_name}: ImportError - {e}")
        except Exception as e:
            print(f"❌ {module_name}: {type(e).__name__} - {e}")
            # Print full traceback for debugging
            traceback.print_exc()
    
    print(f"\n📊 Results: {success_count}/{total_count} schemas imported successfully")
    
    if success_count == total_count:
        print("🎉 All schema imports successful - Pydantic v2 fixes working!")
        return True
    else:
        print("⚠️  Some schema imports failed - may need additional fixes")
        return False

if __name__ == "__main__":
    success = test_schema_imports()
    sys.exit(0 if success else 1)
