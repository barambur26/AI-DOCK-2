// Assistant File Service
// Service for managing files attached to assistants

import {
  AssistantFileInfo,
  AssistantFilesResponse,
  AssistantFileAttach,
  AssistantFileDetach,
  AssistantFileOperationResponse,
  UserFile
} from '../types/assistant-file';
import { authService } from './authService';

// Use the same API base URL and auth as other services
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Assistant File Service
 * 
 * Handles:
 * - Fetching files attached to assistants
 * - Attaching/detaching files from assistants
 * - Integration with chat interface for file display
 * - File upload and management for assistants
 */
export class AssistantFileService {
  
  /**
   * Get authentication headers using the centralized auth service
   */
  private getAuthHeaders(): Record<string, string> {
    return authService.getAuthHeaders() as Record<string, string>;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/api/assistants${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }
  
  /**
   * Get all files attached to an assistant
   */
  async getAssistantFiles(assistantId: number): Promise<AssistantFilesResponse> {
    try {
      console.log(`📁 Fetching files for assistant ${assistantId}`);
      
      const response = await this.makeRequest<AssistantFilesResponse>(
        `/${assistantId}/files/`
      );
      
      console.log(`✅ Retrieved ${response.total_files} files for assistant ${assistantId}`);
      return response;
      
    } catch (error) {
      console.error(`❌ Failed to fetch files for assistant ${assistantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Attach files to an assistant
   */
  async attachFiles(
    assistantId: number, 
    fileIds: number[]
  ): Promise<AssistantFileOperationResponse> {
    try {
      console.log(`📎 Attaching ${fileIds.length} files to assistant ${assistantId}`);
      
      const data: AssistantFileAttach = { file_ids: fileIds };
      const response = await this.makeRequest<AssistantFileOperationResponse>(
        `/${assistantId}/files/attach`,
        {
          method: 'POST',
          body: JSON.stringify(data)
        }
      );
      
      console.log(`✅ Attached ${response.files_affected} files to assistant ${assistantId}`);
      return response;
      
    } catch (error) {
      console.error(`❌ Failed to attach files to assistant ${assistantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Detach files from an assistant
   */
  async detachFiles(
    assistantId: number, 
    fileIds: number[]
  ): Promise<AssistantFileOperationResponse> {
    try {
      console.log(`📎 Detaching ${fileIds.length} files from assistant ${assistantId}`);
      
      const data: AssistantFileDetach = { file_ids: fileIds };
      const response = await this.makeRequest<AssistantFileOperationResponse>(
        `/${assistantId}/files/detach`,
        {
          method: 'POST',
          body: JSON.stringify(data)
        }
      );
      
      console.log(`✅ Detached ${response.files_affected} files from assistant ${assistantId}`);
      return response;
      
    } catch (error) {
      console.error(`❌ Failed to detach files from assistant ${assistantId}:`, error);
      throw error;
    }
  }

  /**
   * Get user files that can be attached to assistants
   * Uses the files API directly since the file service may not have the needed structure
   */
  async getUserFiles(): Promise<UserFile[]> {
    try {
      console.log('📋 Fetching user files for assistant attachment');
      
      // Call the files API directly to get the user's files
      const response = await fetch(`${API_BASE_URL}/api/files/?page=1&page_size=100`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user files: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      // Map the backend FileListResponse to UserFile format
      // Backend returns FileListResponse with files array containing FileMetadata objects
      const userFiles: UserFile[] = (result.files || []).map((file: any) => ({
        id: file.id, // Already a number in FileMetadata
        original_filename: file.original_filename,
        file_size_human: file.file_size_human,
        mime_type: file.mime_type,
        upload_date: file.upload_date,
        preview_content: undefined // FileMetadata doesn't include preview content
      }));
      
      console.log(`✅ Retrieved ${userFiles.length} user files`);
      return userFiles;
      
    } catch (error) {
      console.error('❌ Failed to fetch user files:', error);
      throw error;
    }
  }

  /**
   * Upload a file and attach it to an assistant
   */
  async uploadAndAttachFile(
    assistantId: number,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; message?: string; fileId?: number }> {
    try {
      console.log(`📤 Uploading and attaching file to assistant ${assistantId}:`, file.name);
      
      // Upload the file directly to the files API
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        headers: {
          // Don't set Content-Type for FormData - browser will set it with boundary
          ...Object.fromEntries(
            Object.entries(this.getAuthHeaders()).filter(([key]) => key !== 'Content-Type')
          )
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`File upload failed: ${uploadResponse.status} ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.id) {
        throw new Error('File upload completed but no file ID was returned');
      }

      const fileId = typeof uploadResult.id === 'string' ? parseInt(uploadResult.id) : uploadResult.id;
      
      // Then attach it to the assistant
      const attachResult = await this.attachFiles(assistantId, [fileId]);
      
      return {
        success: attachResult.success,
        message: `Successfully uploaded and attached ${file.name}`,
        fileId: fileId
      };
      
    } catch (error) {
      console.error(`❌ Failed to upload and attach file to assistant ${assistantId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload and attach file'
      };
    }
  }

  /**
   * Remove all files from an assistant
   */
  async removeAllFiles(assistantId: number): Promise<{ success: boolean; message?: string }> {
    try {
      console.log(`🗑️ Removing all files from assistant ${assistantId}`);
      
      // First get all attached files
      const filesResponse = await this.getAssistantFiles(assistantId);
      
      if (filesResponse.files.length === 0) {
        return {
          success: true,
          message: 'No files to remove'
        };
      }
      
      // Extract file IDs
      const fileIds = filesResponse.files.map(file => file.file_id);
      
      // Detach all files
      const detachResult = await this.detachFiles(assistantId, fileIds);
      
      return {
        success: detachResult.success,
        message: `Successfully removed ${detachResult.files_affected} files`
      };
      
    } catch (error) {
      console.error(`❌ Failed to remove all files from assistant ${assistantId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove files'
      };
    }
  }
  
  /**
   * Get file display information for chat interface
   */
  async getAssistantFilesSummary(assistantId: number): Promise<{
    files: AssistantFileInfo[];
    totalFiles: number;
    totalSize: string;
  }> {
    try {
      const response = await this.getAssistantFiles(assistantId);
      
      return {
        files: response.files,
        totalFiles: response.total_files,
        totalSize: response.total_size_human
      };
      
    } catch (error) {
      console.error(`❌ Failed to get file summary for assistant ${assistantId}:`, error);
      return {
        files: [],
        totalFiles: 0,
        totalSize: '0 B'
      };
    }
  }

  /**
   * Format file size in human readable format
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const assistantFileService = new AssistantFileService();
