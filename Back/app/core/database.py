# AI Dock Database Configuration and Connection Management
# This file sets up SQLAlchemy to talk to our database with BOTH sync and async support

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from typing import AsyncGenerator, Generator
import logging
import asyncio
import time
import os
from datetime import datetime

from .config import settings

# =============================================================================
# LOGGING SETUP
# =============================================================================

# Create a logger specifically for database operations
logger = logging.getLogger(__name__)

# =============================================================================
# SQLALCHEMY BASE CLASSES
# =============================================================================

# Create the base class for all our database models
# Think of this as the "parent class" that all our User, Department, etc. classes inherit from
# The Base class automatically creates its own metadata object that we can access via Base.metadata
Base = declarative_base()

# Ensure metadata is properly initialized
if not hasattr(Base, 'metadata') or Base.metadata is None:
    logger.error("❌ SQLAlchemy Base metadata not properly initialized")
    raise Exception("Database Base class metadata initialization failed")

# =============================================================================
# DATABASE ENGINE CONFIGURATION (ASYNC)
# =============================================================================

# Lazy-loaded async engine to prevent connection attempts during import
async_engine = None

def create_async_engine_instance():
    """Create the async database engine when needed."""
    global async_engine
    if async_engine is None:
        # 🔥 EMERGENCY FIX: Aggressive connection pool settings for Railway
        is_production = os.getenv("RAILWAY_ENVIRONMENT") or "postgresql" in settings.database_url
        
        async_engine = create_async_engine(
            settings.async_database_url,
            
            # Echo SQL queries in development (helpful for learning!)
            echo=settings.debug,
            
            # 🔥 EMERGENCY FIX: Much larger connection pool for Railway production
            pool_size=30,                    # Increased from 20 to 30 for better concurrency
            max_overflow=70,                 # Increased from 40 to 70 for peak loads
            pool_pre_ping=True,             # Test connections before using them
            pool_recycle=900,               # Faster recycle (15 min instead of 30)
            pool_timeout=60,                # Longer timeout (60s instead of 30s)
            pool_reset_on_return='commit',  # Reset connections on return
            
            # 🔥 EMERGENCY FIX: Production-optimized connection args
            connect_args=(
                {
                    "check_same_thread": False,
                    "timeout": 30,
                    "isolation_level": None
                } 
                if settings.database_url.startswith("sqlite") 
                else {
                    # PostgreSQL/Railway optimizations (FIXED: removed invalid args)
                    "sslmode": "prefer",  # Valid PostgreSQL connection arg
                    "application_name": "aidock_async"
                } if is_production else {}
            )
        )
        
        # 🔥 EMERGENCY FIX: Log async connection pool status
        logger.info(f"🔥 EMERGENCY ASYNC POOL: size={async_engine.pool.size()}, max_overflow={async_engine.pool._max_overflow}, total_capacity={async_engine.pool.size() + async_engine.pool._max_overflow}")
        
    return async_engine

# =============================================================================
# DATABASE ENGINE CONFIGURATION (SYNC)
# =============================================================================

# Lazy-loaded sync engine to prevent connection attempts during import
sync_engine = None

def create_sync_engine_instance():
    """Create the synchronous database engine when needed."""
    global sync_engine
    if sync_engine is None:
        # Convert Railway's postgres:// to postgresql:// for sync engine
        sync_db_url = settings.database_url
        if sync_db_url.startswith("postgres://"):
            sync_db_url = sync_db_url.replace("postgres://", "postgresql://")
        
        # 🔥 EMERGENCY FIX: Aggressive connection pool settings for Railway
        is_production = os.getenv("RAILWAY_ENVIRONMENT") or "postgresql" in sync_db_url
        
        sync_engine = create_engine(
            sync_db_url,  # Note: using the converted sync URL
            
            # Echo SQL queries in development
            echo=settings.debug,
            
            # 🔥 EMERGENCY FIX: Much larger connection pool for Railway production
            pool_size=30,                    # Increased from 20 to 30 for better concurrency
            max_overflow=70,                 # Increased from 40 to 70 for peak loads
            pool_pre_ping=True,             # Test connections before using them
            pool_recycle=900,               # Faster recycle (15 min instead of 30)
            pool_timeout=60,                # Longer timeout (60s instead of 30s)
            pool_reset_on_return='commit',  # Reset connections on return
            
            # 🔥 EMERGENCY FIX: Production-optimized connection args
            connect_args=(
                {
                    "check_same_thread": False,
                    "timeout": 30,
                    "isolation_level": None
                } 
                if settings.database_url.startswith("sqlite") 
                else {
                    # PostgreSQL/Railway optimizations (FIXED: removed invalid args)
                    "sslmode": "prefer",  # Valid PostgreSQL connection arg
                    "application_name": "aidock_backend"
                } if is_production else {}
            )
        )
        
        # 🔥 EMERGENCY FIX: Log connection pool status
        logger.info(f"🔥 EMERGENCY DB POOL: size={sync_engine.pool.size()}, max_overflow={sync_engine.pool._max_overflow}, total_capacity={sync_engine.pool.size() + sync_engine.pool._max_overflow}")
        
    return sync_engine

