// 🍞 Chat Breadcrumbs Component
// Prominent H1 chat title with optional folder context
// Format: Folder context (small) + Large H1 chat title

import React from 'react';
import { Folder } from 'lucide-react';

export interface ChatBreadcrumbsProps {
  folderName?: string;
  chatTitle?: string;
  isNewChat?: boolean;
  className?: string;
}

export const ChatBreadcrumbs: React.FC<ChatBreadcrumbsProps> = ({
  folderName,
  chatTitle,
  isNewChat = false,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      {/* Optional folder context - small and subtle */}
      {folderName && (
        <div className="flex items-center space-x-1 text-xs text-white/50 mb-1">
          <Folder className="w-3 h-3" />
          <span>{folderName}</span>
        </div>
      )}
      
      {/* Prominent chat title */}
      <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
        {chatTitle || 'AI Chat'}
      </h1>
    </div>
  );
};