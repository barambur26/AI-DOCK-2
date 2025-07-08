#!/usr/bin/env python3
"""
Database Schema Explorer for AI Dock

This script examines your current database schema and shows:
- What tables exist
- What columns each table has
- Foreign key relationships
- Indexes and constraints

Run this to see exactly what's in your database.
"""

import sys
import asyncio
from pathlib import Path

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import async_engine, AsyncSessionLocal
from sqlalchemy import text, inspect
from sqlalchemy.ext.asyncio import AsyncSession
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_database_type():
    """Determine if we're using PostgreSQL or SQLite."""
    async with async_engine.begin() as conn:
        # Try to get database name
        try:
            result = await conn.execute(text("SELECT current_database()"))
            db_name = (await result.fetchone())[0]
            return "postgresql", db_name
        except:
            try:
                result = await conn.execute(text("SELECT sqlite_version()"))
                version = (await result.fetchone())[0]
                return "sqlite", f"SQLite {version}"
            except:
                return "unknown", "Unknown database type"

async def show_postgresql_tables():
    """Show PostgreSQL table structure."""
    print("📋 EXAMINING POSTGRESQL TABLES...")
    print("=" * 50)
    
    async with AsyncSessionLocal() as session:
        
        # Get all tables in public schema
        tables_query = text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        
        tables_result = await session.execute(tables_query)
        tables = [row[0] for row in tables_result.fetchall()]
        
        if not tables:
            print("❌ No tables found in the database!")
            print("   The database appears to be empty.")
            print("   Run the admin setup script to create tables.")
            return []
        
        print(f"Found {len(tables)} tables:")
        for table in tables:
            print(f"  📄 {table}")
        
        print("\n" + "=" * 50)
        
        # Show detailed structure for each table
        for table_name in tables:
            await show_table_details(session, table_name)
        
        return tables

async def show_table_details(session: AsyncSession, table_name: str):
    """Show detailed information about a specific table."""
    print(f"\n🏗️  TABLE: {table_name.upper()}")
    print("-" * 40)
    
    # Get columns
    columns_query = text("""
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = :table_name 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
    """)
    
    columns_result = await session.execute(columns_query, {"table_name": table_name})
    columns = columns_result.fetchall()
    
    print("COLUMNS:")
    for col in columns:
        col_name, data_type, is_nullable, default, max_length = col
        nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
        length_info = f"({max_length})" if max_length else ""
        default_info = f" DEFAULT {default}" if default else ""
        print(f"  • {col_name}: {data_type}{length_info} {nullable}{default_info}")
    
    # Get primary keys
    pk_query = text("""
        SELECT column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = :table_name 
        AND tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public';
    """)
    
    pk_result = await session.execute(pk_query, {"table_name": table_name})
    primary_keys = [row[0] for row in pk_result.fetchall()]
    
    if primary_keys:
        print(f"PRIMARY KEY: {', '.join(primary_keys)}")
    
    # Get foreign keys
    fk_query = text("""
        SELECT 
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = :table_name
        AND tc.table_schema = 'public';
    """)
    
    fk_result = await session.execute(fk_query, {"table_name": table_name})
    foreign_keys = fk_result.fetchall()
    
    if foreign_keys:
        print("FOREIGN KEYS:")
        for fk in foreign_keys:
            col_name, ref_table, ref_column = fk
            print(f"  • {col_name} → {ref_table}.{ref_column}")
    
    # Get indexes
    index_query = text("""
        SELECT 
            indexname,
            indexdef
        FROM pg_indexes 
        WHERE tablename = :table_name 
        AND schemaname = 'public';
    """)
    
    index_result = await session.execute(index_query, {"table_name": table_name})
    indexes = index_result.fetchall()
    
    if indexes:
        print("INDEXES:")
        for idx in indexes:
            idx_name, idx_def = idx
            if not idx_name.endswith("_pkey"):  # Skip primary key indexes
                print(f"  • {idx_name}")

