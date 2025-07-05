/**
 * Standalone helper function to get project default assistant by ID
 * Uses caching to ensure repeated calls are cheap
 */

import { projectService } from '../../services/projectService';

// Cache for project default assistants to avoid repeated API calls
const projectCache = new Map<number, { id: number; name: string } | null>();

/**
 * Get the default assistant for a project by ID
 * Uses caching to ensure repeated calls are cheap
 * 
 * @param projectId - The ID of the project
 * @returns Promise resolving to assistant info or null if no default assistant
 */
export const getProjectDefaultAssistantById = async (projectId: number): Promise<{ id: number; name: string } | null> => {
  // Check cache first
  if (projectCache.has(projectId)) {
    return projectCache.get(projectId) || null;
  }
  
  try {
    const projectDetails = await projectService.getProject(projectId);
    
    if (projectDetails && projectDetails.default_assistant_id && projectDetails.default_assistant_name) {
      const assistant = {
        id: projectDetails.default_assistant_id,
        name: projectDetails.default_assistant_name
      };
      projectCache.set(projectId, assistant);
      return assistant;
    }
    
    projectCache.set(projectId, null);
    return null;
  } catch (error) {
    console.error(`Failed to fetch default assistant for project ${projectId}:`, error);
    return null;
  }
};

/**
 * Clear cache for a specific project or all projects
 * Call this after updating a project to ensure fresh data
 * 
 * @param projectId - Optional project ID to clear, if not provided clears all
 */
export const clearProjectDefaultAssistantCache = (projectId?: number): void => {
  if (projectId) {
    projectCache.delete(projectId);
  } else {
    projectCache.clear();
  }
};
