"""Add assistant-file relationship table

Migration to create the many-to-many relationship between assistants and files.
This enables assistants to have persistent file attachments that are automatically
included in any conversation using that assistant.

Migration ID: 001_assistant_files
Date: 2025-07-05
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import os
from datetime import datetime

from app.core.config import settings

async def upgrade_database():
    """
    Add assistant_files relationship table.
    
    This table creates a many-to-many relationship between assistants and files,
    allowing each assistant to have multiple files and each file to be used by
    multiple assistants.
    """
    engine = create_async_engine(settings.async_database_url)
    
    try:
        async with engine.begin() as conn:
            # Create the assistant_files relationship table
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS assistant_files (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    assistant_id INTEGER NOT NULL,
                    file_id INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER NOT NULL,
                    
                    -- Foreign key constraints
                    FOREIGN KEY (assistant_id) REFERENCES assistants(id) 
                        ON DELETE CASCADE,
                    FOREIGN KEY (file_id) REFERENCES file_uploads(id) 
                        ON DELETE CASCADE,
                    FOREIGN KEY (created_by) REFERENCES users(id) 
                        ON DELETE CASCADE,
                    
                    -- Ensure no duplicate file attachments per assistant
                    UNIQUE (assistant_id, file_id)
                );
            """))
            
            # Create indexes for performance
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_assistant_files_assistant_id 
                ON assistant_files(assistant_id);
            """))
            
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_assistant_files_file_id 
                ON assistant_files(file_id);
            """))
            
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_assistant_files_created_at 
                ON assistant_files(created_at DESC);
            """))
            
            print("✅ Successfully created assistant_files table and indexes")
            
    except Exception as e:
        print(f"❌ Error creating assistant_files table: {e}")
        raise
    finally:
        await engine.dispose()

async def downgrade_database():
    """
    Remove assistant_files relationship table.
    
    WARNING: This will permanently delete all assistant-file relationships.
    """
    engine = create_async_engine(settings.async_database_url)
    
    try:
        async with engine.begin() as conn:
            # Drop the table (indexes will be dropped automatically)
            await conn.execute(text("DROP TABLE IF EXISTS assistant_files;"))
            print("✅ Successfully dropped assistant_files table")
            
    except Exception as e:
        print(f"❌ Error dropping assistant_files table: {e}")
        raise
    finally:
        await engine.dispose()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python add_assistant_files_relationship.py [upgrade|downgrade]")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "upgrade":
        print("🔄 Upgrading database: Adding assistant_files table...")
        asyncio.run(upgrade_database())
        print("✅ Migration completed successfully!")
    elif command == "downgrade":
        print("🔄 Downgrading database: Removing assistant_files table...")
        confirmation = input("⚠️  This will permanently delete all assistant-file relationships. Continue? (y/N): ")
        if confirmation.lower() == 'y':
            asyncio.run(downgrade_database())
            print("✅ Downgrade completed!")
        else:
            print("❌ Migration cancelled")
    else:
        print("❌ Invalid command. Use 'upgrade' or 'downgrade'")
        sys.exit(1)
