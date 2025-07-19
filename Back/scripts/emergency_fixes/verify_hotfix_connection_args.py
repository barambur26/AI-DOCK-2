#!/usr/bin/env python3
"""
🚑 HOTFIX VERIFICATION: PostgreSQL Connection Arguments Fix
Verifies that the invalid connection arguments have been removed and deployment is ready.

This verifies:
1. No invalid PostgreSQL connection arguments remain
2. All beneficial pool changes are preserved
3. Configuration is deployment-ready for Railway

Usage:
    python verify_hotfix_connection_args.py
"""

import sys
import os
from datetime import datetime

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

def print_status(message: str, status: str = "INFO"):
    """Print formatted status message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status_emoji = {"INFO": "ℹ️", "SUCCESS": "✅", "ERROR": "❌", "WARNING": "⚠️", "HOTFIX": "🚑"}
    print(f"{status_emoji.get(status, '📝')} [{timestamp}] {message}")

def check_connection_args_fixed():
    """Verify that invalid connection arguments have been removed."""
    print_status("Checking for invalid PostgreSQL connection arguments...", "HOTFIX")
    
    try:
        from app.core.database import create_sync_engine_instance, create_async_engine_instance
        
        # Check sync engine
        sync_engine = create_sync_engine_instance()
        async_engine = create_async_engine_instance()
        
        print_status("✅ Database engines created successfully (no invalid args)", "SUCCESS")
        
        # Verify pool configuration is preserved
        if hasattr(sync_engine, 'pool'):
            pool = sync_engine.pool
            pool_size = pool.size()
            max_overflow = pool._max_overflow
            total_capacity = pool_size + max_overflow
            
            print_status(f"Pool configuration preserved: {pool_size} + {max_overflow} = {total_capacity}")
            
            if total_capacity >= 100:
                print_status("✅ Pool expansion is preserved!", "SUCCESS")
                return True
            else:
                print_status(f"❌ Pool capacity reduced to {total_capacity}", "ERROR")
                return False
        else:
            print_status("❌ Could not access connection pool", "ERROR")
            return False
            
    except Exception as e:
        print_status(f"❌ Database engine creation failed: {e}", "ERROR")
        return False

def check_for_invalid_args_in_code():
    """Check database.py file for presence of invalid connection arguments."""
    print_status("Scanning code for invalid connection arguments...", "HOTFIX")
    
    try:
        database_file = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "app", "core", "database.py"
        )
        
        with open(database_file, 'r') as f:
            content = f.read()
        
        # Check for invalid arguments
        invalid_args = ["connect_timeout", "command_timeout", "server_settings"]
        found_invalid = []
        
        for arg in invalid_args:
            if f'"{arg}"' in content:
                found_invalid.append(arg)
        
        if found_invalid:
            print_status(f"❌ Found invalid args in code: {found_invalid}", "ERROR")
            return False
        else:
            print_status("✅ No invalid connection arguments found in code", "SUCCESS")
            
        # Check for valid arguments
        valid_args = ["sslmode", "application_name"]
        found_valid = []
        
        for arg in valid_args:
            if f'"{arg}"' in content:
                found_valid.append(arg)
                
        if found_valid:
            print_status(f"✅ Found valid PostgreSQL args: {found_valid}", "SUCCESS")
        
        return True
        
    except Exception as e:
        print_status(f"❌ Code scanning failed: {e}", "ERROR")
        return False

def check_pool_settings_preserved():
    """Verify that pool settings improvements are preserved."""
    print_status("Verifying pool settings are preserved...", "HOTFIX")
    
    try:
        database_file = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "app", "core", "database.py"
        )
        
        with open(database_file, 'r') as f:
            content = f.read()
        
        # Check for expected pool settings
        expected_settings = [
            "pool_size=30",
            "max_overflow=70", 
            "pool_timeout=60",
            "pool_recycle=900"
        ]
        
        found_settings = []
        for setting in expected_settings:
            if setting in content:
                found_settings.append(setting)
        
        if len(found_settings) == len(expected_settings):
            print_status("✅ All pool improvements preserved", "SUCCESS")
            for setting in found_settings:
                print_status(f"   ✓ {setting}")
            return True
        else:
            missing = set(expected_settings) - set(found_settings)
            print_status(f"❌ Missing pool settings: {missing}", "ERROR")
            return False
            
    except Exception as e:
        print_status(f"❌ Pool settings check failed: {e}", "ERROR")
        return False

def main():
    """Run all hotfix verification checks."""
    print_status("🚑 HOTFIX VERIFICATION: PostgreSQL Connection Arguments", "HOTFIX")
    print_status("=" * 65, "INFO")
    
    checks = [
        ("Remove Invalid Connection Args", check_for_invalid_args_in_code),
        ("Preserve Pool Settings", check_pool_settings_preserved),
        ("Database Engine Creation", check_connection_args_fixed),
    ]
    
    passed_checks = 0
    total_checks = len(checks)
    
    for check_name, check_function in checks:
        print_status(f"Running: {check_name}")
        try:
            if check_function():
                passed_checks += 1
            print_status("-" * 50)
        except Exception as e:
            print_status(f"❌ Check '{check_name}' failed: {e}", "ERROR")
            print_status("-" * 50)
    
    print_status("=" * 65)
    print_status(f"HOTFIX VERIFICATION: {passed_checks}/{total_checks} checks passed")
    
    if passed_checks == total_checks:
        print_status("🎉 HOTFIX VERIFIED! Ready for deployment.", "SUCCESS")
        print_status("Action: Deploy immediately to fix production", "HOTFIX")
        return 0
    else:
        print_status("❌ Hotfix verification failed. Do not deploy.", "ERROR")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
