# Services Directory AI Guide - `/Front/src/services/`

> **API Integration**: Service layer for backend communication, data fetching, and business logic

## 🎯 Service Architecture

**Pattern**: Service layer pattern separating API calls from components  
**Integration**: RESTful API communication with FastAPI backend  
**Auth**: JWT token handling with automatic refresh  
**Error Handling**: Consistent error handling and user feedback

## 📁 Service Organization

```
authService.ts           → Authentication (login, logout, token management)
chatService.ts           → Chat messaging and streaming
conversationService.ts   → Chat history management
conversationUpdateService.ts → Smart conversation persistence (FIXED)
adminService.ts          → Admin panel operations
assistantService.ts      → AI assistant management
fileService.ts           → File upload and management
llmConfigService.ts      → LLM provider configuration
quotaService.ts          → Usage quota management
usageAnalyticsService.ts → Analytics and reporting
departmentService.ts     → Department management
managerService.ts        → Manager dashboard
profileService.ts        → User profile management
projectService.ts        → Project organization

chat/                    → Chat-specific services
├── chatService.ts      → Core chat functionality
├── streaming.ts        → Streaming response handling
├── core.ts            → Chat core utilities
└── configuration.ts    → Chat configuration

assistant/               → Assistant-specific services
├── core/              → Core assistant operations
├── features/          → Feature-specific services
└── index.ts           → Service exports

quota/                   → Quota-specific operations
```

## 🔧 Service Patterns

### Base Service Structure
```typescript
import { apiClient } from './core/apiClient';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class FeatureService {
  private baseUrl = '/api/feature';

  async getAll(): Promise<FeatureType[]> {
    try {
      const response = await apiClient.get<ApiResponse<FeatureType[]>>(this.baseUrl);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch features:', error);
      throw new Error('Failed to fetch features');
    }
  }

  async create(data: CreateFeatureRequest): Promise<FeatureType> {
    try {
      const response = await apiClient.post<ApiResponse<FeatureType>>(this.baseUrl, data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create feature:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateFeatureRequest): Promise<FeatureType> {
    try {
      const response = await apiClient.put<ApiResponse<FeatureType>>(`${this.baseUrl}/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update feature:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Failed to delete feature:', error);
      throw error;
    }
  }
}

export const featureService = new FeatureService();
```

### Authentication Service (`authService.ts`)
```typescript
class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password
      });
      
      // Store tokens
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      
      return response.data;
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await apiClient.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken
    });

    const newToken = response.data.access_token;
    localStorage.setItem('access_token', newToken);
    return newToken;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
```

## 🔍 Key Services

### Chat Service (`chatService.ts`)
```typescript
class ChatService {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/chat/send', request);
    return response.data;
  }

  createStreamingConnection(request: ChatRequest): EventSource {
    const params = new URLSearchParams({
      message: request.message,
      model_name: request.model_name,
      file_attachment_ids: JSON.stringify(request.file_attachment_ids || [])
    });

    const token = authService.getToken();
    return new EventSource(`/api/chat/stream?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  parseStreamingChunk(data: string): StreamingChunk {
    try {
      return JSON.parse(data);
    } catch {
      return { type: 'content', content: data };
    }
  }
}

export const chatService = new ChatService();
```

### Conversation Update Service (`conversationUpdateService.ts`) - FIXED
```typescript
// Smart conversation persistence - handles new messages in old conversations
export class ConversationUpdateService {
  async smartSaveConversation(
    messages: ChatMessage[],
    existingConversationId: number | null,
    storedMessageCount: number
  ): Promise<number | null> {
    try {
      if (existingConversationId && messages.length > storedMessageCount) {
        // Update existing conversation with new messages
        await this.updateConversationWithNewMessages(
          existingConversationId, 
          messages, 
          storedMessageCount
        );
        return existingConversationId;
      } else if (!existingConversationId && messages.length >= 3) {
        // Create new conversation
        const result = await conversationService.saveCurrentChat(messages);
        return result.id;
      }
      return existingConversationId;
    } catch (error) {
      console.error('Failed to save conversation:', error);
      throw error;
    }
  }

  private async updateConversationWithNewMessages(
    conversationId: number,
    allMessages: ChatMessage[],
    storedCount: number
  ): Promise<void> {
    const newMessages = allMessages.slice(storedCount);
    
    for (const message of newMessages) {
      await apiClient.post(`/conversations/${conversationId}/messages`, {
        content: message.content,
        role: message.role,
        model_used: message.model_used,
        tokens_used: message.tokens_used
      });
    }
  }
}

export const conversationUpdateService = new ConversationUpdateService();
```

### File Service (`fileService.ts`)
```typescript
class FileService {
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<FileUploadResponse>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }

  async deleteFile(fileId: number): Promise<void> {
    await apiClient.delete(`/files/${fileId}`);
  }

  async getUserFiles(): Promise<FileInfo[]> {
    const response = await apiClient.get<ApiResponse<FileInfo[]>>('/files');
    return response.data.data;
  }

  async downloadFile(fileId: number): Promise<Blob> {
    const response = await apiClient.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const fileService = new FileService();
```

## 🔧 Common Patterns

### Error Handling
```typescript
// Standard error handling pattern
async function serviceMethod() {
  try {
    const result = await apiClient.get('/endpoint');
    return result.data;
  } catch (error: any) {
    // Log error for debugging
    console.error('Service error:', error);
    
    // Transform API error to user-friendly message
    const message = error.response?.data?.detail || 'An unexpected error occurred';
    
    // Throw user-friendly error
    throw new Error(message);
  }
}
```

### Request Interceptors
```typescript
// JWT token injection
apiClient.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await authService.refreshToken();
        // Retry original request
        return apiClient.request(error.config);
      } catch {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Loading States in Services
```typescript
// Service with loading state management
class FeatureService {
  private loadingStates = new Map<string, boolean>();

  async getData(id: string): Promise<any> {
    const loadingKey = `getData-${id}`;
    
    if (this.loadingStates.get(loadingKey)) {
      throw new Error('Request already in progress');
    }

    this.loadingStates.set(loadingKey, true);
    
    try {
      const result = await apiClient.get(`/data/${id}`);
      return result.data;
    } finally {
      this.loadingStates.delete(loadingKey);
    }
  }
}
```

## 🚨 Common Issues

**Authentication Errors**: Check token validity and refresh logic  
**CORS Issues**: Verify API base URL and backend CORS configuration  
**Timeout Errors**: Handle long-running requests with proper timeouts  
**Streaming Disconnection**: Implement reconnection logic for SSE  
**Type Mismatches**: Ensure API response types match TypeScript interfaces

## 🔧 Service Development

### Adding New Service
1. Create service class with proper error handling
2. Define TypeScript interfaces for requests/responses
3. Implement CRUD operations with consistent patterns
4. Add authentication headers where needed
5. Include proper error transformation
6. Export service instance

### Service Best Practices
- Use consistent error handling patterns
- Include proper TypeScript typing
- Handle loading states appropriately
- Implement request deduplication where needed
- Add proper timeout handling
- Include retry logic for failed requests

## 📋 Service Checklist

- [ ] Proper error handling and user-friendly messages
- [ ] TypeScript interfaces for all data types
- [ ] Authentication token handling
- [ ] Loading state management
- [ ] Consistent API patterns (GET, POST, PUT, DELETE)
- [ ] Request/response transformation
- [ ] Timeout and retry logic
- [ ] Proper service exports 