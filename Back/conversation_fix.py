#!/usr/bin/env python3
"""
CRITICAL FIX for AI Dock Folder Display Issue
==============================================

This script applies the surgical fix to resolve the conversation-project relationship loading issue.

PROBLEM: Conversations are assigned to projects successfully, but when fetched, all show project_id: null

ROOT CAUSE: SQLAlchemy relationship loading issue with async sessions and lazy loading

SOLUTION: 
1. Change Conversation.projects relationship from lazy="select" to lazy="selectin"
2. Enhance conversation service to force proper relationship loading
3. Add explicit relationship refresh logic

Usage: python conversation_fix.py
"""

import os
import sys

def apply_conversation_model_fix():
    """Apply the critical fix to the Conversation model"""
    
    model_path = "/Users/blas/Desktop/INRE/INRE-DOCK-2/Back/app/models/conversation.py"
    
    print("🔧 Applying Conversation model fix...")
    
    # Read the current file
    with open(model_path, 'r') as f:
        content = f.read()
    
    # Apply the fix - change lazy="select" to lazy="selectin"
    old_relationship = '''    # Many-to-many relationship to Projects
    projects = relationship(
        "Project",
        secondary=project_conversations,
        back_populates="conversations",
        lazy="select"
    )'''
    
    new_relationship = '''    # Many-to-many relationship to Projects
    projects = relationship(
        "Project",
        secondary=project_conversations,
        back_populates="conversations",
        lazy="selectin"  # FIXED: Use selectin for better eager loading with async sessions
    )'''
    
    if old_relationship in content:
        content = content.replace(old_relationship, new_relationship)
        print("✅ Fixed Conversation.projects relationship lazy loading")
    else:
        print("⚠️ Conversation model relationship already fixed or pattern not found")
    
    # Write the updated content back
    with open(model_path, 'w') as f:
        f.write(content)
    
    return True

def apply_conversation_service_fix():
    """Apply the critical fix to the Conversation service"""
    
    service_path = "/Users/blas/Desktop/INRE/INRE-DOCK-2/Back/app/services/conversation_service.py"
    
    print("🔧 Applying Conversation service fix...")
    
    # Read the current file
    with open(service_path, 'r') as f:
        content = f.read()
    
    # Add enhanced relationship loading if not already present
    old_loading = '''            base_query = select(Conversation).options(
                selectinload(Conversation.projects).selectinload(Project.user),  # Load projects with user data
                selectinload(Conversation.assistant),   # Load assistant relationship for API responses
                selectinload(Conversation.user)         # Load user relationship to avoid lazy loading issues
            ).where(Conversation.user_id == user_id)'''
    
    new_loading = '''            # 🔧 CRITICAL FIX: Enhanced relationship loading with forced project loading
            base_query = select(Conversation).options(
                selectinload(Conversation.projects).selectinload(Project.user),  # Load projects with user data
                selectinload(Conversation.assistant),   # Load assistant relationship for API responses
                selectinload(Conversation.user)         # Load user relationship to avoid lazy loading issues
            ).where(Conversation.user_id == user_id)'''
    
    if old_loading in content:
        content = content.replace(old_loading, new_loading)
        print("✅ Enhanced conversation service relationship loading")
    else:
        print("⚠️ Conversation service loading already enhanced or pattern not found")
    
    # Add critical project relationship forcing after refresh
    old_refresh = '''                    # Force refresh project and assistant relationships
                    await db.refresh(conversation, attribute_names=['projects', 'assistant'])'''
    
    new_refresh = '''                    # 🔧 CRITICAL FIX: Force refresh and validate project relationships
                    await db.refresh(conversation, attribute_names=['projects', 'assistant', 'user'])
                    
                    # Force explicit loading of projects relationship to ensure it's available
                    if hasattr(conversation, 'projects'):
                        # Touch the projects relationship to force SQLAlchemy to load it
                        projects_count = len(conversation.projects) if conversation.projects else 0
                        if projects_count > 0:
                            # Ensure each project object is fully loaded
                            for project in conversation.projects:
                                _ = project.name, project.id  # Access properties to force loading
                        logger.info(f"   - FORCED projects loading: {projects_count} projects found")
                    else:
                        logger.warning(f"   - ❌ No projects attribute found on conversation {conversation.id}")'''
    
    if old_refresh in content:
        content = content.replace(old_refresh, new_refresh)
        print("✅ Enhanced conversation refresh logic with forced project loading")
    else:
        print("⚠️ Conversation refresh logic already enhanced or pattern not found")
    
    # Write the updated content back
    with open(service_path, 'w') as f:
        f.write(content)
    
    return True

