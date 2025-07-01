// 💾 FIXED Conversation Save/Load Management Hook
// Properly handles message persistence for both new and existing conversations
// ENHANCED: Now with atomic operations and race condition prevention

import { useState, useEffect, useCallback } from 'react';
import { conversationService } from '../../services/conversationService';
import { conversationUpdateService } from '../../services/conversationUpdateService';
import { ConversationServiceError, DEFAULT_AUTO_SAVE_CONFIG, shouldAutoSave } from '../../types/conversation';
import { ChatMessage } from '../../types/chat';

export interface ConversationManagerState {
  // Conversation data
  currentConversationId: number | null;
  conversationTitle: string | null;
  
  // Save state
  isSavingConversation: boolean;
  lastAutoSaveMessageCount: number;
  autoSaveFailedAt: number | null;
  
  // Sidebar integration
  conversationRefreshTrigger: number;
  sidebarUpdateFunction: ((id: number, count: number, backendData?: Partial<any>) => void) | null;
  sidebarAddConversationFunction: ((conv: any) => void) | null;
}

export interface ConversationManagerActions {
  // Save operations
  handleAutoSaveConversation: (messages: ChatMessage[], config?: { selectedConfigId?: number; selectedModelId?: string; projectId?: number }) => Promise<void>;
  handleSaveConversation: (messages: ChatMessage[], config?: { selectedConfigId?: number; selectedModelId?: string; projectId?: number }) => Promise<void>;
  handleLoadConversation: (conversationId: number) => Promise<ChatMessage[]>;
  
  // Conversation lifecycle
  handleNewConversation: () => void;
  
  // Sidebar integration
  setSidebarFunctions: (updateFn: (id: number, count: number, backendData?: Partial<any>) => void, addFn: (conv: any) => void) => void;
  handleAddConversationToSidebar: (conversation: any) => void;
  
  // Error handling
  setConversationError: (error: string | null) => void;
}

export type ConversationManagerReturn = ConversationManagerState & ConversationManagerActions;

