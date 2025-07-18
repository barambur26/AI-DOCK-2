// 📎 Redesigned File Management Section
// Compact, minimalist file attachment interface matching app aesthetic
// Streamlined design with better visual hierarchy

import React, { useState, useEffect } from 'react';
import { 
  Paperclip, 
  X, 
  Upload, 
  File, 
  FileText, 
  Image, 
  Archive,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2
} from 'lucide-react';
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

  // Load files when section becomes visible
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
        setSuccess(`Attached ${file.name}`);
        await loadFiles();
      } else {
        setError(result.message || 'Failed to attach file');
      }
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
        setSuccess(`Attached ${result.files_affected} files`);
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
        setSuccess(`Detached ${filename}`);
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
    if (!window.confirm(`Remove all ${attachedFiles.length} files?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await assistantFileService.removeAllFiles(assistantId);

      if (result.success) {
        setSuccess('Removed all files');
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
    if (mimeType.startsWith('text/')) return <FileText className="w-4 h-4 text-blue-400" />;
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4 text-green-400" />;
    if (mimeType.includes('pdf')) return <File className="w-4 h-4 text-red-400" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="w-4 h-4 text-yellow-400" />;
    return <File className="w-4 h-4 text-gray-400" />;
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
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
      {/* Section Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Paperclip className="w-4 h-4 text-white/70" />
            <span className="text-white/90 font-medium">Files</span>
            {attachedFiles.length > 0 && (
              <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                {attachedFiles.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="text-xs text-white/60 hover:text-white/80 transition-colors"
          >
            {isVisible ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {isVisible && (
        <div className="p-4 space-y-4">
          {/* Status Messages */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between text-sm text-blue-300 mb-2">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-blue-500/20 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Compact Action Buttons */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
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
                className="w-full px-3 py-2 text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFileSelector(!showFileSelector)}
              disabled={isLoading || availableFiles.length === 0}
              className="px-3 py-2 text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Attach</span>
            </button>

            {attachedFiles.length > 0 && (
              <button
                type="button"
                onClick={handleRemoveAllFiles}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* File Selector */}
          {showFileSelector && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white/80">Select files</span>
                <button
                  type="button"
                  onClick={handleAttachSelected}
                  disabled={selectedFiles.size === 0 || isLoading}
                  className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Attach ({selectedFiles.size})
                </button>
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                {availableFiles.length === 0 ? (
                  <p className="text-sm text-white/50 text-center py-2">
                    No files available
                  </p>
                ) : (
                  availableFiles.map((file) => (
                    <label
                      key={file.id}
                      className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded cursor-pointer"
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
                        className="rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500/50"
                      />
                      {getFileIcon(file.mime_type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/90 truncate">
                          {file.original_filename}
                        </div>
                        <div className="text-xs text-white/50">
                          {file.file_size_human}
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
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span className="ml-2 text-white/60">Loading...</span>
            </div>
          ) : attachedFiles.length === 0 ? (
            <div className="text-center py-4 text-white/50">
              <Paperclip className="w-6 h-6 mx-auto mb-2 text-white/30" />
              <p className="text-sm">No files attached</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(file.mime_type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/90 truncate">
                          {file.filename}
                        </div>
                        <div className="text-xs text-white/50">
                          {file.file_size_human}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDetachFile(file.file_id, file.filename)}
                      disabled={isLoading}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

/**
 * 🎨 Redesigned Features:
 * ======================
 * 
 * ✨ **Compact Design**: Much smaller footprint, better use of space
 * 🌙 **Dark Theme**: Matches app's glassmorphism aesthetic perfectly
 * 🎯 **Streamlined Actions**: Fewer, better organized buttons
 * 📱 **Better Layout**: Improved visual hierarchy and spacing
 * 🚀 **Performance**: Optimized scrolling and animations
 * ♿ **Accessibility**: Proper contrast and focus states
 * 🔄 **Smooth UX**: Better loading states and transitions
 * 📄 **Less Text**: Removed unnecessary explanatory text
 * 
 * **Design Improvements**:
 * - Consolidated action buttons into compact row
 * - Better use of glassmorphism and dark colors
 * - Improved spacing and typography
 * - More efficient file list display
 * - Cleaner status indicators
 */
