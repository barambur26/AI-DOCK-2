// AI Dock Message Dropdown Component
// Displays recent message logs in an expandable dropdown

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, Info, AlertCircle, Hash } from 'lucide-react';

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



  return (
    <div className={`mt-2 ${className}`}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={toggleExpanded}
        className={`flex items-center px-4 py-2 rounded-xl font-medium border border-white/10 bg-white/10 text-blue-200 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-lg ${isExpanded ? 'shadow-lg' : ''}`}
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
        <div className="mt-3 bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
          <div className="space-y-3">
            
            {/* Request Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center text-blue-200">
                <Hash className="h-4 w-4 mr-2 text-blue-400" />
                <span className="font-medium">Messages:</span>
                <span className="ml-1 text-white">
                  {messageData.request_messages_count || 0}
                </span>
              </div>
              
              <div className="flex items-center text-blue-200">
                <MessageSquare className="h-4 w-4 mr-2 text-green-400" />
                <span className="font-medium">Input Chars:</span>
                <span className="ml-1 text-white">
                  {(messageData.request_total_chars || 0).toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center text-blue-200">
                <MessageSquare className="h-4 w-4 mr-2 text-purple-400" />
                <span className="font-medium">Output Chars:</span>
                <span className="ml-1 text-white">
                  {(messageData.response_content_length || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Messages Preview Section */}
            {Array.isArray(messageData.messages) && messageData.messages.length > 0 && (
              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="font-medium text-blue-200">Messages Sent</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {messageData.messages.map((msg, idx) => (
                    <MessagePreview key={idx} role={msg.role} content={msg.content} />
                  ))}
                </div>
              </div>
            )}



            {/* Error Message */}
            {!isSuccess && messageData.error_message && (
              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                  <span className="font-medium text-blue-200">Error Details:</span>
                </div>
                <div className="bg-red-500/20 p-3 rounded-xl border border-red-400/30 text-sm text-red-300 backdrop-blur-lg">
                  <pre className="whitespace-pre-wrap font-sans">
                    {messageData.error_message}
                  </pre>
                </div>
              </div>
            )}



            {/* Session and Request IDs */}
            {(messageData.session_id || messageData.request_id) && (
              <div className="border-t border-white/10 pt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-200">
                  {messageData.session_id && (
                    <div>
                      <span className="font-medium">Session ID:</span>
                      <div className="mt-1 font-mono bg-white/10 p-2 rounded-xl text-white break-all backdrop-blur-lg border border-white/10">
                        {messageData.session_id}
                      </div>
                    </div>
                  )}
                  
                  {messageData.request_id && (
                    <div>
                      <span className="font-medium">Request ID:</span>
                      <div className="mt-1 font-mono bg-white/10 p-2 rounded-xl text-white break-all backdrop-blur-lg border border-white/10">
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
    role === 'user' ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' :
    role === 'assistant' ? 'bg-green-500/20 text-green-200 border-green-400/30' :
    'bg-white/10 text-blue-200 border-white/20';

  return (
    <div className={`rounded-xl border p-3 text-sm ${roleColor} relative backdrop-blur-lg`}>
      <div className="flex items-center mb-2">
        <span className="font-semibold mr-2 capitalize text-white">{role}</span>
        {isLong && (
          <button
            className="ml-auto text-xs text-blue-300 hover:text-blue-200 hover:underline focus:outline-none transition-colors"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      <pre className="whitespace-pre-wrap font-sans leading-relaxed break-words text-white">{displayContent}</pre>
    </div>
  );
};