# =============================================================================
# SESSION FACTORIES
# =============================================================================

# Lazy session factories - created when engines are ready
AsyncSessionLocal = None
SyncSessionLocal = None

def get_async_session_factory():
    """Get or create the async session factory."""
    global AsyncSessionLocal
    if AsyncSessionLocal is None:
        AsyncSessionLocal = async_sessionmaker(
            create_async_engine_instance(),
            class_=AsyncSession,
            expire_on_commit=False,         # Keep objects accessible after commit
            autoflush=True,                 # Automatically sync changes to DB
            autocommit=False                # Require explicit commits (safer!)
        )
    return AsyncSessionLocal

def get_sync_session_factory():
    """Get or create the sync session factory."""
    global SyncSessionLocal
    if SyncSessionLocal is None:
        SyncSessionLocal = sessionmaker(
            create_sync_engine_instance(),
            class_=Session,
            expire_on_commit=False,
            autoflush=True,
            autocommit=False
        )
    return SyncSessionLocal

# =============================================================================
# DATABASE SESSION DEPENDENCIES
# =============================================================================

async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides an async database session.
    
    🔧 FIXED: Proper transaction management
    - Don't close session manually (async context manager handles it)
    - Only rollback on actual exceptions
    - Let successful commits stay committed
    
    Use this for async route handlers and services.
    """
    session_factory = get_async_session_factory()
    async with session_factory() as session:
        try:
            yield session
            # 🔧 KEY FIX: If we get here, everything succeeded
            # The context manager will properly close the session
            # without triggering unnecessary rollbacks
        except Exception as e:
            # Only rollback if there was actually an error
            try:
                await session.rollback()
            except Exception as rollback_error:
                logger.error(f"Failed to rollback session: {rollback_error}")
            
            logger.error(f"Async database session error: {e}")
            raise
        # 🔧 Removed finally block - let context manager handle cleanup

def get_sync_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a synchronous database session.
    
    🔥 EMERGENCY FIX: Enhanced connection management and timeout handling
    """
    session_factory = get_sync_session_factory()
    session = None
    start_time = time.time()
    
    try:
        # 🔥 EMERGENCY FIX: Add timeout for session creation
        session = session_factory()
        logger.debug(f"🔥 DB Session created in {(time.time() - start_time)*1000:.1f}ms")
        
        yield session
        
        # 🔥 EMERGENCY FIX: Explicit commit on success to release locks faster
        if session.in_transaction():
            session.commit()
            
    except Exception as e:
        if session:
            try:
                session.rollback()
                logger.debug(f"🔥 DB Session rolled back after error: {e}")
            except Exception as rollback_error:
                logger.error(f"🔥 DB Session rollback failed: {rollback_error}")
        
        logger.error(f"Sync database session error: {e}")
        raise
    finally:
        if session:
            try:
                session.close()
                elapsed = (time.time() - start_time) * 1000
                logger.debug(f"🔥 DB Session closed after {elapsed:.1f}ms")
                
                # 🔥 EMERGENCY FIX: Log slow queries
                if elapsed > 5000:  # 5 seconds
                    logger.warning(f"🔥 SLOW DB SESSION: {elapsed:.1f}ms - investigate connection pool pressure")
                    
            except Exception as close_error:
                logger.error(f"🔥 DB Session close failed: {close_error}")

