// 💬 Core Chat State Management Hook
// Manages messages, loading states, and chat operations
// Extracted from ChatInterface.tsx for better modularity

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatMessage, ChatServiceError, StreamingChatRequest, ChatResponse } from '../../types/chat';
import { AssistantSummary } from '../../types/assistant';
import { ProjectDetails } from '../../types/project';
import { shouldAutoSave } from '../../types/conversation';
import { chatService } from '../../services/chatService';
import { useStreamingChat } from '../../utils/streamingStateManager';
import type { FileAttachment } from '../../types/file';

export interface ChatStateConfig {
  selectedConfigId: number | null;
  selectedModelId: string | null;
  selectedAssistantId: number | null;
  selectedAssistant: AssistantSummary | null;
  selectedProjectId: number | null;
  selectedProject: ProjectDetails | null;
  currentConversationId: number | null;
  // Add autosave callback for post-streaming save
  onAutoSave?: (messages: ChatMessage[]) => void;
}

export interface ChatStateActions {
  sendMessage: (content: string, attachments?: FileAttachment[]) => Promise<void>;
  clearChat: () => void;
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setError: (error: string | null) => void;
  handleCancelStreaming: () => void;
}

export interface ChatStateReturn extends ChatStateActions {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Streaming state
  isStreaming: boolean;
  accumulatedContent: string;
  streamingHasError: boolean;
  streamingError: any;
  connectionState: string;
}

