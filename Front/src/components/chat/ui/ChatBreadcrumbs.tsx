// 🍞 Chat Breadcrumbs Component
// NextUI Breadcrumbs with rounded styling to match the model selector component
// Format: Folder > Chat Name > Assistant

import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";

export interface ChatBreadcrumbsProps {
  folderName?: string;
  chatTitle?: string;
  assistantName?: string;
  isNewChat?: boolean;
  className?: string;
}

export const ChatBreadcrumbs: React.FC<ChatBreadcrumbsProps> = ({
  folderName,
  chatTitle,
  assistantName,
  isNewChat = false,
  className = ''
}) => {
  // 🔍 DEBUG: Log breadcrumb props for debugging
  console.log('🍞 ChatBreadcrumbs props:', {
    folderName,
    chatTitle,
    assistantName,
    isNewChat
  });
  
  // Don't render if no context
  if (!folderName && !chatTitle && !assistantName && !isNewChat) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <Breadcrumbs
        variant="solid"
        radius="full"
        classNames={{
          list: "bg-white/5 backdrop-blur-md border border-white/15 shadow-lg rounded-2xl px-4 py-3 min-h-[60px] flex items-center",
          item: "text-white/80 hover:text-white/95 data-[current=true]:text-white/95",
          separator: "text-white/40 text-sm mx-1"
        }}
        itemClasses={{
          item: [
            "hover:text-white/95",
            "cursor-default", 
            "pointer-events-none",
            "font-medium",
            "text-sm",
            "bg-gradient-to-r from-slate-200 via-blue-100 to-white bg-clip-text text-transparent",
            "transition-all duration-300",
            "flex items-center"
          ].join(" "),
          separator: "px-2 text-white/40 font-light"
        }}
      >
        {/* Folder breadcrumb */}
        {folderName && (
          <BreadcrumbItem>
            <span className="truncate max-w-[120px] flex items-center" title={folderName}>
              {folderName}
            </span>
          </BreadcrumbItem>
        )}
        
        {/* Chat title breadcrumb */}
        {chatTitle ? (
          <BreadcrumbItem>
            <span className="truncate max-w-[150px] flex items-center" title={chatTitle}>
              {chatTitle}
            </span>
          </BreadcrumbItem>
        ) : isNewChat ? (
          <BreadcrumbItem>
            <span className="italic opacity-75 flex items-center">New Chat</span>
          </BreadcrumbItem>
        ) : null}
        
        {/* Assistant breadcrumb */}
        {assistantName && (
          <BreadcrumbItem>
            <span className="truncate max-w-[100px] font-semibold flex items-center" title={assistantName}>
              {assistantName}
            </span>
          </BreadcrumbItem>
        )}
      </Breadcrumbs>
    </div>
  );
};