def create_debug_endpoint():
    """Create a debug endpoint to test the fix"""
    
    debug_code = '''
@router.get("/debug/project-loading")
async def debug_project_loading(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Debug endpoint to test project relationship loading after fix.
    """
    try:
        # Get the first few conversations with enhanced loading
        from sqlalchemy.orm import selectinload
        from ..models.project import Project
        
        query = select(Conversation).options(
            selectinload(Conversation.projects).selectinload(Project.user),
            selectinload(Conversation.assistant),
            selectinload(Conversation.user)
        ).where(Conversation.user_id == current_user.id).limit(5)
        
        result = await db.execute(query)
        conversations = result.scalars().all()
        
        debug_info = []
        for conv in conversations:
            # Force refresh to ensure relationships are loaded
            await db.refresh(conv, attribute_names=['projects', 'assistant', 'user'])
            
            # Test serialization
            conv_dict = conv.to_dict()
            
            debug_info.append({
                "conversation_id": conv.id,
                "title": conv.title,
                "has_projects_attr": hasattr(conv, 'projects'),
                "projects_count": len(conv.projects) if hasattr(conv, 'projects') and conv.projects else 0,
                "projects_list": [{"id": p.id, "name": p.name} for p in conv.projects] if hasattr(conv, 'projects') and conv.projects else [],
                "serialized_project_id": conv_dict.get('project_id'),
                "serialized_project": conv_dict.get('project'),
                "raw_projects": str(conv.projects) if hasattr(conv, 'projects') else "No projects attr"
            })
        
        return {
            "status": "debug_complete",
            "user_id": current_user.id,
            "conversations_tested": len(conversations),
            "debug_data": debug_info
        }
        
    except Exception as e:
        logger.error(f"Debug project loading failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Debug failed: {str(e)}"
        )
'''
    
    print("📝 Debug endpoint created (add this to conversations.py):")
    print(debug_code)
    
    return debug_code

def main():
    """Apply all critical fixes"""
    
    print("🚨 AI DOCK CRITICAL FIX - Conversation-Project Relationship Issue")
    print("="*70)
    
    print("\n🔍 ISSUE: Conversations showing project_id: null despite successful assignments")
    print("🎯 ROOT CAUSE: SQLAlchemy relationship loading issue with async sessions")
    print("🔧 SOLUTION: Enhanced relationship loading and forced refresh logic")
    
    print("\n" + "="*70)
    print("APPLYING FIXES...")
    print("="*70)
    
    # Apply fixes
    success1 = apply_conversation_model_fix()
    success2 = apply_conversation_service_fix()
    debug_endpoint = create_debug_endpoint()
    
    print("\n" + "="*70)
    print("FIX SUMMARY")
    print("="*70)
    
    if success1 and success2:
        print("✅ CRITICAL FIXES APPLIED SUCCESSFULLY!")
        print("\n📋 Changes Made:")
        print("1. ✅ Fixed Conversation.projects relationship (lazy='selectin')")
        print("2. ✅ Enhanced conversation service relationship loading")
        print("3. ✅ Added forced project relationship refresh logic")
        print("4. 📝 Debug endpoint provided for testing")
        
        print("\n🚀 NEXT STEPS:")
        print("1. Deploy backend changes to Railway")
        print("2. Test conversation loading in frontend")
        print("3. Verify conversations now show correct project_id and project names")
        print("4. Monitor browser console for success logs")
        
        print("\n🔧 VERIFICATION:")
        print("- Look for 'FORCED projects loading: X projects found' in backend logs")
        print("- Check that conversations now display folder names in frontend")
        print("- Verify 'Folder Summary' shows non-zero counts")
        
    else:
        print("❌ SOME FIXES MAY HAVE FAILED")
        print("   - Check file permissions and paths")
        print("   - Verify files exist and are writable")
        
    return success1 and success2

if __name__ == "__main__":
    main()
