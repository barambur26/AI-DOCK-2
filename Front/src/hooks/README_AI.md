# Hooks Directory AI Guide - `/Front/src/hooks/`

> **Custom Hooks**: Reusable React hooks for state management, side effects, and business logic

## 🎯 Hook Architecture

**Pattern**: Custom hooks for feature-specific state and logic  
**Reusability**: Shared logic across multiple components  
**State Management**: Local state, API integration, and side effects  
**Performance**: Optimized with useCallback and useMemo

## 📁 Hook Organization

```
useAuth.ts               → Authentication state and methods
useAutoScroll.ts         → Auto-scroll behavior for chat

chat/                    → Chat-specific hooks
├── index.ts            → Hook exports
├── useAssistantManager.ts → Assistant selection and management
├── useChatState.ts     → Chat message state management
├── useConversationManager.ts → Conversation persistence and history
├── useFileAttachments.ts → File upload and attachment handling
├── useMessageHandler.ts → Message sending and processing
├── useModelSelection.ts → LLM model selection
└── useStreamingChat.ts  → Streaming response handling

folder/                  → Folder-specific hooks
├── index.ts            → Folder hook exports
└── useFolderContext.ts → Folder state management

quota/                   → Quota-specific hooks
├── index.ts            → Quota hook exports
├── useQuotaModals.ts   → Quota modal state
├── useQuotaReferenceData.ts → Quota reference data
└── useQuotaState.ts    → Quota state management
```

## 🔧 Hook Patterns

### Basic Custom Hook Structure
```typescript
import { useState, useEffect, useCallback } from 'react';
import { featureService } from '../services/featureService';

interface UseFeatureReturn {
  data: FeatureType[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  createItem: (item: CreateFeatureRequest) => Promise<void>;
  updateItem: (id: number, item: UpdateFeatureRequest) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
}

export const useFeature = (): UseFeatureReturn => {
  const [data, setData] = useState<FeatureType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await featureService.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createItem = useCallback(async (item: CreateFeatureRequest) => {
    try {
      const newItem = await featureService.create(item);
      setData(prev => [...prev, newItem]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (id: number, item: UpdateFeatureRequest) => {
    try {
      const updatedItem = await featureService.update(id, item);
      setData(prev => prev.map(i => i.id === id ? updatedItem : i));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  }, []);

  const deleteItem = useCallback(async (id: number) => {
    try {
      await featureService.delete(id);
      setData(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    fetchData,
    createItem,
    updateItem,
    deleteItem
  };
};
```

## 🔍 Key Hooks

### Authentication Hook (`useAuth.ts`)
```typescript
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Usage in components
const { user, login, logout, isLoading, isAuthenticated } = useAuth();
```

### Auto Scroll Hook (`useAutoScroll.ts`)
```typescript
import { useEffect, useRef } from 'react';

export const useAutoScroll = (dependency: any[]) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.scrollTop = elementRef.current.scrollHeight;
    }
  }, dependency);

  return elementRef;
};

// Usage in chat components
const messagesEndRef = useAutoScroll([messages, streamingContent]);
```

### Chat State Hook (`chat/useChatState.ts`)
```typescript
export const useChatState = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateStreamingContent = useCallback((content: string) => {
    setStreamingContent(content);
  }, []);

  const clearStreamingContent = useCallback(() => {
    setStreamingContent('');
    setIsStreaming(false);
  }, []);

  const loadConversation = useCallback((conversation: Conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setStreamingContent('');
    setIsStreaming(false);
  }, []);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
    setStreamingContent('');
    setIsStreaming(false);
  }, []);

  return {
    messages,
    streamingContent,
    isStreaming,
    currentConversationId,
    addMessage,
    updateStreamingContent,
    clearStreamingContent,
    loadConversation,
    startNewConversation,
    setIsStreaming
  };
};
```

### Streaming Chat Hook (`chat/useStreamingChat.ts`)
```typescript
export const useStreamingChat = () => {
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const startStreaming = useCallback((request: ChatRequest, onMessage: (content: string) => void) => {
    const es = chatService.createStreamingConnection(request);
    
    es.onopen = () => {
      setIsStreaming(true);
      setStreamingContent('');
    };

    es.onmessage = (event) => {
      const chunk = chatService.parseStreamingChunk(event.data);
      
      if (chunk.type === 'content') {
        setStreamingContent(prev => prev + chunk.content);
      } else if (chunk.type === 'done') {
        setIsStreaming(false);
        onMessage(streamingContent + chunk.content);
        es.close();
      } else if (chunk.type === 'error') {
        console.error('Streaming error:', chunk.content);
        setIsStreaming(false);
        es.close();
      }
    };

    es.onerror = (error) => {
      console.error('EventSource error:', error);
      setIsStreaming(false);
      es.close();
    };

    setEventSource(es);
  }, [streamingContent]);

  const stopStreaming = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsStreaming(false);
    }
  }, [eventSource]);

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return {
    streamingContent,
    isStreaming,
    startStreaming,
    stopStreaming
  };
};
```

## 🔧 Hook Patterns

### State Management Hook
```typescript
export const useLocalState = <T>(initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setIsLoading(false);
  }, [initialValue]);

  return {
    value,
    isLoading,
    error,
    setValue: updateValue,
    setIsLoading,
    setError,
    reset
  };
};
```

### API Hook with Caching
```typescript
export const useApiData = <T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
};
```

## 🔧 Hook Development

### Creating New Hook
1. Identify reusable logic across components
2. Extract state and side effects into custom hook
3. Use proper TypeScript typing
4. Implement error handling
5. Add performance optimizations (useCallback, useMemo)
6. Export with clear interface

### Hook Best Practices
- Use descriptive names starting with "use"
- Return objects with named properties
- Include loading and error states
- Use useCallback for functions
- Use useMemo for expensive calculations
- Handle cleanup in useEffect
- Provide clear TypeScript interfaces

## 🚨 Common Issues

**Infinite Re-renders**: Check dependency arrays in useEffect and useCallback  
**Stale Closures**: Use functional updates or include dependencies  
**Memory Leaks**: Clean up subscriptions and timers in useEffect  
**Performance**: Use useCallback and useMemo for optimization  
**Type Safety**: Ensure proper TypeScript interfaces and generics

## 📋 Hook Checklist

- [ ] Clear and descriptive name starting with "use"
- [ ] Proper TypeScript interfaces for parameters and return
- [ ] Loading and error state management
- [ ] useCallback for function stability
- [ ] useMemo for expensive computations
- [ ] Proper cleanup in useEffect
- [ ] Error handling and user feedback
- [ ] Performance considerations
``` 