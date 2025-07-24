// 🎛️ Chat Interface Header Component
// Clean header with HeroUI breadcrumbs, restructured layout
// Top left: Sidepanel button + Breadcrumbs | Top right: Model selection + Navbar

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UnifiedModelsResponse, UnifiedModelInfo } from '../../../services/chatService';
import { AssistantSummary } from '../../../types/assistant';
import { ProjectSummary } from '../../../types/project';
import { ModelSelector } from './ModelSelector';
import { UnifiedTraversalButtons } from '../../ui/UnifiedTraversalButtons';
import { AssistantFilesIndicator } from '../AssistantFilesIndicator';
import { ChatBreadcrumbs } from './ChatBreadcrumbs';

export interface ChatHeaderProps {
  // Model selection
  unifiedModelsData: UnifiedModelsResponse | null;
  selectedModelId: string | null;
  currentModelInfo: UnifiedModelInfo | null;
  showAllModels: boolean;
  modelsLoading: boolean;
  modelsError: string | null;
  connectionStatus: 'checking' | 'connected' | 'error';
  groupedModels: { [provider: string]: UnifiedModelInfo[] } | null;
  onModelChange: (modelId: string) => void;
  
  // Assistant and project state
  selectedAssistant: AssistantSummary | null;
  selectedProject: ProjectSummary | null;
  
  // Conversation state
  messages: any[];
  currentConversationId: number | null;
  conversationTitle: string | null;
  isSavingConversation: boolean;
  onSaveConversation: () => void;
  onNewConversation: () => void;
  
  // Breadcrumb context
  folderName?: string;
  
  // Sidebar state
  showUnifiedSidebar?: boolean;
  onToggleSidebar?: () => void;
  isStreaming?: boolean;
  
  // Streaming state
  streamingHasError: boolean;
  streamingError: any;
  connectionState: string;
  
  // UI state
  isMobile: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  unifiedModelsData,
  selectedModelId,
  currentModelInfo,
  showAllModels,
  modelsLoading,
  modelsError,
  connectionStatus,
  groupedModels,
  onModelChange,
  selectedAssistant,
  selectedProject,
  messages,
  currentConversationId,
  conversationTitle,
  isSavingConversation,
  onSaveConversation,
  onNewConversation,
  folderName,
  showUnifiedSidebar = false,
  onToggleSidebar,
  isStreaming = false,
  streamingHasError,
  streamingError,
  connectionState,
  isMobile
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 px-4 md:px-6 py-4 sticky top-0 z-40">
      {/* Main header layout */}
      <div className="flex items-center justify-between">
        
        {/* LEFT SIDE: Sidebar toggle + Breadcrumbs */}
        <div className="flex items-center space-x-4">
          {/* Sidebar toggle button - far left */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              disabled={isStreaming}
              className="bg-blue-500 hover:bg-blue-600 backdrop-blur-lg border-2 border-blue-400 rounded-full p-2 shadow-2xl hover:shadow-3xl group hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
              title={`${showUnifiedSidebar ? 'Hide' : 'Show'} sidebar`}
              aria-label={`${showUnifiedSidebar ? 'Hide' : 'Show'} sidebar`}
            >
              {showUnifiedSidebar ? (
                <ChevronLeft className="w-4 h-4 text-white group-hover:text-blue-100 transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white group-hover:text-blue-100 transition-colors" />
              )}
            </button>
          )}
          
          {/* Breadcrumbs - a little to the right */}
          <ChatBreadcrumbs
            folderName={folderName}
            chatTitle={conversationTitle}
            isNewChat={!currentConversationId && messages.length === 0}
          />
        </div>

        {/* RIGHT SIDE: Model selection + Navbar */}
        <div className="flex items-center space-x-3">
          {/* Model Selection */}
          <ModelSelector
            unifiedModelsData={unifiedModelsData}
            selectedModelId={selectedModelId}
            showAllModels={showAllModels}
            modelsLoading={modelsLoading}
            modelsError={modelsError}
            groupedModels={groupedModels}
            onModelChange={onModelChange}
            isMobile={isMobile}
          />

          {/* Save Conversation button */}
          {messages.length > 0 && !currentConversationId && (
            <button
              onClick={onSaveConversation}
              disabled={isSavingConversation}
              className="px-3 md:px-4 py-2 text-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg transition-all duration-300 flex items-center backdrop-blur-lg touch-manipulation disabled:opacity-50 hover:scale-105"
              title="Save Conversation"
            >
              {isSavingConversation ? (
                <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
              ) : (
                <Save className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
              )}
              <span className="hidden md:inline ml-1">
                {isSavingConversation ? 'Saving...' : 'Save'}
              </span>
            </button>
          )}

          {/* Navigation Buttons - far right */}
          <UnifiedTraversalButtons 
            variant="inline" 
            size="md"
            onNewChat={onNewConversation}
          />
        </div>
      </div>
      
      {/* Status indicators - only show critical states */}
      {(isSavingConversation || isStreaming || streamingHasError) && (
        <div className="mt-3 text-xs md:text-sm text-blue-100">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Auto-save status */}
            {isSavingConversation && (
              <div className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 text-green-300 animate-spin" />
                <span className="text-green-300">Auto-saving...</span>
              </div>
            )}
            
            {/* Streaming status */}
            {isStreaming && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300">Streaming response...</span>
              </div>
            )}
            
            {/* Streaming error status */}
            {streamingHasError && streamingError && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-red-300">Stream error: {streamingError.type}</span>
                {streamingError.shouldFallback && (
                  <span className="text-yellow-300">(using fallback)</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Assistant Files Indicator */}
      {selectedAssistant && (
        <div className="mt-3">
          <AssistantFilesIndicator 
            assistant={selectedAssistant}
            className="" 
          />
        </div>
      )}
    </div>
  );
};