# Default to sync for backward compatibility with existing code
get_db = get_sync_db

# Export engine getter for scripts that need direct access
def get_engine():
    """Get the sync engine for backward compatibility."""
    return create_sync_engine_instance()

# Legacy compatibility - use get_engine() for new code
engine = get_engine

# =============================================================================
# DATABASE INITIALIZATION
# =============================================================================

async def create_database_tables():
    """
    Create all database tables defined by our models.
    
    This function looks at all the model classes that inherit from Base
    and creates the corresponding tables in the database.
    """
    engine = create_async_engine_instance()
    async with engine.begin() as conn:
        # Import all models here to ensure they're registered with Base
        # This imports all model files which registers them with SQLAlchemy
        from ..models import (
            user, role, department, llm_config, 
            usage_log, quota, conversation
        )
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created successfully")

def create_database_tables_sync():
    """
    Synchronous version of table creation.
    """
    # Import all models here to ensure they're registered with Base
    # This imports all model files which registers them with SQLAlchemy
    from ..models import (
        user, role, department, llm_config, 
        usage_log, quota, conversation
    )
    
    # Create all tables using sync engine
    engine = create_sync_engine_instance()
    Base.metadata.create_all(engine)
    logger.info("✅ Database tables created successfully (sync)")

async def drop_database_tables():
    """
    Drop all database tables. 
    USE WITH CAUTION - this deletes all data!
    """
    engine = create_async_engine_instance()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        logger.info("🗑️  Database tables dropped")

def drop_database_tables_sync():
    """
    Synchronous version of table dropping.
    """
    engine = create_sync_engine_instance()
    Base.metadata.drop_all(engine)
    logger.info("🗑️  Database tables dropped (sync)")

# =============================================================================
# DATABASE HEALTH CHECK
# =============================================================================

async def check_database_connection() -> bool:
    """
    Test if we can connect to the database (async version).
    Returns True if connection is successful, False otherwise.
    """
    try:
        engine = create_async_engine_instance()
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            logger.info("✅ Async database connection successful")
            return result is not None
    except Exception as e:
        logger.warning(f"⚠️ Async database connection failed: {e}")
        return False

def check_database_connection_sync() -> bool:
    """
    Test if we can connect to the database (sync version).
    Returns True if connection is successful, False otherwise.
    """
    try:
        engine = create_sync_engine_instance()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            logger.info("✅ Sync database connection successful")
            return result is not None
    except Exception as e:
        logger.warning(f"⚠️ Sync database connection failed: {e}")
        return False

# =============================================================================
# DATABASE SEEDING FUNCTIONS
# =============================================================================

