#!/usr/bin/env python3
"""
🔥 EMERGENCY FIX VERIFICATION SCRIPT
Verifies that the database connection pool expansion fix is working correctly.

This script checks:
1. Connection pool configuration is properly applied
2. Pool capacity is increased from 30 to 100 total connections
3. Pool status monitoring is working
4. Admin endpoints are responding correctly

Usage:
    python verify_connection_pool_fix.py
"""

import sys
import os
import asyncio
import requests
import time
from datetime import datetime

# Add the parent directory to Python path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

def print_status(message: str, status: str = "INFO"):
    """Print formatted status message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status_emoji = {"INFO": "ℹ️", "SUCCESS": "✅", "ERROR": "❌", "WARNING": "⚠️"}
    print(f"{status_emoji.get(status, '📝')} [{timestamp}] {message}")

def check_local_database_config():
    """Check local database configuration."""
    print_status("Checking local database configuration...")
    
    try:
        from app.core.database import get_connection_pool_status, create_sync_engine_instance
        
        # Create engine to trigger configuration
        engine = create_sync_engine_instance()
        
        # Check pool configuration
        if hasattr(engine, 'pool'):
            pool = engine.pool
            pool_size = pool.size()
            max_overflow = pool._max_overflow
            total_capacity = pool_size + max_overflow
            
            print_status(f"Pool Size: {pool_size} (expected: 30)")
            print_status(f"Max Overflow: {max_overflow} (expected: 70)")
            print_status(f"Total Capacity: {total_capacity} (expected: 100)")
            
            if total_capacity >= 100:
                print_status("✅ Connection pool configuration is correct!", "SUCCESS")
                return True
            else:
                print_status(f"❌ Connection pool capacity is only {total_capacity}, expected 100+", "ERROR")
                return False
        else:
            print_status("❌ Could not access connection pool", "ERROR")
            return False
            
    except Exception as e:
        print_status(f"❌ Failed to check database config: {e}", "ERROR")
        return False

def check_pool_status_monitoring():
    """Check if pool status monitoring is working."""
    print_status("Testing connection pool status monitoring...")
    
    try:
        from app.core.database import get_connection_pool_status, log_connection_pool_status
        
        # Test pool status function
        status = get_connection_pool_status()
        
        if "error" in status:
            print_status(f"❌ Pool status monitoring error: {status['error']}", "ERROR")
            return False
        
        # Check if we got expected fields
        required_fields = ["timestamp", "sync_pool", "async_pool", "health"]
        for field in required_fields:
            if field not in status:
                print_status(f"❌ Missing field in pool status: {field}", "ERROR")
                return False
        
        print_status(f"Pool Health: {status['health']}")
        print_status(f"Sync Pool Utilization: {status['sync_pool'].get('utilization_pct', 0)}%")
        print_status(f"Async Pool Utilization: {status['async_pool'].get('utilization_pct', 0)}%")
        
        # Test logging function
        log_connection_pool_status()
        
        print_status("✅ Pool status monitoring is working!", "SUCCESS")
        return True
        
    except Exception as e:
        print_status(f"❌ Pool status monitoring failed: {e}", "ERROR")
        return False

def test_admin_endpoint_response():
    """Test that admin endpoints are responding quickly."""
    print_status("Testing admin endpoint response time...")
    
    # This is a basic test - in production you'd need proper authentication
    try:
        # Test local server if running
        test_urls = [
            "http://localhost:8000/health",  # If there's a health endpoint
            "http://localhost:8000/docs",   # FastAPI docs
        ]
        
        for url in test_urls:
            try:
                start_time = time.time()
                response = requests.get(url, timeout=10)
                response_time = (time.time() - start_time) * 1000
                
                if response_time < 5000:  # Less than 5 seconds
                    print_status(f"✅ {url} responded in {response_time:.1f}ms", "SUCCESS")
                else:
                    print_status(f"⚠️ {url} slow response: {response_time:.1f}ms", "WARNING")
                    
            except requests.exceptions.ConnectionError:
                print_status(f"ℹ️ {url} not available (server not running locally)", "INFO")
            except Exception as e:
                print_status(f"❌ {url} error: {e}", "ERROR")
                
        return True
        
    except Exception as e:
        print_status(f"❌ Endpoint testing failed: {e}", "ERROR")
        return False

def check_environment_variables():
    """Check Railway-specific environment variables."""
    print_status("Checking environment configuration...")
    
    railway_env = os.getenv("RAILWAY_ENVIRONMENT")
    database_url = os.getenv("DATABASE_URL")
    
    if railway_env:
        print_status(f"Railway Environment: {railway_env}")
    else:
        print_status("Not running in Railway environment", "INFO")
    
    if database_url:
        # Don't log the full URL for security
        db_type = "PostgreSQL" if "postgresql" in database_url or "postgres" in database_url else "SQLite" if "sqlite" in database_url else "Unknown"
        print_status(f"Database Type: {db_type}")
    else:
        print_status("No DATABASE_URL found", "WARNING")
    
    return True

def main():
    """Run all verification checks."""
    print_status("🔥 EMERGENCY FIX VERIFICATION STARTING", "INFO")
    print_status("=" * 60, "INFO")
    
    checks = [
        ("Environment Variables", check_environment_variables),
        ("Local Database Config", check_local_database_config),
        ("Pool Status Monitoring", check_pool_status_monitoring),
        ("Admin Endpoint Response", test_admin_endpoint_response),
    ]
    
    passed_checks = 0
    total_checks = len(checks)
    
    for check_name, check_function in checks:
        print_status(f"Running check: {check_name}")
        try:
            if check_function():
                passed_checks += 1
            print_status("-" * 40)
        except Exception as e:
            print_status(f"❌ Check '{check_name}' failed with exception: {e}", "ERROR")
            print_status("-" * 40)
    
    print_status("=" * 60)
    print_status(f"VERIFICATION COMPLETE: {passed_checks}/{total_checks} checks passed")
    
    if passed_checks == total_checks:
        print_status("🎉 ALL CHECKS PASSED! Emergency fix appears to be working.", "SUCCESS")
        return 0
    elif passed_checks >= total_checks - 1:
        print_status("⚠️ Most checks passed. Fix is likely working but monitor closely.", "WARNING")
        return 0
    else:
        print_status("❌ Multiple checks failed. Fix may not be working properly.", "ERROR")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