async def show_sqlite_tables():
    """Show SQLite table structure."""
    print("📋 EXAMINING SQLITE TABLES...")
    print("=" * 50)
    
    async with AsyncSessionLocal() as session:
        
        # Get all tables
        tables_query = text("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables_result = await session.execute(tables_query)
        tables = [row[0] for row in tables_result.fetchall()]
        
        if not tables:
            print("❌ No tables found in the database!")
            print("   The database appears to be empty.")
            print("   Run the admin setup script to create tables.")
            return []
        
        print(f"Found {len(tables)} tables:")
        for table in tables:
            print(f"  📄 {table}")
        
        print("\n" + "=" * 50)
        
        # Show detailed structure for each table
        for table_name in tables:
            await show_sqlite_table_details(session, table_name)
        
        return tables

async def show_sqlite_table_details(session: AsyncSession, table_name: str):
    """Show detailed information about a specific SQLite table."""
    print(f"\n🏗️  TABLE: {table_name.upper()}")
    print("-" * 40)
    
    # Get table schema
    schema_query = text(f"PRAGMA table_info({table_name});")
    schema_result = await session.execute(schema_query)
    columns = schema_result.fetchall()
    
    print("COLUMNS:")
    for col in columns:
        col_id, name, col_type, not_null, default, pk = col
        nullable = "NOT NULL" if not_null else "NULL"
        primary = " (PRIMARY KEY)" if pk else ""
        default_info = f" DEFAULT {default}" if default else ""
        print(f"  • {name}: {col_type} {nullable}{default_info}{primary}")
    
    # Get foreign keys
    fk_query = text(f"PRAGMA foreign_key_list({table_name});")
    fk_result = await session.execute(fk_query)
    foreign_keys = fk_result.fetchall()
    
    if foreign_keys:
        print("FOREIGN KEYS:")
        for fk in foreign_keys:
            id, seq, table, from_col, to_col, on_update, on_delete, match = fk
            print(f"  • {from_col} → {table}.{to_col}")

async def check_required_tables():
    """Check if all required tables exist."""
    print("\n🔍 CHECKING REQUIRED TABLES...")
    print("=" * 50)
    
    required_tables = [
        "users",
        "roles", 
        "departments",
        "llm_configurations",
        "usage_logs",
        "department_quotas",
        "conversations",
        "conversation_messages",
        "chat_conversations",
        "chats",
        "assistants",
        "assistant_files",
        "file_uploads",
        "folders"
    ]
    
    async with AsyncSessionLocal() as session:
        db_type, _ = await get_database_type()
        
        if db_type == "postgresql":
            existing_query = text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
            """)
        else:
            existing_query = text("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        
        result = await session.execute(existing_query)
        existing_tables = {row[0] for row in result.fetchall()}
        
        missing_tables = []
        
        for table in required_tables:
            if table in existing_tables:
                print(f"✅ {table}")
            else:
                print(f"❌ {table} (MISSING)")
                missing_tables.append(table)
        
        if missing_tables:
            print(f"\n⚠️  {len(missing_tables)} tables are missing!")
            print("Run the admin setup script to create missing tables:")
            print("   python scripts/create_admin_user.py")
        else:
            print(f"\n🎉 All {len(required_tables)} required tables exist!")
        
        return missing_tables

async def show_data_summary():
    """Show summary of data in key tables."""
    print("\n📊 DATA SUMMARY...")
    print("=" * 50)
    
    try:
        async with AsyncSessionLocal() as session:
            
            # Count records in key tables
            tables_to_check = [
                ("users", "Users"),
                ("roles", "Roles"), 
                ("departments", "Departments"),
                ("conversations", "Conversations"),
                ("file_uploads", "File Uploads"),
                ("usage_logs", "Usage Logs")
            ]
            
            for table_name, display_name in tables_to_check:
                try:
                    count_query = text(f"SELECT COUNT(*) FROM {table_name};")
                    result = await session.execute(count_query)
                    count = result.scalar()
                    print(f"{display_name}: {count:,} records")
                except Exception:
                    print(f"{display_name}: Table not found")
    
    except Exception as e:
        print(f"❌ Error getting data summary: {e}")

async def main():
    """Main function to explore database."""
    print("🔍 AI DOCK DATABASE SCHEMA EXPLORER")
    print("=" * 60)
    
    try:
        # Determine database type
        db_type, db_info = await get_database_type()
        print(f"Database Type: {db_type.upper()}")
        print(f"Database Info: {db_info}")
        
        # Show tables based on database type
        if db_type == "postgresql":
            tables = await show_postgresql_tables()
        elif db_type == "sqlite":
            tables = await show_sqlite_tables()
        else:
            print("❌ Unsupported database type")
            return
        
        # Check required tables
        missing = await check_required_tables()
        
        # Show data summary
        await show_data_summary()
        
        print("\n" + "=" * 60)
        print("🎯 SUMMARY")
        print(f"   Database: {db_type.upper()}")
        print(f"   Tables Found: {len(tables)}")
        print(f"   Missing Tables: {len(missing) if missing else 0}")
        
        if missing:
            print(f"\n⚠️  Action Required:")
            print(f"   Run: python scripts/create_admin_user.py")
            print(f"   This will create {len(missing)} missing tables")
        else:
            print(f"\n✅ Database schema is complete!")
        
    except Exception as e:
        print(f"❌ Error exploring database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Check if we're in the right directory
    if not Path("app").exists():
        print("❌ Error: Please run this script from the /Back directory")
        print("   Example: cd Back && python scripts/explore_current_db.py")
        sys.exit(1)
    
    asyncio.run(main())