async def seed_initial_data():
    """
    Seed initial data for Railway deployments.
    
    Creates default roles, departments, and admin user if they don't exist.
    This is idempotent - safe to run multiple times.
    """
    # Only run seeding in production/Railway environment
    if not os.getenv("RAILWAY_ENVIRONMENT") and not os.getenv("DATABASE_URL", "").startswith("postgresql"):
        logger.info("🌱 Skipping data seeding - not in Railway environment")
        return
    
    logger.info("🌱 Starting initial data seeding...")
    
    try:
        async_session_factory = get_async_session_factory()
        async with async_session_factory() as session:
            # Import models here to avoid circular imports
            from ..models.role import Role
            from ..models.department import Department
            from ..models.user import User
            from ..core.security import get_password_hash
            from sqlalchemy import select, func
            
            # Check if seeding is needed
            user_count = await session.scalar(select(func.count(User.id)))
            if user_count > 0:
                logger.info("🌱 Data already exists, skipping seeding")
                return
            
            logger.info("🌱 Creating default roles...")
            
            # Create default roles
            roles_data = [
                {
                    "name": "admin",
                    "display_name": "Administrator",
                    "description": "Full system access with all permissions",
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
                    "description": "Can manage department users, quotas, and view usage reports",
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
                    "description": "Basic AI chat access with personal usage tracking",
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
            for role_data in roles_data:
                role = Role(
                    name=role_data["name"],
                    display_name=role_data["display_name"],
                    description=role_data["description"],
                    level=role_data["level"],
                    is_system_role=role_data["is_system_role"],
                    permissions=role_data["permissions"],
                    created_by="system"
                )
                session.add(role)
                created_roles[role_data["name"]] = role
                logger.info(f"🌱 Created role: {role_data['display_name']}")
            
            # Flush to get role IDs
            await session.flush()
            
            logger.info("🌱 Creating default department...")
            
            # Create default department
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
            await session.flush()
            
            logger.info("🌱 Creating admin user...")
            
            # Create admin user
            admin_user = User(
                email="admin@aidock.dev",
                username="admin",
                full_name="System Administrator",
                password_hash=get_password_hash("admin123"),
                is_admin=True,
                is_active=True,
                is_verified=True,
                role_id=created_roles["admin"].id,
                department_id=department.id,
                job_title="System Administrator",
                bio="Default system administrator account"
            )
            session.add(admin_user)
            
            # Commit all changes
            await session.commit()
            
            logger.info("🌱 ✅ Initial data seeding completed successfully!")
            logger.info("🌱 👑 Admin credentials: admin@aidock.dev / admin123")
            logger.info("🌱 ⚠️  IMPORTANT: Change admin password after first login!")
            
    except Exception as e:
        logger.error(f"🌱 ❌ Failed to seed initial data: {e}")
        # Don't raise exception - let app continue even if seeding fails
        import traceback
        logger.error(f"🌱 Traceback: {traceback.format_exc()}")

# =============================================================================
# STARTUP AND SHUTDOWN HANDLERS
# =============================================================================

async def startup_database():
    """
    Initialize database on application startup with retry logic for Railway.
    
    This function should be called when the FastAPI app starts up.
    Railway database services may take time to be ready, so we retry with exponential backoff.
    """
    logger.info("🔗 Connecting to database...")
    logger.info(f"🔧 Database URL: {settings.database_url[:50]}...")
    logger.info(f"🔧 Database Type: {'PostgreSQL' if is_postgresql() else 'SQLite' if is_sqlite() else 'Unknown'}")
    
    # Retry logic for Railway database readiness (more retries for Railway)
    max_retries = 15  # Increased for Railway
    base_delay = 2   # Start with 2 seconds
    
    for attempt in range(max_retries):
        try:
            # Test both async and sync connections
            async_healthy = await check_database_connection()
            sync_healthy = check_database_connection_sync()
            
            if async_healthy and sync_healthy:
                logger.info(f"✅ Connected to database: {settings.database_url}")
                break
            else:
                raise Exception(f"Connection test failed - Async: {'✅' if async_healthy else '❌'}, Sync: {'✅' if sync_healthy else '❌'}")
                
        except Exception as e:
            if attempt == max_retries - 1:
                # Last attempt failed
                logger.error(f"❌ Failed to connect to database after {max_retries} attempts: {settings.database_url}")
                logger.error(f"   Final error: {e}")
                raise Exception("Database connection failed after all retries")
            
            # Calculate delay with exponential backoff
            delay = base_delay * (2 ** attempt)
            logger.warning(f"⚠️  Database connection attempt {attempt + 1}/{max_retries} failed: {e}")
            logger.info(f"🔄 Retrying in {delay} seconds...")
            await asyncio.sleep(delay)
    
    # Create tables using sync method (more reliable for startup)
    try:
        if is_postgresql():
            logger.info("🐘 PostgreSQL detected - creating tables...")
        else:
            logger.info("💾 SQLite detected - creating tables...")
            
        create_database_tables_sync()
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        logger.error(f"❌ Failed to create database tables: {e}")
        # Log more details for debugging
        logger.error(f"Database URL: {settings.database_url}")
        logger.error(f"Database Type: {'PostgreSQL' if is_postgresql() else 'SQLite'}")
        raise
    
    # Seed initial data (roles, departments, admin user) if needed
    try:
        await seed_initial_data()
        logger.info("✅ Database seeding completed successfully")
    except Exception as e:
        logger.error(f"❌ Failed to seed initial data: {e}")
        # Don't raise exception - let app continue even if seeding fails
        logger.error(f"Database seeding failed, but application will continue")

async def shutdown_database():
    """
    Clean up database connections on application shutdown.
    """
    logger.info("🔌 Closing database connections...")
    
    # Dispose engines if they were created
    global async_engine, sync_engine
    if async_engine:
        await async_engine.dispose()
    if sync_engine:
        sync_engine.dispose()
    
    logger.info("✅ Database connections closed")

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def get_database_url() -> str:
    """Get the current database URL (useful for debugging)."""
    return settings.database_url

def get_async_database_url() -> str:
    """Get the current async database URL (useful for debugging)."""
    return settings.async_database_url

def is_sqlite() -> bool:
    """Check if we're using SQLite database."""
    return settings.database_url.startswith("sqlite")

def is_postgresql() -> bool:
    """Check if we're using PostgreSQL database."""
    return settings.database_url.startswith(("postgresql", "postgres"))

# 🔥 EMERGENCY FIX: Connection pool monitoring
def get_connection_pool_status() -> dict:
    """
    Get current connection pool status for monitoring and debugging.
    
    Returns detailed pool statistics to help diagnose connection issues.
    """
    try:
        status = {
            "timestamp": time.time(),
            "sync_pool": {},
            "async_pool": {},
            "health": "unknown"
        }
        
        # Sync pool status
        if sync_engine and hasattr(sync_engine, 'pool'):
            pool = sync_engine.pool
            status["sync_pool"] = {
                "size": pool.size(),
                "checked_in": pool.checkedin(),
                "checked_out": pool.checkedout(),
                "overflow": pool.overflow(),
                "invalid": pool.invalid(),
                "capacity": pool.size() + pool._max_overflow,
                "utilization_pct": round((pool.checkedout() / (pool.size() + pool._max_overflow)) * 100, 1)
            }
        
        # Async pool status
        if async_engine and hasattr(async_engine, 'pool'):
            pool = async_engine.pool
            status["async_pool"] = {
                "size": pool.size(),
                "checked_in": pool.checkedin(),
                "checked_out": pool.checkedout(),
                "overflow": pool.overflow(),
                "invalid": pool.invalid(),
                "capacity": pool.size() + pool._max_overflow,
                "utilization_pct": round((pool.checkedout() / (pool.size() + pool._max_overflow)) * 100, 1)
            }
        
        # Determine health status
        max_utilization = max(
            status["sync_pool"].get("utilization_pct", 0),
            status["async_pool"].get("utilization_pct", 0)
        )
        
        if max_utilization < 70:
            status["health"] = "healthy"
        elif max_utilization < 90:
            status["health"] = "warning"
        else:
            status["health"] = "critical"
            
        return status
        
    except Exception as e:
        logger.error(f"🔥 Failed to get pool status: {e}")
        return {"error": str(e), "timestamp": time.time()}

def log_connection_pool_status():
    """
    Log current connection pool status for monitoring.
    """
    status = get_connection_pool_status()
    if "error" not in status:
        logger.info(f"🔥 POOL STATUS [{status['health'].upper()}]: "
                   f"Sync: {status['sync_pool'].get('utilization_pct', 0)}% "
                   f"({status['sync_pool'].get('checked_out', 0)}/{status['sync_pool'].get('capacity', 0)}) | "
                   f"Async: {status['async_pool'].get('utilization_pct', 0)}% "
                   f"({status['async_pool'].get('checked_out', 0)}/{status['async_pool'].get('capacity', 0)})")
    else:
        logger.error(f"🔥 POOL STATUS ERROR: {status['error']}")

# =============================================================================
# TESTING AND DEVELOPMENT HELPERS
# =============================================================================

def get_sync_session() -> Session:
    """
    Get a synchronous database session for testing or scripts.
    
    Remember to close the session when done!
    """
    session_factory = get_sync_session_factory()
    return session_factory()

async def get_async_session() -> AsyncSession:
    """
    Get an asynchronous database session for testing or scripts.
    
    Remember to close the session when done!
    """
    session_factory = get_async_session_factory()
    return session_factory()

# =============================================================================
# DEBUGGING INFORMATION
# =============================================================================

if __name__ == "__main__":
    print(f"🗄️  Database Configuration:")
    print(f"   Sync URL: {settings.database_url}")
    print(f"   Async URL: {settings.async_database_url}")
    print(f"   Type: {'SQLite' if is_sqlite() else 'PostgreSQL' if is_postgresql() else 'Other'}")
    print(f"   Debug Mode: {settings.debug}")
    print(f"   Available Sessions: Sync ✅ | Async ✅")
