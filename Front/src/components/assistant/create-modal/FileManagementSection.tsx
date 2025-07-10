// File Management Section for Create Assistant Modal
// Manages file selection and upload during assistant creation

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
import { assistantFileService } from '../../../services/assistantFileService';
import { UserFile } from '../../../types/assistant-file';

interface FileManagementSectionProps {
  selectedFileIds: number[];
  onFileIdsChange: (fileIds: number[]) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const FileManagementSection: React.FC<FileManagementSectionProps> = ({
  selectedFileIds,
  onFileIdsChange,
  isVisible,
  onToggle
}) => {
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showFileSelector, setShowFileSelector] = useState(false);

  // Load user files when section becomes visible
  useEffect(() => {
    if (isVisible) {
      loadUserFiles();
    }
  }, [isVisible]);

  const loadUserFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const files = await assistantFileService.getUserFiles();
      setUserFiles(files);
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
      // Upload file using the files API directly
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await new Promise<{id: number, filename: string}>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', 'https://idyllic-moxie-aedb62.netlify.app/0/api/files/upload');
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
        xhr.send(formData);
      });

      // Add uploaded file to selected files
      const newSelectedIds = [...selectedFileIds, uploadResponse.id];
      onFileIdsChange(newSelectedIds);
      
      setSuccess(`Successfully uploaded ${file.name}`);
      await loadUserFiles(); // Refresh file list
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleFileToggle = (fileId: number) => {
    const newSelectedIds = selectedFileIds.includes(fileId)
      ? selectedFileIds.filter(id => id !== fileId)
      : [...selectedFileIds, fileId];
    onFileIdsChange(newSelectedIds);
  };

  const handleRemoveFile = (fileId: number) => {
    const newSelectedIds = selectedFileIds.filter(id => id !== fileId);
    onFileIdsChange(newSelectedIds);
  };

  const handleClearAll = () => {
    onFileIdsChange([]);
    setShowFileSelector(false);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('text/')) return <FileText className="w-4 h-4 text-blue-500" />;
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4 text-green-500" />;
    if (mimeType.includes('pdf')) return <File className="w-4 h-4 text-red-500" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="w-4 h-4 text-yellow-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const selectedFiles = userFiles.filter(file => selectedFileIds.includes(file.id));
  const availableFiles = userFiles.filter(file => !selectedFileIds.includes(file.id));

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
    <div className="bg-gray-50 border border-gray-200 rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-900 flex items-center space-x-2">
            <Paperclip className="w-5 h-5" />
            <span>File Attachments</span>
            {selectedFileIds.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {selectedFileIds.length}
              </span>
            )}
          </h4>
          <button
            type="button"
            onClick={onToggle}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {isVisible ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Files will be automatically attached to your assistant after creation
        </p>
      </div>

      {isVisible && (
        <div className="px-4 py-4 space-y-4">
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
                id="create-file-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isLoading || isUploading}
                accept=".txt,.pdf,.docx,.doc,.md,.csv,.json"
              />
              <button
                type="button"
                onClick={() => document.getElementById('create-file-upload')?.click()}
                disabled={isLoading || isUploading}
                className="px-3 py-2 text-sm font-medium border border-blue-200 text-blue-600 bg-white rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFileSelector(!showFileSelector)}
              disabled={isLoading || availableFiles.length === 0}
              className="px-3 py-2 text-sm font-medium border border-green-200 text-green-600 bg-white rounded-md hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Select Files</span>
            </button>

            {selectedFileIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium border border-red-200 text-red-600 bg-white rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* File Selector */}
          {showFileSelector && (
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h5 className="font-medium text-gray-900 mb-3">Select files to attach</h5>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {availableFiles.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No files available to attach. Upload files first.
                  </p>
                ) : (
                  availableFiles.map((file) => (
                    <label
                      key={file.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFileIds.includes(file.id)}
                        onChange={() => handleFileToggle(file.id)}
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

          {/* Selected Files List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
          ) : selectedFiles.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No files selected</p>
              <p className="text-sm">Upload or select files to attach to your assistant</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900">
                Selected Files ({selectedFiles.length})
              </h5>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {selectedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(file.mime_type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {file.original_filename}
                        </div>
                        <div className="text-xs text-gray-500">
                          {file.file_size_human} • {new Date(file.upload_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
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