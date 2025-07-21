// AI Dock Message Dropdown Component
// Displays recent message logs in an expandable dropdown

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, Info, AlertCircle, Clock, Hash } from 'lucide-react';

interface MessageData {
  response_preview?: string;
  request_messages_count?: number;
  request_total_chars?: number;
  response_content_length?: number;
  request_parameters?: any;
  session_id?: string;
  request_id?: string;
  error_message?: string;
  messages?: Array<{ role: string; content: string }>;
}

interface MessageDropdownProps {
  messageData?: MessageData;
  isSuccess: boolean;
  className?: string;
}

const MessageDropdown: React.FC<MessageDropdownProps> = ({ 
  messageData, 
  isSuccess, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no message data
  if (!messageData) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatParameters = (params: any): string => {
    if (!params) return 'None';
    try {
      return JSON.stringify(params, null, 2);
    } catch {
      return String(params);
    }
  };

  return (
    <div className={`mt-2 ${className}`}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={toggleExpanded}
        className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Hide message details' : 'Show message details'}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 mr-1" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-1" />
        )}
        <MessageSquare className="h-4 w-4 mr-1" />
        <span className="font-medium">Message Details</span>
      </button>

      {/* Dropdown Content */}
      {isExpanded && (
        <div className="mt-3 ml-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="space-y-3">
            
            {/* Request Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Hash className="h-4 w-4 mr-2 text-blue-500" />
                <span className="font-medium">Messages:</span>
                <span className="ml-1 text-gray-900">
                  {messageData.request_messages_count || 0}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
                <span className="font-medium">Input Chars:</span>
                <span className="ml-1 text-gray-900">
                  {(messageData.request_total_chars || 0).toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                <span className="font-medium">Output Chars:</span>
                <span className="ml-1 text-gray-900">
                  {(messageData.response_content_length || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* 🆕 Messages Preview Section */}
            {Array.isArray(messageData.messages) && messageData.messages.length > 0 && (
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium text-gray-700">Messages Sent</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {messageData.messages.map((msg, idx) => (
                    <MessagePreview key={idx} role={msg.role} content={msg.content} />
                  ))}
                </div>
              </div>
            )}

            {/* Response Preview */}
            {messageData.response_preview && (
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium text-gray-700">AI Response Preview:</span>
                </div>
                <div className="bg-white p-3 rounded border text-sm text-gray-800 max-h-32 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                    {messageData.response_preview}
                  </pre>
                  {messageData.response_preview.length >= 500 && (
                    <span className="text-gray-500 italic">... (truncated at 500 characters)</span>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {!isSuccess && messageData.error_message && (
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  <span className="font-medium text-gray-700">Error Details:</span>
                </div>
                <div className="bg-red-50 p-3 rounded border border-red-200 text-sm text-red-800">
                  <pre className="whitespace-pre-wrap font-sans">
                    {messageData.error_message}
                  </pre>
                </div>
              </div>
            )}

            {/* Request Parameters */}
            {messageData.request_parameters && (
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="font-medium text-gray-700">Request Parameters:</span>
                </div>
                <div className="bg-white p-3 rounded border text-xs text-gray-700 max-h-32 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono">
                    {formatParameters(messageData.request_parameters)}
                  </pre>
                </div>
              </div>
            )}

            {/* Session and Request IDs */}
            {(messageData.session_id || messageData.request_id) && (
              <div className="border-t border-gray-200 pt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
                  {messageData.session_id && (
                    <div>
                      <span className="font-medium">Session ID:</span>
                      <div className="mt-1 font-mono bg-gray-100 p-2 rounded text-gray-800 break-all">
                        {messageData.session_id}
                      </div>
                    </div>
                  )}
                  
                  {messageData.request_id && (
                    <div>
                      <span className="font-medium">Request ID:</span>
                      <div className="mt-1 font-mono bg-gray-100 p-2 rounded text-gray-800 break-all">
                        {messageData.request_id}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDropdown;

/**
 * Learning Summary: MessageDropdown Component
 * 
 * This component demonstrates several key React patterns:
 * 
 * 1. **Controlled Expansion**: Uses useState to manage dropdown state
 *    with proper ARIA attributes for accessibility
 * 
 * 2. **Conditional Rendering**: Shows different content based on 
 *    success/error status and available data fields
 * 
 * 3. **Data Formatting**: Handles JSON serialization and text truncation
 *    with graceful error handling
 * 
 * 4. **Responsive Design**: Uses grid layouts that adapt to screen size
 *    while maintaining readability
 * 
 * 5. **Visual Hierarchy**: Uses icons, colors, and spacing to guide
 *    users through different types of information
 * 
 * 6. **Accessibility**: Includes proper ARIA labels, focus management,
 *    and keyboard navigation support
 * 
 * This pattern can be reused for other expandable detail views
 * throughout the application.
 */

// Helper component for message preview with expand/collapse for long content
const MessagePreview: React.FC<{ role: string; content: string }> = ({ role, content }) => {
  const [expanded, setExpanded] = React.useState(false);
  const isLong = content.length > 300;
  const displayContent = expanded || !isLong ? content : content.slice(0, 300) + '...';
  const roleColor =
    role === 'user' ? 'bg-blue-100 text-blue-800' :
    role === 'assistant' ? 'bg-green-100 text-green-800' :
    'bg-gray-100 text-gray-700';

  return (
    <div className={`rounded-lg border border-gray-200 p-2 text-sm ${roleColor} relative`}>
      <div className="flex items-center mb-1">
        <span className="font-semibold mr-2 capitalize">{role}</span>
        {isLong && (
          <button
            className="ml-auto text-xs text-blue-500 hover:underline focus:outline-none"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      <pre className="whitespace-pre-wrap font-sans leading-relaxed break-words">{displayContent}</pre>
    </div>
  );
};