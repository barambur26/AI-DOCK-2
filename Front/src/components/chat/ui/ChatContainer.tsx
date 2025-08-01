// 💬 Main Chat Interface Container (Refactored) - FIXED VERSION
// Orchestrates all chat functionality with proper folder separation
// Folders are purely organizational and don't interfere with active chats

import React, { useEffect, useCallback, useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { MessageList } from '../MessageList';
import { MessageInput } from '../MessageInput';
import { UnifiedSidebar } from './UnifiedSidebar';

import { AssistantSuggestions } from '../AssistantSuggestions';
import { AssistantEditPopup } from '../../assistant/AssistantEditPopup';
import { ChatHeader } from './ChatHeader';
import { ErrorDisplay } from './ErrorDisplay';
import { useChatState } from '../../../hooks/chat/useChatState';
import { useModelSelection } from '../../../hooks/chat/useModelSelection';
import { useAssistantManager } from '../../../hooks/chat/useAssistantManager';
import { useConversationManager } from '../../../hooks/chat/useConversationManager';
import { useResponsiveLayout } from '../../../hooks/chat/useResponsiveLayout';
import { useAuth } from '../../../hooks/useAuth';
import { useSidebarState } from '../../../hooks/chat/useSidebarState';
import { useFolderContext } from '../../../hooks/folder/useFolderContext';
import { getProjectDefaultAssistantById } from '../../../hooks/folder/getProjectDefaultAssistantById';
import { DEFAULT_AUTO_SAVE_CONFIG, shouldAutoSave } from '../../../types/conversation';
import type { FileAttachment } from '../../../types/file';
import { assistantService } from '../../../services/assistantService';
import { ChatMessage } from '../../../types/chat';
import { useSearchParams } from 'react-router-dom';

export const ChatContainer: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 🎯 Assistant Edit Popup State
  const [showAssistantEditPopup, setShowAssistantEditPopup] = useState(false);
  const [editingAssistantId, setEditingAssistantId] = useState<number | null>(null);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  
  // 📱 Responsive layout state
  const { isMobile } = useResponsiveLayout();
  
  // 📁 Unified Sidebar state
  const {
    isOpen: showUnifiedSidebar,
    mode: sidebarMode,
    toggleSidebar,
    setSidebarOpen: setShowUnifiedSidebar,
    setSidebarMode,
    toggleMode: toggleSidebarMode
  } = useSidebarState('conversations', false);
  
  // 🔧 FIXED: Folder context (organizational only, no active chat interference)
  const {
    viewingFolderId,
    viewingFolder,
    folderForNewChat,
    folderForNewChatData,
    setViewingFolder,
    setFolderForNewChat,
    clearNewChatFolderContext,
    getNewChatFolderDefaultAssistantId,
    hasNewChatFolderContext
  } = useFolderContext();
  
  // 🎯 Model selection management
  const {
    unifiedModelsData,
    selectedModelId,
    selectedConfigId,
    currentModelInfo,
    showAllModels,
    modelsLoading,
    modelsError,
    connectionStatus,
    groupedModels,
    selectedConfig,
    handleModelChange,
    setError: setModelError
  } = useModelSelection();

  // 🤖 Assistant management
  const {
    availableAssistants,
    selectedAssistantId,
    selectedAssistant,
    assistantsLoading,
    assistantsError,
    showAssistantManager,
    handleAssistantSelect,
    handleAssistantChange,
    handleAssistantIntroduction,
    setShowAssistantManager,
    clearAssistantFromUrl,
    loadAvailableAssistants,
    deactivateAssistant
  } = useAssistantManager((message) => {
    // Handle assistant messages
    addMessage(message);
  });

  // 💾 Conversation management
  const {
    currentConversationId,
    conversationTitle,
    conversationProjectId, // Get the conversation's original project/folder
    conversationProjectName, // Get the conversation's original project/folder name
    conversationAssistantId, // Get the conversation's assigned assistant
    isSavingConversation,
    lastAutoSaveMessageCount,

    conversationRefreshTrigger,
    sidebarUpdateFunction,
    sidebarAddConversationFunction,
    handleAutoSaveConversation,
    handleSaveConversation,
    handleLoadConversation,
    handleNewConversation,

    setSidebarFunctions,
    handleAddConversationToSidebar
  } = useConversationManager(
    (error) => setError(error), // onError
    (messages) => {
      // onConversationLoad
      setMessages(messages);
      setError(null);
      clearAssistantFromUrl();
    },
    () => {
      // onConversationClear
      clearChat();
      clearAssistantFromUrl();
    }
  );
  
  // 💾 Create autosave callback for post-streaming saves
  const handlePostStreamingAutosave = useCallback((messages: ChatMessage[]) => {
    const saveConfig = {
      selectedConfigId: selectedConfigId || undefined,
      selectedModelId: selectedModelId || undefined,
      projectId: currentConversationId ? (conversationProjectId || undefined) : folderForNewChat || undefined
    };
    
    handleAutoSaveConversation(messages, saveConfig);
    
    // Clear folder context after successful auto-save of new chat
    if (!currentConversationId && hasNewChatFolderContext()) {
      console.log('🧹 Clearing folder context after post-streaming auto-save');
      clearNewChatFolderContext();
    }
  }, [
    selectedConfigId,
    selectedModelId,
    currentConversationId,
    conversationProjectId,
    folderForNewChat,
    handleAutoSaveConversation,
    hasNewChatFolderContext,
    clearNewChatFolderContext
  ]);

  // 💬 Chat state management - FIXED: Remove project interference
  const {
    messages,
    isLoading,
    error,
    isStreaming,
    accumulatedContent,
    streamingHasError,
    streamingError,
    connectionState,
    sendMessage,
    clearChat,
    addMessage,
    updateLastMessage,
    setError,
    handleCancelStreaming
  } = useChatState({
    selectedConfigId,
    selectedModelId,
    selectedAssistantId,
    selectedAssistant,
    selectedProjectId: currentConversationId ? conversationProjectId : folderForNewChat, // Use folder context only for new chats
    selectedProject: null, // Remove project display from active chat
    currentConversationId,
    onAutoSave: handlePostStreamingAutosave // Add autosave callback
  });
  
  // Helper to set messages (needed for conversation loading)
  const setMessages = useCallback((newMessages: any[]) => {
    clearChat();
    newMessages.forEach(message => addMessage(message));
  }, [clearChat, addMessage]);
  
  // 🚫 Streaming-aware assistant selection wrappers
  const handleAssistantSelectWithStreamingCheck = useCallback((assistantId: number | null) => {
    // 🚫 Prevent assistant switching while streaming
    if (isStreaming) {
      console.log('🚫 Cannot switch assistants while streaming is active');
      return;
    }
    
    handleAssistantSelect(assistantId);
  }, [handleAssistantSelect, isStreaming]);



  // 🔧 FIXED: Folder navigation handler (organizational only)
  const handleFolderNavigate = useCallback((folderId: number | null, folderData: any) => {
    if (isStreaming) return;
    
    setViewingFolder(folderId, folderData);
    console.log('📁 Folder navigation (organizational only):', {
      folderId,
      folderName: folderData?.name,
      note: 'This does NOT affect any active chat session'
    });
  }, [isStreaming, setViewingFolder]);
  
  // 🆕 NEW: Handle new chat creation in folder
  const handleNewChatInFolder = useCallback((folderId: number | null, folderData: any) => {
    if (isStreaming) return;
    
    // Set folder context for new chat creation
    setFolderForNewChat(folderId, folderData);
    
    console.log('🆕 Setting folder context for new chat:', {
      folderId,
      folderName: folderData?.name,
      defaultAssistant: folderData?.default_assistant_name,
      defaultAssistantId: folderData?.default_assistant_id
    });
    
    // Auto-activate folder's default assistant if available
    if (folderData?.default_assistant_id && folderData.default_assistant_id !== selectedAssistantId) {
      console.log('🤖 Auto-activating folder default assistant:', folderData.default_assistant_name);
      handleAssistantSelect(folderData.default_assistant_id);
    }
  }, [isStreaming, setFolderForNewChat, selectedAssistantId, handleAssistantSelect]);
  
  // ⚡ Update messages as content streams in
  useEffect(() => {
    if (isStreaming && accumulatedContent && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        updateLastMessage(accumulatedContent);
      }
    }
  }, [accumulatedContent, isStreaming, messages.length, updateLastMessage]);

  // 🎯 Handle URL parameter for assistant editing popup
  // DISABLED: Now triggered by edit button instead of URL
  // useEffect(() => {
  //   const assistantParam = searchParams.get('assistant');
  //   if (assistantParam) {
  //     const assistantId = parseInt(assistantParam, 10);
  //     if (!isNaN(assistantId)) {
  //       setEditingAssistantId(assistantId);
  //       setShowAssistantEditPopup(true);
  //       console.log('🎯 Opening assistant edit popup for ID:', assistantId);
  //     }
  //   } else {
  //     setShowAssistantEditPopup(false);
  //     setEditingAssistantId(null);
  //   }
  // }, [searchParams]);

  // 🎯 Handle popup close
  const handleCloseAssistantEditPopup = useCallback(() => {
    setShowAssistantEditPopup(false);
    setEditingAssistantId(null);
    
    // Remove assistant parameter from URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('assistant');
    setSearchParams(newSearchParams, { replace: true });
    
    console.log('🎯 Closed assistant edit popup');
  }, [searchParams, setSearchParams]);

  // 🎯 Handle opening edit popup (called from edit button)
  const handleOpenAssistantEditPopup = useCallback((assistantId: number) => {
    if (isStreaming) {
      console.log('🚫 Cannot edit assistant while streaming is active');
      return;
    }
    
    setEditingAssistantId(assistantId);
    setShowAssistantEditPopup(true);
    console.log('🎯 Opening assistant edit popup for ID:', assistantId);
  }, [isStreaming]);

  // 🎯 Handle popup save
  const handleAssistantEditSaved = useCallback(() => {
    // Refresh assistants list
    loadAvailableAssistants();
    
    // Trigger a refresh trigger to notify the sidebar to refresh
    // This will cause the sidebar to reload its assistant data
    if (editingAssistantId) {
      // Force a refresh by updating the sidebar refresh trigger
      setSidebarRefreshTrigger(prev => prev + 1);
      console.log('🔄 Triggering sidebar refresh for assistant update');
    }
    
    console.log('✅ Assistant saved successfully');
  }, [loadAvailableAssistants, editingAssistantId]);

  // 🌊 Note: Post-streaming autosave is now handled directly in useChatState completion callbacks
  
  // 🔄 Track conversation loading state
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [conversationJustLoaded, setConversationJustLoaded] = useState(false);

  // 💾 DISABLED: useEffect autosave - now handled by post-streaming callback only
  // This prevents double autosave issues where both useEffect and post-streaming callback
  // would trigger saves, creating duplicate conversations
  // 
  // The post-streaming autosave in useChatState.ts is more reliable because:
  // 1. It only triggers after streaming completes (no race conditions)
  // 2. It has access to the final, complete message state
  // 3. It's triggered at the right moment in the message flow
  // 
  // useEffect(() => {
  //   // Autosave logic moved to post-streaming callback
  // }, [messages, ...]);

  // 💾 Conversation loading with streaming check
  const handleLoadSelectedConversation = useCallback(async (conversationId: number) => {
    // 🚫 Prevent conversation loading while streaming
    if (isStreaming) {
      console.log('🚫 Cannot load conversation while streaming is active');
      return;
    }

    try {
      setIsLoadingConversation(true);
      setConversationJustLoaded(true);
      
      console.log('💾 Loading conversation:', conversationId);
      const loadedMessages = await handleLoadConversation(conversationId);

      // 🔧 ENHANCED: Handle assistant selection with project default fallback
      if (conversationAssistantId && conversationAssistantId !== selectedAssistantId) {
        // Conversation has a specific assistant assigned
        console.log('🤖 Auto-selecting conversation assistant:', conversationAssistantId);
        handleAssistantSelect(conversationAssistantId);
      } else if (!conversationAssistantId && conversationProjectId) {
        // Conversation has no assigned assistant but belongs to a project
        // Check if the project has a default assistant
        try {
          const projectDefaultAssistant = await getProjectDefaultAssistantById(conversationProjectId);
          if (projectDefaultAssistant && projectDefaultAssistant.id !== selectedAssistantId) {
            console.log('🤖 Auto-selecting project default assistant:', projectDefaultAssistant.name);
            handleAssistantSelect(projectDefaultAssistant.id);
          } else if (!projectDefaultAssistant && selectedAssistantId) {
            console.log('🤖 Deactivating assistant - conversation has no assigned assistant and project has no default');
            deactivateAssistant();
          }
        } catch (error) {
          console.warn('⚠️ Failed to fetch project default assistant:', error);
          // Fallback: deactivate assistant if we can't determine project default
          if (selectedAssistantId) {
            console.log('🤖 Deactivating assistant due to project assistant fetch error');
            deactivateAssistant();
          }
        }
      } else if (!conversationAssistantId && !conversationProjectId && selectedAssistantId) {
        // 🔧 CRITICAL FIX: Data inconsistency detected - conversation not properly associated with folder
        console.warn('🚨 DATA INCONSISTENCY: Conversation', conversationId, 'appears to be in a folder but has no backend project association');
        console.log('🔧 This suggests a database sync issue between sidebar display and actual project associations');
        
        // Check if we can determine folder context from sidebar state
        const potentialFolderContext = viewingFolderId || folderForNewChat;
        if (potentialFolderContext) {
          console.log('🔧 FALLBACK: Using viewing folder context as project context:', {
            viewingFolderId,
            viewingFolderName: viewingFolder?.name,
            folderForNewChat
          });
          
          // Temporarily set project context for breadcrumbs display
          // This doesn't fix the database but provides UI consistency
          // WARNING: This is a UI-only fix and doesn't resolve the backend data issue
        }
        
        // Conversation has no assigned assistant and no project
        console.log('🤖 Deactivating assistant for conversation without assigned assistant or project');
        deactivateAssistant();
      }
      
      console.log('✅ Conversation loaded successfully with', loadedMessages.length, 'messages');
      
    } catch (error) {
      console.error('❌ Failed to load conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversation');
    } finally {
      setIsLoadingConversation(false);
    }
  }, [isStreaming, handleLoadConversation, setError, conversationAssistantId, conversationProjectId, selectedAssistantId, handleAssistantSelect, deactivateAssistant, getProjectDefaultAssistantById, viewingFolderId, viewingFolder?.name, folderForNewChat]);

  // 💾 Save current conversation
  const handleSaveCurrentConversation = useCallback(async () => {
    if (messages.length === 0) {
      setError('No messages to save');
      return;
    }

    try {
      await handleSaveConversation(messages, {
        selectedConfigId: selectedConfigId || undefined,
        selectedModelId: selectedModelId || undefined,
        // 🔧 FIXED: Use folder context only for NEW chats, never change existing chat folder
        projectId: currentConversationId ? (conversationProjectId || undefined) : folderForNewChat || undefined
      });
      
      // Clear folder context after successful manual save of new chat
      if (!currentConversationId && hasNewChatFolderContext()) {
        console.log('🧹 Clearing folder context after new chat manual save');
        clearNewChatFolderContext();
      }
      
      console.log('✅ Conversation saved manually');
    } catch (error) {
      console.error('❌ Failed to save conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to save conversation');
    }
  }, [messages, handleSaveConversation, selectedConfigId, selectedModelId, folderForNewChat, currentConversationId, conversationProjectId, setError, hasNewChatFolderContext, clearNewChatFolderContext]);

  // ✉️ Enhanced message sending
  const handleSendMessage = useCallback(async (
    content: string, 
    files?: FileAttachment[]
  ) => {
    try {
      await sendMessage(content, files);
      console.log('✉️ Message sent successfully');
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Error handling is done in useChatState
    }
  }, [sendMessage]);

  // 🤖 Assistant manager change handler
  const handleAssistantManagerChange = useCallback(async () => {
    await loadAvailableAssistants();
  }, [loadAvailableAssistants]);

  // 🤖 Assistant updated handler  
  const handleAssistantUpdated = useCallback(async (assistantId: number) => {
    try {
      // Load the updated assistant data
      const updatedAssistant = await assistantService.getAssistant(assistantId);
      
      // Create assistant summary for introduction
      const assistantSummary = {
        id: updatedAssistant.id,
        name: updatedAssistant.name,
        description: updatedAssistant.description,
        system_prompt_preview: updatedAssistant.system_prompt_preview,
        is_active: updatedAssistant.is_active,
        conversation_count: updatedAssistant.conversation_count,
        created_at: updatedAssistant.created_at,
        is_new: updatedAssistant.is_new,
        color: updatedAssistant.color,
        file_count: updatedAssistant.file_count,
        has_files: updatedAssistant.has_files
      };
      
      // Generate a new introduction message for the updated assistant
      const introMessage = handleAssistantIntroduction(assistantSummary, selectedAssistant);
      addMessage(introMessage);
      
      console.log('✅ Added re-introduction message for updated assistant');
      
      // Refresh the available assistants to get the updated data
      // 🔧 Do this AFTER generating the intro message to avoid duplicate messages
      // Pass true to indicate this is an update, preventing automatic intro messages
      await loadAvailableAssistants(true);
      
    } catch (error) {
      console.error('❌ Failed to generate introduction for updated assistant:', error);
    }
  }, [loadAvailableAssistants, handleAssistantIntroduction, selectedAssistant, addMessage]);
  
  // 🆕 Handle new conversation with streaming check
  const handleNewConversationClick = useCallback(() => {
    // 🚫 Prevent new conversation while streaming
    if (isStreaming) {
      console.log('🚫 Cannot create new conversation while streaming is active');
      return;
    }
    
    handleNewConversation();
    // Reset conversation state
    setConversationJustLoaded(false);

    // Clear any active assistant when starting a new conversation (unless we have folder context)
    if (selectedAssistantId && !hasNewChatFolderContext()) {
      console.log('🤖 Deactivating assistant for new conversation');
      deactivateAssistant();
    }
  }, [handleNewConversation, isStreaming, selectedAssistantId, deactivateAssistant, hasNewChatFolderContext]);
  
  // 🔧 FIX: Reset the "just loaded" flag after a short delay to allow normal auto-save
  useEffect(() => {
    if (conversationJustLoaded) {
      const timeout = setTimeout(() => {
        console.log('🔄 Resetting conversation just loaded flag - auto-save can resume');
        setConversationJustLoaded(false);
      }, 1000); // Wait 1 second after loading before allowing auto-save

      return () => clearTimeout(timeout);
    }
  }, [conversationJustLoaded]);

  // ⌨️ Unified sidebar keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as Element).closest('[contenteditable="true"]')
      ) {
        return;
      }

      // Prevent shortcuts during streaming
      if (isStreaming) {
        return;
      }

      // Ctrl/Cmd + B for conversations
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        setSidebarMode('conversations');
        toggleSidebar();
        console.log('⌨️ Toggled conversations via keyboard shortcut');
      }
      
      // Ctrl/Cmd + P for projects
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setSidebarMode('projects');
        toggleSidebar();
        console.log('⌨️ Toggled projects via keyboard shortcut');
      }
      
      // Ctrl/Cmd + A for assistants
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setSidebarMode('assistants');
        toggleSidebar();
        console.log('⌨️ Toggled assistants via keyboard shortcut');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStreaming, setSidebarMode, toggleSidebar]);
  
  // 🔍 DEBUG: Track folder name values for debugging
  useEffect(() => {
    const folderNameValue = currentConversationId ? conversationProjectName : folderForNewChatData?.name;
    console.log('🍞 ChatContainer folder debug:', {
      currentConversationId,
      conversationProjectName,
      folderForNewChatData_name: folderForNewChatData?.name,
      finalFolderName: folderNameValue
    });
  }, [currentConversationId, conversationProjectName, folderForNewChatData?.name]);
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-blue-950 overflow-hidden">
      {/* 📁 Unified Sidebar */}
      <UnifiedSidebar
        mode={sidebarMode}
        onModeChange={(mode) => {
          if (isStreaming) return;
          setSidebarMode(mode);
        }}
        isOpen={showUnifiedSidebar}
        onClose={() => setShowUnifiedSidebar(false)}
        onSelectConversation={handleLoadSelectedConversation}
        onCreateNewConversation={handleNewConversationClick}
        currentConversationId={currentConversationId || undefined}
        refreshTrigger={conversationRefreshTrigger + sidebarRefreshTrigger}
        onSidebarReady={(updateFn, addFn) => {
          setSidebarFunctions(updateFn, addFn);
        }}
        isStreaming={isStreaming}
        onFolderNavigate={handleFolderNavigate}
        onNewChatInFolder={handleNewChatInFolder}
        onProjectChange={async () => {}} // No-op since we removed project context from active chat
        onProjectUpdated={() => {}} // No-op since we removed project context from active chat
        viewingFolderId={viewingFolderId}
        viewingFolderName={viewingFolder?.name || ''}
        onSelectAssistant={handleAssistantSelectWithStreamingCheck}
        onCreateNewAssistant={() => {
          // Switch to assistants mode and trigger creation (not needed since there's a create button in the sidebar)
          setSidebarMode('assistants');
          setShowUnifiedSidebar(true);
        }}
        currentAssistantId={selectedAssistantId || undefined}
        onAssistantChange={handleAssistantManagerChange}
        onAssistantUpdated={handleAssistantUpdated}
        onEditAssistant={handleOpenAssistantEditPopup}
      />


      {/* Main chat interface */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
        showUnifiedSidebar ? 'ml-80' : 'ml-0'
      }`}>
        {/* 🎛️ Header with integrated sidebar toggle */}
        <ChatHeader
          unifiedModelsData={unifiedModelsData}
          selectedModelId={selectedModelId}
          currentModelInfo={currentModelInfo}
          showAllModels={showAllModels}
          modelsLoading={modelsLoading}
          modelsError={modelsError}
          connectionStatus={connectionStatus}
          groupedModels={groupedModels}
          onModelChange={handleModelChange}
          selectedAssistant={selectedAssistant}
          selectedProject={null} // 🔧 FIXED: Remove project display from active chat
          messages={messages}
          currentConversationId={currentConversationId}
          conversationTitle={conversationTitle}
          folderName={(
            // 🔧 ENHANCED: Smart folder name resolution with fallback for data inconsistencies
            currentConversationId 
              ? (conversationProjectName || (
                  // FALLBACK: If conversation has no backend project but we're viewing a folder, use viewing folder name
                  // This handles database inconsistencies where conversations appear in folders but aren't properly associated
                  viewingFolderId && viewingFolder?.name 
                    ? (
                        console.log('🔧 FALLBACK: Using viewing folder name for breadcrumbs:', viewingFolder.name),
                        viewingFolder.name
                      )
                    : null
                ))
              : folderForNewChatData?.name
          )}
          isSavingConversation={isSavingConversation}
          onSaveConversation={handleSaveCurrentConversation}
          onNewConversation={handleNewConversationClick}
          showUnifiedSidebar={showUnifiedSidebar}
          onToggleSidebar={() => setShowUnifiedSidebar(!showUnifiedSidebar)}
          isStreaming={isStreaming}
          streamingHasError={streamingHasError}
          streamingError={streamingError}
          connectionState={connectionState}
          isMobile={isMobile}
        />
        
        {/* 🚨 Error Display */}
        <ErrorDisplay
          error={error}
          onDismissError={() => setError(null)}
          streamingHasError={streamingHasError}
          streamingError={streamingError}
          onDismissStreamingError={() => {
            console.log('🧹 User dismissed streaming error');
          }}
          onContactAdmin={() => {
            window.open('mailto:admin@company.com?subject=AI%20Usage%20Quota%20Exceeded', '_blank');
          }}
        />
        
        {/* 📋 Loading state for models */}
        {modelsLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-white" />
            <span className="text-white">Loading AI models...</span>
          </div>
        )}
        
        {/* 💬 Chat content */}
        {!modelsLoading && unifiedModelsData && unifiedModelsData.models.length > 0 && (
          <>
            {/* 🤖 Assistant suggestions */}
            {!selectedAssistantId && messages.length === 0 && availableAssistants.length > 0 && (
              <AssistantSuggestions
                suggestions={availableAssistants}
                onSelect={handleAssistantSelectWithStreamingCheck}
                onDismiss={() => console.log('✨ Assistant suggestions dismissed by user')}
                maxSuggestions={4}
                showOnlyOnce={true}
              />
            )}
            
            {/* 📜 Message list */}
            <MessageList 
              messages={messages}
              isLoading={isLoading}
              isStreaming={isStreaming}
              className="flex-1"
            />
            
            {/* ✍️ Message input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isStreaming={isStreaming}
              onCancel={handleCancelStreaming}
              disabled={!selectedConfigId || connectionStatus === 'error' || modelsLoading}
              placeholder={
                !selectedConfigId 
                  ? "Select an AI model to start chatting..."
                  : modelsLoading
                  ? "Loading AI models..."
                  : modelsError
                  ? "Model loading failed - using default model"
                  : selectedAssistant && currentModelInfo
                  ? `Chatting with ${selectedAssistant.name} via ${currentModelInfo.display_name}...`
                  : currentModelInfo
                  ? `Chatting with ${currentModelInfo.display_name}`
                  : "Type your message here..."
              }
            />
          </>
        )}
        
        {/* 🚫 No models available */}
        {!modelsLoading && (!unifiedModelsData || unifiedModelsData.models.length === 0) && (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center max-w-md bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <Settings className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No AI Models Available
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                No AI models are currently available for your account. 
                Please contact your administrator to set up AI providers.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px- py-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-md transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 🎯 Assistant Edit Popup */}
      <AssistantEditPopup
        isOpen={showAssistantEditPopup}
        assistantId={editingAssistantId}
        onClose={handleCloseAssistantEditPopup}
        onSaved={handleAssistantEditSaved}
      />
    </div>
  );
};