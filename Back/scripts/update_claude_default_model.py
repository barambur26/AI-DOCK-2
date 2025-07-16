#!/usr/bin/env python3
"""
AI Dock - Update Claude Default Model Script

This script updates the existing Claude configuration in the database
to change the default model from "claude-opus-4-0" to "claude-3-5-haiku-latest".

This affects what model shows as "Default" when users open new chats.

Usage:
    cd Back && python scripts/update_claude_default_model.py
"""

import sys
import asyncio
from pathlib import Path

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

async def update_claude_default_model():
    """Update the existing Claude configuration's default model."""
    print("🔄 AI DOCK - UPDATE CLAUDE DEFAULT MODEL")
    print("=" * 50)
    print("This script will:")
    print("  • Find existing Claude/Anthropic configuration(s)")
    print("  • Update default_model from 'claude-opus-4-0' to 'claude-3-5-haiku-latest'")
    print("  • Preserve all other settings")
    print("=" * 50)
    
    try:
        # Import database components
        from app.core.database import get_async_session_factory
        from app.models.llm_config import LLMConfiguration, LLMProvider
        from sqlalchemy import select
        from datetime import datetime
        
        # Get async session
        session_factory = get_async_session_factory()
        
        async with session_factory() as session:
            print("🔍 Searching for Claude/Anthropic configurations...")
            
            # Find all Anthropic configurations
            result = await session.execute(
                select(LLMConfiguration)
                .where(LLMConfiguration.provider == LLMProvider.ANTHROPIC)
            )
            claude_configs = result.scalars().all()
            
            if not claude_configs:
                print("❌ No Claude/Anthropic configurations found!")
                print("   The app might be using a different provider or no configs exist yet.")
                return
            
            print(f"✅ Found {len(claude_configs)} Claude configuration(s):")
            
            updated_count = 0
            
            for config in claude_configs:
                print(f"\n📋 Configuration: {config.name} (ID: {config.id})")
                print(f"   Current default model: {config.default_model}")
                print(f"   Provider: {config.provider.value}")
                print(f"   Active: {config.is_active}")
                
                # Check if this config needs updating
                if config.default_model == "claude-opus-4-0":
                    print("   🔄 Updating default model to claude-3-5-haiku-latest...")
                    
                    # Update the default model
                    config.default_model = "claude-3-5-haiku-latest"
                    config.updated_at = datetime.utcnow()
                    
                    # Ensure the new model is in the available models list
                    if config.available_models and "claude-3-5-haiku-latest" not in config.available_models:
                        print("   📝 Adding claude-3-5-haiku-latest to available models list...")
                        config.available_models.append("claude-3-5-haiku-latest")
                    
                    updated_count += 1
                    print("   ✅ Updated!")
                    
                elif config.default_model == "claude-3-5-haiku-latest":
                    print("   ✅ Already set to claude-3-5-haiku-latest - no change needed")
                    
                else:
                    print(f"   ℹ️  Using different model ({config.default_model}) - skipping")
            
            if updated_count > 0:
                print(f"\n💾 Committing {updated_count} configuration update(s)...")
                await session.commit()
                print("✅ Database update committed successfully!")
                
                print("\n🎉 UPDATE COMPLETE!")
                print("=" * 50)
                print(f"✅ Updated {updated_count} Claude configuration(s)")
                print("✅ Default model changed from 'claude-opus-4-0' to 'claude-3-5-haiku-latest'")
                print("✅ Users opening new chats will now default to Haiku")
                print("\n📝 NEXT STEPS:")
                print("1. No restart required - changes are immediate")
                print("2. Test by opening a new chat in your frontend")
                print("3. Verify 'Claude 3.5 Haiku Latest' shows as 'Default' in model selector")
                
            else:
                print("\n📝 No updates needed - all configurations already use the correct default model")
                
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Make sure you're running this from the Back directory")
        print("   Example: cd Back && python scripts/update_claude_default_model.py")
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ Update failed: {e}")
        print("\nThis might be because:")
        print("  • Database is not running")
        print("  • DATABASE_URL is not set correctly")
        print("  • Database connection failed")
        print("\nError details:")
        import traceback
        print(traceback.format_exc())
        sys.exit(1)

async def main():
    """Main function."""
    # Check if we're in the right directory
    if not Path("app").exists():
        print("❌ Error: Please run this script from the /Back directory")
        print("   Example: cd Back && python scripts/update_claude_default_model.py")
        sys.exit(1)
    
    # Run the update
    await update_claude_default_model()

if __name__ == "__main__":
    asyncio.run(main())