export const useConversationManager = (
  onError?: (error: string) => void,
  onConversationLoad?: (messages: ChatMessage[]) => void,
  onConversationClear?: () => void
): ConversationManagerReturn => {
  // 💾 Conversation state
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);
  const [isSavingConversation, setIsSavingConversation] = useState(false);
  const [lastAutoSaveMessageCount, setLastAutoSaveMessageCount] = useState(0);
  const [autoSaveFailedAt, setAutoSaveFailedAt] = useState<number | null>(null);
  
  // 💾 Sidebar integration state
  const [conversationRefreshTrigger, setConversationRefreshTrigger] = useState(0);
  const [sidebarUpdateFunction, setSidebarUpdateFunction] = useState<((id: number, count: number, backendData?: Partial<any>) => void) | null>(null);
  const [sidebarAddConversationFunction, setSidebarAddConversationFunction] = useState<((conv: any) => void) | null>(null);
  
  // 💾 Auto-save conversation with enhanced race condition prevention
  const handleAutoSaveConversation = useCallback(async (
    messages: ChatMessage[], 
    config?: { selectedConfigId?: number; selectedModelId?: string; projectId?: number }
  ) => {
    // Early validation
    if (messages.length < DEFAULT_AUTO_SAVE_CONFIG.triggerAfterMessages) {
      return;
    }

    // 🚫 Prevent concurrent auto-saves
    if (isSavingConversation) {
      console.log('🚫 Auto-save already in progress, skipping');
      return;
    }

    // 🚫 Check if conversation is busy with other operations
    if (currentConversationId && conversationUpdateService.isConversationBusy(currentConversationId)) {
      console.log('🚫 Conversation is busy with other operations, skipping auto-save');
      return;
    }

    // 🚫 Prevent duplicate saves at the same message count
    if (autoSaveFailedAt === messages.length) {
      console.log('🚫 Auto-save previously failed at this message count, skipping');
      return;
    }

    // 🚫 Don't save if no new messages since last save
    const actualLastSavedCount = currentConversationId 
      ? conversationUpdateService.getLastSavedCount(currentConversationId)
      : lastAutoSaveMessageCount;
    
    if (messages.length <= actualLastSavedCount) {
      console.log('🔄 No new messages since last save, skipping auto-save');
      return;
    }
    
    try {
      setIsSavingConversation(true);
      console.log('💾 Auto-saving conversation with', messages.length, 'messages (last saved:', actualLastSavedCount, ')');
      
      // Use enhanced smart save with state tracking
      const result = await conversationUpdateService.smartSaveConversation(
        messages,
        currentConversationId,
        actualLastSavedCount,
        config
      );
      
      // Update state based on the save result
      if (result.isNewConversation) {
        // New conversation was created
        setCurrentConversationId(result.conversationId);
        
        // Get conversation details to set title
        try {
          const conversation = await conversationService.getConversation(result.conversationId);
          setConversationTitle(conversation.title);
          
          // Add conversation to sidebar immediately
          if (sidebarAddConversationFunction) {
            const conversationSummary = {
              id: conversation.id,
              title: conversation.title,
              message_count: messages.length,
              created_at: conversation.created_at || new Date().toISOString(),
              updated_at: conversation.updated_at || new Date().toISOString(),
              last_message_at: conversation.last_message_at || new Date().toISOString()
            };
            sidebarAddConversationFunction(conversationSummary);
          } else {
            // Fallback to refresh trigger
            setConversationRefreshTrigger(prev => prev + 1);
          }
        } catch (error) {
          console.error('❌ Failed to get conversation details after save:', error);
        }
      } else if (currentConversationId) {
        // Existing conversation was updated
        // Fetch updated conversation data to get accurate timestamps
        try {
          const conversation = await conversationService.getConversation(currentConversationId);
          
          // Update sidebar with backend data including accurate timestamps
          if (sidebarUpdateFunction) {
            const backendData = {
              last_message_at: conversation.last_message_at,
              updated_at: conversation.updated_at
            };
            console.log('🔄 Updating sidebar with backend timestamp data:', backendData);
            sidebarUpdateFunction(currentConversationId, messages.length, backendData);
          }
        } catch (error) {
          console.error('❌ Failed to get updated conversation data:', error);
          // Enhanced fallback: Try to provide at least some timestamp info even on error
          // Don't call sidebar update without any timestamp data as this can cause "Just now" issues
          console.warn('🔄 Skipping sidebar update due to failed timestamp fetch - preserving existing timestamps');
          // The sidebar will show the correct timestamps from its existing state
        }
      }
      
      setLastAutoSaveMessageCount(messages.length);
      setAutoSaveFailedAt(null); // Clear failure tracking on success
      
      console.log('✅ Conversation auto-saved:', result.conversationId, result.isNewConversation ? '(new)' : '(updated)');
      
    } catch (error) {
      console.error('❌ Failed to auto-save conversation:', error);
      setAutoSaveFailedAt(messages.length); // Track failure at this message count
      console.warn('🚫 Auto-save blocked for message count:', messages.length);
    } finally {
      setIsSavingConversation(false);
    }
  }, [currentConversationId, lastAutoSaveMessageCount, isSavingConversation, autoSaveFailedAt, sidebarAddConversationFunction, sidebarUpdateFunction]);
  
  // 💾 Manually save conversation with enhanced error handling
  const handleSaveConversation = useCallback(async (
    messages: ChatMessage[],
    config?: { selectedConfigId?: number; selectedModelId?: string; projectId?: number }
  ) => {
    if (messages.length === 0) {
      if (onError) onError('No messages to save');
      return;
    }

    // 🚫 Prevent concurrent manual saves
    if (isSavingConversation) {
      console.log('🚫 Save already in progress, skipping manual save');
      return;
    }
    
    try {
      setIsSavingConversation(true);
      console.log('💾 Manually saving conversation');
      
      const actualLastSavedCount = currentConversationId 
        ? conversationUpdateService.getLastSavedCount(currentConversationId)
        : lastAutoSaveMessageCount;
      
      // Use enhanced smart save with state tracking
      const result = await conversationUpdateService.smartSaveConversation(
        messages,
        currentConversationId,
        actualLastSavedCount,
        config
      );
      
      // Update state based on the save result
      if (result.isNewConversation) {
        // New conversation was created
        setCurrentConversationId(result.conversationId);
        
        // Get conversation details to set title
        try {
          const conversation = await conversationService.getConversation(result.conversationId);
          setConversationTitle(conversation.title);
          
          // Add conversation to sidebar immediately
          if (sidebarAddConversationFunction) {
            const conversationSummary = {
              id: conversation.id,
              title: conversation.title,
              message_count: messages.length,
              created_at: conversation.created_at || new Date().toISOString(),
              updated_at: conversation.updated_at || new Date().toISOString(),
              last_message_at: conversation.last_message_at || new Date().toISOString()
            };
            sidebarAddConversationFunction(conversationSummary);
          } else {
            setConversationRefreshTrigger(prev => prev + 1);
          }
        } catch (error) {
          console.error('❌ Failed to get conversation details after save:', error);
        }
      } else if (currentConversationId) {
        // Existing conversation was updated
        // Fetch updated conversation data to get accurate timestamps
        try {
          const conversation = await conversationService.getConversation(currentConversationId);
          
          // Update sidebar with backend data including accurate timestamps
          if (sidebarUpdateFunction) {
            const backendData = {
              last_message_at: conversation.last_message_at,
              updated_at: conversation.updated_at
            };
            console.log('🔄 Updating sidebar with backend timestamp data (manual save):', backendData);
            sidebarUpdateFunction(currentConversationId, messages.length, backendData);
          }
        } catch (error) {
          console.error('❌ Failed to get updated conversation data (manual save):', error);
          // Enhanced fallback: Try to provide at least some timestamp info even on error
          // Don't call sidebar update without any timestamp data as this can cause "Just now" issues
          console.warn('🔄 Skipping sidebar update due to failed timestamp fetch - preserving existing timestamps');
          // The sidebar will show the correct timestamps from its existing state
        }
      }
      
      setLastAutoSaveMessageCount(messages.length);
      setAutoSaveFailedAt(null); // Clear failure tracking
      
      console.log('✅ Conversation saved:', result.conversationId, result.isNewConversation ? '(new)' : '(updated)');
      
    } catch (error) {
      console.error('❌ Failed to save conversation:', error);
      if (onError) {
        onError(
          error instanceof ConversationServiceError 
            ? error.message 
            : 'Failed to save conversation'
        );
      }
    } finally {
      setIsSavingConversation(false);
    }
  }, [currentConversationId, lastAutoSaveMessageCount, isSavingConversation, sidebarAddConversationFunction, sidebarUpdateFunction, onError]);
  
  // 📖 Load conversation with enhanced state initialization
  const handleLoadConversation = useCallback(async (conversationId: number): Promise<ChatMessage[]> => {
    try {
      console.log('📖 Loading conversation:', conversationId);
      
      const chatMessages = await conversationService.loadConversationAsChat(conversationId);
      
      // 🔧 ENHANCED: Initialize state tracking for the loaded conversation
      setCurrentConversationId(conversationId);
      setLastAutoSaveMessageCount(chatMessages.length);
      setAutoSaveFailedAt(null);
      
      // Initialize state in the update service
      conversationUpdateService.initializeConversationState(conversationId, chatMessages.length);
      
      // Get conversation details for title
      try {
        const conversation = await conversationService.getConversation(conversationId);
        setConversationTitle(conversation.title);
      } catch (error) {
        console.error('❌ Failed to get conversation title:', error);
        setConversationTitle(null);
      }
      
      console.log('✅ Conversation loaded:', chatMessages.length, 'messages (state initialized)');
      
      if (onConversationLoad) {
        onConversationLoad(chatMessages);
      }
      
      return chatMessages;
      
    } catch (error) {
      console.error('❌ Failed to load conversation:', error);
      if (onError) {
        onError(
          error instanceof ConversationServiceError 
            ? error.message 
            : 'Failed to load conversation'
        );
      }
      return [];
    }
  }, [onConversationLoad, onError]);
  
  // 🆕 Start new conversation with state cleanup
  const handleNewConversation = useCallback(() => {
    // Clear state in update service for previous conversation
    if (currentConversationId) {
      conversationUpdateService.clearConversationState(currentConversationId);
    }
    
    setCurrentConversationId(null);
    setConversationTitle(null);
    setLastAutoSaveMessageCount(0);
    setAutoSaveFailedAt(null);
    
    if (onConversationClear) {
      onConversationClear();
    }
    
    console.log('🆕 Started new conversation (state cleared)');
  }, [currentConversationId, onConversationClear]);
  
  // 🔄 Set sidebar functions
  const setSidebarFunctions = useCallback((
    updateFn: (id: number, count: number, backendData?: Partial<any>) => void, 
    addFn: (conv: any) => void
  ) => {
    setSidebarUpdateFunction(() => updateFn);
    setSidebarAddConversationFunction(() => addFn);
    console.log('🔄 Connected sidebar functions for reactive updates');
  }, []);
  
  // 🔄 Handle adding conversations to sidebar
  const handleAddConversationToSidebar = useCallback((conversation: any) => {
    if (sidebarAddConversationFunction) {
      sidebarAddConversationFunction(conversation);
      console.log('🔄 Added conversation to sidebar:', conversation.id);
    }
  }, [sidebarAddConversationFunction]);
  
  // 🚨 Set conversation error
  const setConversationError = useCallback((error: string | null) => {
    if (error && onError) {
      onError(error);
    }
  }, [onError]);
  
  return {
    // State
    currentConversationId,
    conversationTitle,
    isSavingConversation,
    lastAutoSaveMessageCount,
    autoSaveFailedAt,
    conversationRefreshTrigger,
    sidebarUpdateFunction,
    sidebarAddConversationFunction,
    
    // Actions
    handleAutoSaveConversation,
    handleSaveConversation,
    handleLoadConversation,
    handleNewConversation,
    setSidebarFunctions,
    handleAddConversationToSidebar,
    setConversationError
  };
};
