// Assistant File Types
// TypeScript interfaces for assistant file attachments

export interface AssistantFileInfo {
  id: number;
  file_id: number;
  filename: string;
  file_size: number;
  file_size_human: string;
  mime_type: string;
  upload_date: string;
  attached_at: string;
  attached_by: number;
}

export interface AssistantFilesResponse {
  assistant_id: number;
  assistant_name: string;
  files: AssistantFileInfo[];
  total_files: number;
  total_size: number;
  total_size_human: string;
}

export interface AssistantFileAttach {
  file_ids: number[];
}

export interface AssistantFileDetach {
  file_ids: number[];
}

export interface AssistantFileOperationResponse {
  success: boolean;
  message: string;
  assistant_id: number;
  files_affected: number;
  current_file_count: number;
  errors?: string[];
  skipped_files?: Array<{
    file_id: number;
    filename?: string;
    reason: string;
  }>;
}

// User's uploaded files for selection
export interface UserFile {
  id: number;
  original_filename: string;
  file_size?: number; // Optional since FileMetadata doesn't always include bytes
  file_size_human: string;
  mime_type: string;
  upload_date: string;
  preview_content?: string;
}
