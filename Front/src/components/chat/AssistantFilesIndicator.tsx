// Assistant Files Indicator
// Shows attached files in chat interface when using an assistant

import React, { useState, useEffect } from 'react';
import { Paperclip, File, ChevronDown, ChevronUp } from 'lucide-react';
import { AssistantSummary } from '../../types/assistant';
import { AssistantFileInfo } from '../../types/assistant-file';
import { assistantFileService } from '../../services/assistantFileService';

interface AssistantFilesIndicatorProps {
  assistant: AssistantSummary;
  className?: string;
}

export const AssistantFilesIndicator: React.FC<AssistantFilesIndicatorProps> = ({
  assistant,
  className = ''
}) => {
  const [files, setFiles] = useState<AssistantFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load assistant files when component mounts or assistant changes
  useEffect(() => {
    if (assistant?.id) {
      loadAssistantFiles();
    }
  }, [assistant?.id]);

  const loadAssistantFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await assistantFileService.getAssistantFiles(assistant.id);
      setFiles(response.files);
      
    } catch (err) {
      console.error('Failed to load assistant files:', err);
      setError('Failed to load files');
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Don't render if no files
  if (!assistant?.file_count || assistant.file_count === 0) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-blue-200 ${className}`}>
        <Paperclip className="w-3 h-3 animate-pulse" />
        <span>Loading files...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center gap-2 text-sm text-red-300 ${className}`}>
        <Paperclip className="w-3 h-3" />
        <span>Error loading files</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Files summary header */}
      <div 
        className="flex items-center gap-2 text-sm text-blue-200 cursor-pointer hover:text-blue-100 transition-colors"
        onClick={toggleExpanded}
      >
        <Paperclip className="w-3 h-3" />
        <span>
          {assistant.file_count} file{assistant.file_count !== 1 ? 's' : ''} attached
        </span>
        {files.length > 0 && (
          <>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </>
        )}
      </div>

      {/* Expanded file list */}
      {isExpanded && files.length > 0 && (
        <div className="ml-5 space-y-1">
          {files.map((file) => (
            <div 
              key={file.id}
              className="flex items-center gap-2 text-xs text-blue-300 bg-blue-500/10 rounded px-2 py-1"
            >
              <File className="w-3 h-3 flex-shrink-0" />
              <span className="truncate flex-1">{file.filename}</span>
              <span className="text-blue-400 flex-shrink-0">{file.file_size_human}</span>
            </div>
          ))}
        </div>
      )}

      {/* Help text when collapsed */}
      {!isExpanded && files.length > 0 && (
        <div className="ml-5 text-xs text-blue-400 opacity-75">
          These files are automatically included in chat context
        </div>
      )}
    </div>
  );
};