export const useChatState = (config: ChatStateConfig): ChatStateReturn => {
  // 💬 Core chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 🌊 Streaming functionality
  const {
    accumulatedContent,
    isStreaming,
    streamMessage,
    hasError: streamingHasError,
    error: streamingError,
    connectionState,
    stopStreaming
  } = useStreamingChat();
  
  // 🔧 ENHANCED: Clean up streaming placeholder when streaming errors occur
  useEffect(() => {
    if (streamingHasError && streamingError) {
      console.log('🧹 Streaming error detected, cleaning up states:', streamingError.type);
      
      // Remove empty streaming placeholder and stop loading
      setMessages(prev => {
        if (prev.length > 0) {
          const lastMessage = prev[prev.length - 1];
          // If the last message is an empty assistant message (streaming placeholder), remove it
          if (lastMessage && lastMessage.role === 'assistant' && 
              (!lastMessage.content || lastMessage.content.trim() === '')) {
            console.log('🧹 Removing empty streaming placeholder');
            return prev.slice(0, -1);
          }
        }
        return prev;
      });
      
      setIsLoading(false); // Stop loading state since streaming failed
    }
  }, [streamingHasError, streamingError]);
  
  // 📤 Send message handler
  const sendMessage = useCallback(async (content: string, attachments?: FileAttachment[]) => {
    const { selectedConfigId, selectedModelId, selectedAssistantId, selectedAssistant, currentConversationId } = config;
    
    if (!selectedConfigId) {
      setError('Please select an LLM provider first.');
      return;
    }
    
    try {
      setError(null);
      setIsLoading(true);
      
      // 🔍 Extract file attachment IDs
      const fileAttachmentIds = attachments?.map(attachment => {
        const backendFileId = attachment.fileUpload.uploadedFileId;
        const parsedId = backendFileId ? parseInt(backendFileId, 10) : undefined;
        return parsedId;
      }).filter(id => id !== undefined && !isNaN(id)) as number[] | undefined;
      
      // 👤 Add user message immediately (with attachments if present)
      const userMessage: ChatMessage = {
        role: 'user',
        content: content,
        ...(attachments && attachments.length > 0 && {
          attachments: attachments,
          hasFiles: true,
          fileCount: attachments.length
        })
      };
      
      // 🤖 Prepare messages with system prompts
      let messagesWithSystemPrompt: ChatMessage[] = [];
      
      // Add project system prompt if available
      if (config.selectedProject?.system_prompt) {
        const projectSystemMessage: ChatMessage = {
          role: 'system',
          content: config.selectedProject.system_prompt,
          projectId: config.selectedProjectId || undefined,
          projectName: config.selectedProject.name
        };
        messagesWithSystemPrompt.push(projectSystemMessage);
      }
      
      // Add assistant system prompt if available
      if (selectedAssistant) {
        const assistantSystemMessage: ChatMessage = {
          role: 'system',
          content: selectedAssistant.system_prompt_preview,
          assistantId: selectedAssistantId || undefined,
          assistantName: selectedAssistant.name
        };
        messagesWithSystemPrompt.push(assistantSystemMessage);
      }
      
      // Add conversation history and the new user message
      messagesWithSystemPrompt = [...messagesWithSystemPrompt, ...messages, userMessage];
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // 🌊 Try streaming first
      console.log('🌊 Attempting streaming response...');
      
      // Add streaming placeholder
      const streamingPlaceholder: ChatMessage = {
        role: 'assistant',
        content: ''
      };
      setMessages([...updatedMessages, streamingPlaceholder]);
      
      const streamingRequest: StreamingChatRequest = {
        config_id: selectedConfigId,
        messages: messagesWithSystemPrompt,
        model: selectedModelId || undefined,
        file_attachment_ids: fileAttachmentIds,
        assistant_id: selectedAssistantId || undefined,
        project_id: config.selectedProjectId || undefined,
        conversation_id: currentConversationId || undefined
      };
      
      const streamingSuccess = await streamMessage(
        streamingRequest,
        (finalResponse: ChatResponse) => {
          console.log('✅ Streaming completed');
          
          const finalMessage: ChatMessage = {
            role: 'assistant',
            content: finalResponse.content,
            assistantId: selectedAssistantId || undefined,
            assistantName: selectedAssistant?.name || undefined
          };
          
          setMessages(prev => {
            const updatedMessages = [
              ...prev.slice(0, -1),
              finalMessage
            ];
            
            // 💾 CRITICAL FIX: Trigger autosave after streaming completes
            // Use setTimeout to ensure React state has updated before autosave
            setTimeout(() => {
              if (config.onAutoSave && shouldAutoSave(updatedMessages)) {
                console.log('💾 Post-streaming autosave triggered');
                config.onAutoSave(updatedMessages);
              }
            }, 100);
            
            return updatedMessages;
          });
          
          setIsLoading(false);
        }
      );
      
      if (streamingSuccess) {
        console.log('🌊 Streaming initiated successfully');
        return;
      } else {
        console.log('⚠️ Streaming failed, falling back to regular chat');
        setMessages(updatedMessages);
        await sendRegularMessage(updatedMessages, messagesWithSystemPrompt, fileAttachmentIds);
      }
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      handleChatError(error);
      setIsLoading(false);
    }
  }, [config, messages, streamMessage]);
  
  // 🔄 Regular message fallback
  const sendRegularMessage = async (
    updatedMessages: ChatMessage[], 
    messagesWithSystemPrompt: ChatMessage[],
    fileAttachmentIds?: number[]
  ) => {
    const { selectedConfigId, selectedModelId, selectedAssistantId, selectedAssistant, currentConversationId } = config;
    
    try {
      const response = await chatService.sendMessage({
        config_id: selectedConfigId!,
        messages: messagesWithSystemPrompt,
        model: selectedModelId || undefined,
        file_attachment_ids: fileAttachmentIds,
        assistant_id: selectedAssistantId || undefined,
        project_id: config.selectedProjectId || undefined,
        conversation_id: currentConversationId || undefined
      });
      
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
        assistantId: selectedAssistantId || undefined,
        assistantName: selectedAssistant?.name || undefined,
        projectId: config.selectedProjectId || undefined,
        projectName: config.selectedProject?.name || undefined
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // 💾 Trigger autosave for regular (non-streaming) responses
      setTimeout(() => {
        if (config.onAutoSave && shouldAutoSave(finalMessages)) {
          console.log('💾 Post-regular-chat autosave triggered');
          config.onAutoSave(finalMessages);
        }
      }, 100);
      
      console.log('✅ Received AI response via regular chat');
      
    } finally {
      setIsLoading(false);
    }
  };
  
  // 🚨 Error handling helper
  const handleChatError = (error: unknown) => {
    let errorMessage = 'Failed to send message. Please try again.';
    
    if (error instanceof ChatServiceError) {
      switch (error.errorType) {
        case 'QUOTA_EXCEEDED':
          errorMessage = 'Usage quota exceeded. Please contact your administrator.';
          break;
        case 'PROVIDER_ERROR':
          errorMessage = 'AI provider is currently unavailable. Please try a different provider.';
          break;
        case 'UNAUTHORIZED':
          errorMessage = 'Your session has expired. Please log in again.';
          break;
        default:
          errorMessage = error.message;
      }
    }
    
    setError(errorMessage);
  };
  
  // 🆕 Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);
  
  // 📝 Add message
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);
  
  // ✏️ Update last message
  const updateLastMessage = useCallback((content: string) => {
    setMessages(prev => [
      ...prev.slice(0, -1),
      { ...prev[prev.length - 1], content }
    ]);
  }, []);
  
  // 🛑 Enhanced cancel handler
  const handleCancelStreaming = useCallback(() => {
    console.log('🛑 User canceled streaming response - resetting all states');
    stopStreaming();
    setIsLoading(false);
    setError(null);
  }, [stopStreaming]);
  
  return {
    // State
    messages,
    isLoading,
    error,
    
    // Streaming state
    isStreaming,
    accumulatedContent,
    streamingHasError,
    streamingError,
    connectionState,
    
    // Actions
    sendMessage,
    clearChat,
    addMessage,
    updateLastMessage,
    setError,
    handleCancelStreaming
  };
};