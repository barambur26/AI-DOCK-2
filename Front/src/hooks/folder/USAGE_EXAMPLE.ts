/**
 * Usage examples for the new helper functions and projectService.getProjectSummary
 * This file demonstrates how to use the helper functions in ChatContainer or other components
 */

import { useFolderContext, getProjectDefaultAssistantById } from './index';
import { projectService } from '../../services/projectService';

// Example 1: Using useFolderContext (owns the helper)
export const ExampleUsingHook = () => {
  const { getProjectDefaultAssistantById: getFromHook } = useFolderContext();
  
  const handleCheckProjectAssistant = async (projectId: number) => {
    // This uses the hook's cached version
    const assistant = await getFromHook(projectId);
    
    if (assistant) {
      console.log(`Project ${projectId} has default assistant: ${assistant.name} (ID: ${assistant.id})`);
      return assistant;
    } else {
      console.log(`Project ${projectId} has no default assistant`);
      return null;
    }
  };
  
  return { handleCheckProjectAssistant };
};

// Example 2: Using standalone helper function (exported)
export const ExampleUsingStandaloneHelper = async (projectId: number) => {
  // This uses the standalone cached helper
  const assistant = await getProjectDefaultAssistantById(projectId);
  
  if (assistant) {
    console.log(`Project ${projectId} has default assistant: ${assistant.name} (ID: ${assistant.id})`);
    return assistant;
  } else {
    console.log(`Project ${projectId} has no default assistant`);
    return null;
  }
};

// Example 3: Using projectService.getProjectSummary directly
export const ExampleUsingProjectService = async (projectId: number) => {
  // This uses the project service's cached getProjectSummary method
  const projectSummary = await projectService.getProjectSummary(projectId);
  
  if (projectSummary && projectSummary.default_assistant_id && projectSummary.default_assistant_name) {
    const assistant = {
      id: projectSummary.default_assistant_id,
      name: projectSummary.default_assistant_name
    };
    console.log(`Project ${projectId} has default assistant: ${assistant.name} (ID: ${assistant.id})`);
    return assistant;
  } else {
    console.log(`Project ${projectId} has no default assistant`);
    return null;
  }
};

// Example 4: Real-world usage in ChatContainer-like component
export const ChatContainerExample = () => {
  const { 
    getProjectDefaultAssistantById,
    getNewChatFolderDefaultAssistant,
    getViewingFolderDefaultAssistant 
  } = useFolderContext();
  
  // Check for default assistant when creating new chat
  const handleNewChatWithFolderDefault = () => {
    const defaultAssistant = getNewChatFolderDefaultAssistant();
    
    if (defaultAssistant) {
      console.log(`Auto-selecting default assistant: ${defaultAssistant.name} (ID: ${defaultAssistant.id})`);
      // Here you would call your assistant selection function
      // handleAssistantSelect(defaultAssistant.id);
    } else {
      console.log('No default assistant for this folder');
    }
  };
  
  // Check for default assistant when loading conversation
  const handleLoadConversationWithProjectDefault = async (conversationId: number, projectId?: number) => {
    // Load the conversation first
    // await handleLoadConversation(conversationId);
    
    // If conversation is in a project, check for default assistant
    if (projectId) {
      const defaultAssistant = await getProjectDefaultAssistantById(projectId);
      
      if (defaultAssistant) {
        console.log(`Auto-selecting project default assistant: ${defaultAssistant.name}`);
        // Here you would call your assistant selection function
        // handleAssistantSelect(defaultAssistant.id);
      }
    }
  };
  
  return {
    handleNewChatWithFolderDefault,
    handleLoadConversationWithProjectDefault
  };
};

// Summary of benefits:
// 1. ✅ useFolderContext owns the helper and exports getProjectDefaultAssistantById
// 2. ✅ Standalone helper exported for direct use when hook context isn't available
// 3. ✅ projectService.getProjectSummary() implemented with caching for efficiency
// 4. ✅ All methods use existing backend endpoint /api/projects/{id}/summary
// 5. ✅ Caching ensures repeated calls are cheap
// 6. ✅ Cache invalidation when projects are updated
// 7. ✅ Consistent return format: { id: number; name: string } | null
