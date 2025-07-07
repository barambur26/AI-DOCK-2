// File Management Section Component
// Manages file attachments for assistants in the edit modal

import React, { useState, useEffect } from 'react';
import { 
  Paperclip, 
  X, 
  Upload, 
  File, 
  FileText, 
  Image, 
  Archive,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
// Note: Using native HTML elements following project patterns
import { assistantFileService } from '../../../services/assistantFileService';
import { 
  AssistantFilesResponse, 
  AssistantFileInfo, 
  UserFile,
  AssistantFileOperationResponse 
} from '../../../types/assistant-file';

interface FileManagementSectionProps {
  assistantId: number;
  assistantName: string;
  isVisible: boolean;
  onToggle: () => void;
}

export const FileManagementSection: React.FC<FileManagementSectionProps> = ({
  assistantId,
  assistantName,
  isVisible,
  onToggle
}) => {
  const [attachedFiles, setAttachedFiles] = useState<AssistantFileInfo[]>([]);
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showFileSelector, setShowFileSelector] = useState(false);

  // Load attached files and user files
  useEffect(() => {
    if (isVisible && assistantId) {
      loadFiles();
    }
  }, [isVisible, assistantId]);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [attachedResponse, userFilesResponse] = await Promise.all([
        assistantFileService.getAssistantFiles(assistantId),
        assistantFileService.getUserFiles()
      ]);
      
      setAttachedFiles(attachedResponse.files);
      setUserFiles(userFilesResponse);
    } catch (err: any) {
      setError(`Failed to load files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const result = await assistantFileService.uploadAndAttachFile(
        assistantId,
        file,
        (progress) => setUploadProgress(progress)
      );

      if (result.success) {
        setSuccess(`Successfully uploaded and attached ${file.name}`);
        await loadFiles();
      } else {
        setError(result.message || 'Failed to attach file');
      }
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleAttachSelected = async () => {
    if (selectedFiles.size === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await assistantFileService.attachFiles(
        assistantId,
        Array.from(selectedFiles)
      );

      if (result.success) {
        setSuccess(`Successfully attached ${result.files_affected} files`);
        setSelectedFiles(new Set());
        setShowFileSelector(false);
        await loadFiles();
      } else {
        setError(result.message || 'Failed to attach files');
      }
    } catch (err: any) {
      setError(`Failed to attach files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetachFile = async (fileId: number, filename: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await assistantFileService.detachFiles(assistantId, [fileId]);

      if (result.success) {
        setSuccess(`Successfully detached ${filename}`);
        await loadFiles();
      } else {
        setError(result.message || 'Failed to detach file');
      }
    } catch (err: any) {
      setError(`Failed to detach file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAllFiles = async () => {
    if (!window.confirm(`Remove all ${attachedFiles.length} files from ${assistantName}?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await assistantFileService.removeAllFiles(assistantId);

      if (result.success) {
        setSuccess('Successfully removed all files');
        await loadFiles();
      } else {
        setError(result.message || 'Failed to remove files');
      }
    } catch (err: any) {
      setError(`Failed to remove files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('text/')) return <FileText className="w-4 h-4 text-blue-500" />;
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4 text-green-500" />;
    if (mimeType.includes('pdf')) return <File className="w-4 h-4 text-red-500" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="w-4 h-4 text-yellow-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const availableFiles = userFiles.filter(
    userFile => !attachedFiles.some(attached => attached.file_id === userFile.id)
  );

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Paperclip className="w-5 h-5" />
            <span>File Attachments</span>
            {attachedFiles.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {attachedFiles.length}
              </span>
            )}
          </h3>
          <button
            type="button"
            onClick={onToggle}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {isVisible ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {isVisible && (
        <div className="px-6 py-4 space-y-4">
          {/* Status Messages */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between text-sm text-blue-700 mb-2">
                <span>Uploading file...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isLoading || isUploading}
                accept=".txt,.pdf,.docx,.doc,.md,.csv,.json"
              />
              <button
                type="button"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading || isUploading}
                className="px-3 py-2 text-sm font-medium border border-blue-200 text-blue-600 bg-white rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload & Attach</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFileSelector(!showFileSelector)}
              disabled={isLoading || availableFiles.length === 0}
              className="px-3 py-2 text-sm font-medium border border-green-200 text-green-600 bg-white rounded-md hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Attach Existing</span>
            </button>

            {attachedFiles.length > 0 && (
              <button
                type="button"
                onClick={handleRemoveAllFiles}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium border border-red-200 text-red-600 bg-white rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove All</span>
              </button>
            )}
          </div>

          {/* File Selector */}
          {showFileSelector && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Select files to attach</h4>
                <button
                  type="button"
                  onClick={handleAttachSelected}
                  disabled={selectedFiles.size === 0 || isLoading}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Attach Selected ({selectedFiles.size})
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {availableFiles.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No files available to attach. Upload files first.
                  </p>
                ) : (
                  availableFiles.map((file) => (
                    <label
                      key={file.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedFiles);
                          if (e.target.checked) {
                            newSelected.add(file.id);
                          } else {
                            newSelected.delete(file.id);
                          }
                          setSelectedFiles(newSelected);
                        }}
                        className="rounded"
                      />
                      {getFileIcon(file.mime_type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {file.original_filename}
                        </div>
                        <div className="text-xs text-gray-500">
                          {file.file_size_human} • {new Date(file.upload_date).toLocaleDateString()}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Attached Files List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
          ) : attachedFiles.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No files attached to this assistant</p>
              <p className="text-sm">Files you attach will automatically be included in conversations</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">
                Attached Files ({attachedFiles.length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(file.mime_type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {file.filename}
                        </div>
                        <div className="text-xs text-gray-500">
                          {file.file_size_human} • Attached {new Date(file.attached_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDetachFile(file.file_id, file.filename)}
                      disabled={isLoading}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
