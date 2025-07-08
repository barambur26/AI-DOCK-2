# AI Dock Project Integration Guide

> **For Developers & AI Assistants**: Comprehensive guide to understand the AI Dock architecture, design patterns, and integration requirements

## 🎯 Project Overview

**AI Dock** is a production-ready enterprise LLM gateway that provides secure access to multiple AI providers through a unified interface. The system features comprehensive user management, department-based quota enforcement, real-time streaming chat, file upload capabilities, and extensive analytics.

**Current State**: Fully functional application with 5 completed phases and advanced features including file processing, conversation management, and responsive design.

---

## 🏗️ Core Architecture

### Technology Stack

**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui  
**Backend**: FastAPI + Python + SQLAlchemy + PostgreSQL  
**Authentication**: JWT with refresh tokens  
**Security**: CSP headers, XSS protection, rate limiting  
**File Processing**: PDF (PyPDF2), Word (python-docx), multi-format support  
**Real-time**: Server-Sent Events (SSE) for streaming responses

### Design Philosophy

1. **Learning-First Development**: Code is heavily documented for educational purposes
2. **Security-First**: Enterprise-grade security for sensitive data handling
3. **Component Composition**: Modular React components with single responsibilities
4. **Service Layer Pattern**: Clear separation between API, business logic, and data layers
5. **Responsive Design**: Mobile-first approach with glassmorphism UI theme

---

## 🔧 Backend Architecture

### Core Patterns

#### 1. Service Layer Architecture
```python
# Standard pattern: api → service → model
# /Back/app/api/chat.py
@router.post("/stream")
async def stream_chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    return await llm_service.stream_response(request, current_user)

# /Back/app/services/llm_service.py
async def stream_response(request: ChatRequest, user: User):
    # Business logic here
    return StreamingResponse(generate_stream(), media_type="text/plain")
```

#### 2. Database Models with Relationships
```python
# All models extend SQLAlchemy Base with standard patterns
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    
    # Relationships
    department = relationship("Department", back_populates="users")
    usage_logs = relationship("UsageLog", back_populates="user")
```

#### 3. Pydantic Schemas for Validation
```python
# Request/Response schemas with comprehensive validation
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    model_name: str
    file_attachment_ids: Optional[List[int]] = []
    stream: bool = True
```

#### 4. Authentication & Authorization
```python
# JWT-based auth with role checking
def require_role(required_role: str):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.name != required_role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker
```

### API Patterns

#### Endpoint Structure
- **Health**: `/health` - System status
- **Auth**: `/auth/login`, `/auth/logout`, `/auth/refresh`  
- **Chat**: `/chat/stream`, `/chat/send`
- **Admin**: `/admin/users`, `/admin/departments`, `/admin/quotas`
- **Files**: `/files/upload`, `/files/{id}/download`

#### Response Standards
```python
# Consistent error responses
class ErrorResponse(BaseModel):
    error: str
    error_type: str
    details: Optional[dict] = None

# Success responses with data
class DataResponse(BaseModel):
    data: Any
    message: Optional[str] = None
```

---

## ⚛️ Frontend Architecture

### Component Patterns

#### 1. Container-Component Pattern
```typescript
// ChatInterface.tsx - Container component
const ChatInterface: React.FC = () => {
  // State management and business logic
  return (
    <div className="flex h-screen">
      <ConversationSidebar {...sidebarProps} />
      <div className="flex-1">
        <MessageList messages={messages} />
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
};

// MessageInput.tsx - Presentation component
interface MessageInputProps {
  onSend: (message: string, files?: FileAttachment[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
}
```

#### 2. Custom Hooks for Logic
```typescript
// hooks/useAuth.ts - Authentication state
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// hooks/useAutoScroll.ts - Chat auto-scroll behavior
export const useAutoScroll = (dependency: any[]) => {
  // Smart scrolling logic with user intent detection
};
```

#### 3. Service Layer Integration
```typescript
// services/chatService.ts - API integration
class ChatService {
  async streamChat(request: ChatRequest): Promise<EventSource> {
    const params = new URLSearchParams({
      message: request.message,
      model_name: request.model_name,
      file_attachment_ids: JSON.stringify(request.file_attachment_ids || [])
    });
    
    return new EventSource(`${API_BASE}/chat/stream?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
  }
}
```

### UI/UX Patterns

#### 1. Glassmorphism Theme
```css
/* Standard glassmorphism card */
.glass-card {
  @apply bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl;
}

/* Blue gradient theme for primary actions */
.btn-primary {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700;
}
```

#### 2. Responsive Design Standards
```typescript
// Mobile-first breakpoints
const isMobile = window.innerWidth < 768;

// Component positioning
className={`fixed inset-0 z-50 transition-transform duration-300 ${
  isMobile 
    ? 'translate-y-full data-[state=open]:translate-y-0' 
    : 'translate-x-full data-[state=open]:translate-x-0'
}`}
```

#### 3. Loading and Error States
```typescript
// Standard loading pattern
{isLoading ? (
  <div className="flex items-center space-x-2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
    <span>Processing...</span>
  </div>
) : (
  <Button>Send</Button>
)}
```

---

## 🔐 Security Patterns

### Authentication Flow
1. **Login**: Email/password → JWT access token + refresh token
2. **Request**: Include `Authorization: Bearer <token>` header
3. **Refresh**: Auto-refresh tokens 5 minutes before expiry
4. **Logout**: Clear tokens and invalidate on server

### Role-Based Access Control
```python
# Three main roles with hierarchy
ROLE_HIERARCHY = {
    "admin": ["admin", "manager", "user"],
    "manager": ["manager", "user"], 
    "user": ["user"]
}

# Department-based isolation
async def get_user_data(user: User, target_user_id: int):
    if user.role.name != "admin" and user.department_id != target_department_id:
        raise HTTPException(403, "Access denied")
```

### Security Headers (CSP)
```python
# Conditional CSP for Swagger UI compatibility
if request.url.path in ["/docs", "/redoc"]:
    # Permissive CSP for documentation
else:
    # Strict CSP for application
```

---

## 💬 Chat System Architecture

### Conversation Persistence (FIXED)

**Issue Fixed**: Old conversations now properly save new messages to the database.

**Previous Problem**: When loading an existing conversation and adding new messages, those messages were only stored in local React state but never persisted to the database. On page refresh, new messages would disappear.

**Solution Implemented**:
```typescript
// New conversationUpdateService.ts - Smart persistence handling
export class ConversationUpdateService {
  async smartSaveConversation(
    messages: ChatMessage[],
    existingConversationId: number | null,
    storedMessageCount: number
  ) {
    if (existingConversationId && messages.length > storedMessageCount) {
      // Update existing conversation with new messages
      await this.updateConversationWithNewMessages(existingConversationId, messages, storedMessageCount);
    } else if (!existingConversationId) {
      // Create new conversation
      return await conversationService.saveCurrentChat(messages);
    }
  }
}

// Updated useConversationManager.ts - Fixed save logic
const result = await conversationUpdateService.smartSaveConversation(
  messages,
  currentConversationId,
  lastAutoSaveMessageCount
);
```

**Key Features**:
- Tracks message count when loading conversations
- Detects new messages added to existing conversations
- Uses `/conversations/{id}/messages` API to add individual messages
- Maintains backward compatibility with existing functionality
- Preserves all auto-save and manual save behavior

### Streaming Implementation
```typescript
// Server-Sent Events for real-time streaming
const eventSource = new EventSource(streamingUrl);
eventSource.onmessage = (event) => {
  const chunk = parseStreamingChunk(event.data);
  if (chunk.type === 'content') {
    setStreamingContent(prev => prev + chunk.content);
  } else if (chunk.type === 'error') {
    handleStreamingError(chunk);
  }
};
```

### Message State Management
```typescript
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: FileAttachment[];
  model_used?: string;
  tokens_used?: number;
}

// State management with optimistic updates
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [streamingContent, setStreamingContent] = useState('');
```

### Auto-Save & History
```typescript
// Auto-save after 3+ messages
useEffect(() => {
  if (messages.length >= 3 && !conversationId && !autoSaveFailedAt) {
    saveConversationAuto();
  }
}, [messages.length]);
```

---

## 📁 File Upload System

### Backend File Processing
```python
# Multi-format file processing
async def process_file(file: UploadFile) -> str:
    if file.content_type == "application/pdf":
        return await process_pdf(file)
    elif file.content_type.startswith("application/vnd.openxmlformats"):
        return await process_word(file)
    elif file.content_type == "text/plain":
        return await process_text(file)
    # ... other formats
```

### Frontend File Handling
```typescript
// Drag-and-drop with preview
const FileUploadArea: React.FC = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const formData = new FormData();
      formData.append('file', file);
      uploadFile(formData);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });
};
```

---

## 📊 Analytics & Quota System

### Usage Tracking
```python
# Comprehensive usage logging
class UsageLog(Base):
    user_id = Column(Integer, ForeignKey("users.id"))
    model_name = Column(String)
    input_tokens = Column(Integer)
    output_tokens = Column(Integer)
    cost_usd = Column(Numeric(10, 4))
    response_time_ms = Column(Integer)
    success = Column(Boolean)
    # 40+ tracking fields
```

### Quota Enforcement
```python
# Pre-request quota checking
async def check_quota(user: User, estimated_cost: float):
    quota = await get_department_quota(user.department_id)
    if quota.current_usage + estimated_cost > quota.limit:
        raise QuotaExceededException()
```

---

## 🎨 UI Component Library

### Standard Components
```typescript
// Glass-themed modal
<Modal className="bg-white/10 backdrop-blur-md border border-white/20">

// Loading states
<Button disabled={isLoading}>
  {isLoading ? <Spinner /> : 'Submit'}
</Button>

// Data tables with search/filter
<DataTable 
  data={users}
  columns={userColumns}
  searchKey="email"
  filterOptions={departmentFilter}
/>
```

### Animation Patterns
```css
/* Thinking animation for AI responses */
@keyframes thinking-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Responsive slide animations */
.slide-mobile { transform: translateY(100%); }
.slide-desktop { transform: translateX(100%); }
```

---

## 🔄 Integration Patterns

### Adding New Features

#### 1. Backend API Endpoint
```python
# 1. Create schema in /schemas/
class NewFeatureRequest(BaseModel):
    name: str = Field(..., min_length=1)

# 2. Add to service layer /services/
async def create_new_feature(request: NewFeatureRequest, user: User):
    # Business logic here
    
# 3. Create API endpoint /api/
@router.post("/new-feature")
async def create_feature_endpoint(
    request: NewFeatureRequest,
    current_user: User = Depends(get_current_user)
):
    return await new_feature_service.create(request, current_user)
```

#### 2. Frontend Integration
```typescript
// 1. Add to service layer
export const newFeatureService = {
  async create(data: NewFeatureRequest): Promise<NewFeature> {
    const response = await apiClient.post('/new-feature', data);
    return response.data;
  }
};

// 2. Create component with standard patterns
const NewFeatureComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (data: NewFeatureRequest) => {
    try {
      setIsLoading(true);
      await newFeatureService.create(data);
      toast.success('Feature created successfully');
    } catch (error) {
      toast.error('Failed to create feature');
    } finally {
      setIsLoading(false);
    }
  };
};
```

### Database Migration Pattern
```python
# Always include migration scripts for model changes
# /Back/migrate_new_feature.py
async def upgrade_database():
    async with get_async_db() as db:
        # Add new columns/tables
        await db.execute("ALTER TABLE...")
        await db.commit()
```

---

## 🚀 Deployment Considerations

### Environment Configuration
```python
# /Back/app/core/config.py
class Settings(BaseSettings):
    database_url: str
    secret_key: str
    openai_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"
```

### Docker Patterns
```dockerfile
# Multi-stage builds for optimization
FROM node:18-alpine AS frontend-build
# Build frontend

FROM python:3.11-slim AS backend
# Setup backend with built frontend assets
```

---

## 📚 Development Guidelines

### Code Standards
1. **TypeScript**: Strict mode enabled, comprehensive type coverage
2. **Python**: Type hints required, async/await for I/O operations
3. **Testing**: Component tests for UI, integration tests for APIs
4. **Documentation**: Inline comments for complex business logic
5. **Error Handling**: Graceful degradation with user-friendly messages

### Performance Patterns
1. **React**: useCallback/useMemo for expensive operations
2. **Database**: Proper indexing, eager loading for relationships
3. **API**: Request deduplication, optimistic updates
4. **Files**: Streaming uploads, chunked processing

### Security Checklist
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (SQLAlchemy ORM)
- [ ] XSS protection (CSP headers)
- [ ] Authentication on all protected routes
- [ ] Rate limiting on public endpoints
- [ ] File upload size/type restrictions

---

## 🎯 Integration Checklist

When adding new features to AI Dock:

### Backend Integration
- [ ] Follow service layer pattern (api → service → model)
- [ ] Add comprehensive Pydantic schemas with validation
- [ ] Include proper error handling with user-friendly messages
- [ ] Add usage logging for analytics (if applicable)
- [ ] Implement proper authentication/authorization
- [ ] Write integration tests

### Frontend Integration
- [ ] Use existing UI patterns (glassmorphism, responsive design)
- [ ] Follow container-component architecture
- [ ] Implement loading states and error handling
- [ ] Add to existing service layer with consistent API
- [ ] Use TypeScript with comprehensive types
- [ ] Ensure mobile responsiveness

### Database Integration
- [ ] Follow existing naming conventions
- [ ] Add proper relationships and constraints
- [ ] Include created_at/updated_at timestamps
- [ ] Write migration script for schema changes

---

---

## 📁 File Location Reference

### Backend Structure (`/Back/app/`)

**Core System Files:**
- `/Back/app/main.py` - FastAPI app entry point, router registration
- `/Back/app/core/database.py` - Database connection and session management
- `/Back/app/core/config.py` - Environment configuration settings
- `/Back/app/core/security.py` - JWT tokens, password hashing, authentication
- `/Back/app/middleware/security.py` - CSP headers, security middleware

**Database Models (`/Back/app/models/`):**
- `user.py` - User accounts, authentication
- `role.py` - User roles (admin, manager, user)
- `department.py` - Organizational departments
- `llm_config.py` - LLM provider configurations
- `usage_log.py` - Request tracking and analytics (40+ fields)
- `quota.py` - Department usage limits
- `conversation.py` - Chat conversation storage
- `file_upload.py` - File attachment system

**API Endpoints (`/Back/app/api/`):**
- `auth.py` - Login, logout, token refresh
- `chat.py` - Chat streaming, file attachment integration
- `files.py` - File upload, download, processing (15 endpoints)
- `admin/users.py` - User CRUD operations
- `admin/departments.py` - Department management
- `admin/quotas.py` - Quota configuration
- `admin/llm_configs.py` - LLM provider setup
- `conversations.py` - Chat history management

**Business Logic (`/Back/app/services/`):**
- `auth_service.py` - Authentication business logic
- `llm_service.py` - LLM provider integration, streaming
- `usage_service.py` - Analytics and logging
- `quota_service.py` - Usage limit enforcement
- `conversation_service.py` - Chat history operations
- `admin_service.py` - Admin panel operations

**Data Schemas (`/Back/app/schemas/`):**
- `auth.py` - Login/logout/token validation
- `chat.py` - Chat requests/responses
- `admin.py` - User/department management
- `conversation.py` - Chat history schemas
- `quota.py` - Usage limit schemas

### Frontend Structure (`/Front/src/`)

**Page Components (`/Front/src/pages/`):**
- `Login.tsx` - Authentication form
- `Dashboard.tsx` - Main user landing page
- `ChatInterface.tsx` - Main chat page (1000+ lines, streaming, file upload)
- `AdminSettings.tsx` - Admin dashboard with tabs

**Chat Components (`/Front/src/components/chat/`):**
- `MessageList.tsx` - Chat message display, auto-scroll
- `MessageInput.tsx` - Input field, file attachments, cancel button
- `ConversationSidebar.tsx` - Chat history navigation
- `FileUploadArea.tsx` - Drag-and-drop file interface
- `QuotaErrorDisplay.tsx` - Quota exceeded error handling

**Admin Components (`/Front/src/components/admin/`):**
- `UserManagement.tsx` - User CRUD interface (700+ lines)
- `DepartmentManagement.tsx` - Department administration
- `LLMConfiguration.tsx` - LLM provider setup (600+ lines)
- `UsageDashboard.tsx` - Analytics and charts
- `QuotaManagement.tsx` - Usage limit configuration

**Services (`/Front/src/services/`):**
- `authService.ts` - Login/logout API integration
- `chatService.ts` - Chat streaming, file attachment
- `adminService.ts` - User/department management APIs
- `conversationService.ts` - Chat history operations
- `usageAnalyticsService.ts` - Dashboard data
- `fileUploadService.ts` - File processing APIs

**Custom Hooks (`/Front/src/hooks/`):**
- `useAuth.ts` - Authentication state management
- `useAutoScroll.ts` - Chat auto-scroll behavior

**Type Definitions (`/Front/src/types/`):**
- `auth.ts` - User, login, token interfaces
- `chat.ts` - Message, streaming interfaces
- `admin.ts` - User/department management types
- `conversation.ts` - Chat history types
- `usage.ts` - Analytics data types

---

## 🚀 Quick Task Reference

### Adding a New API Endpoint
```python
# 1. Create schema: /Back/app/schemas/your_feature.py
class YourFeatureRequest(BaseModel):
    name: str = Field(..., min_length=1)

# 2. Add service: /Back/app/services/your_feature_service.py
async def create_feature(request: YourFeatureRequest, user: User):
    # Business logic
    
# 3. Create endpoint: /Back/app/api/your_feature.py
@router.post("/your-feature")
async def create_endpoint(request: YourFeatureRequest, current_user: User = Depends(get_current_user)):
    return await your_feature_service.create(request, current_user)

# 4. Register router: /Back/app/main.py
app.include_router(your_feature.router, prefix="/api")
```

### Adding a Frontend Component
```typescript
// 1. Create service: /Front/src/services/yourFeatureService.ts
export const yourFeatureService = {
  async create(data: YourFeatureRequest): Promise<YourFeature> {
    const response = await apiClient.post('/your-feature', data);
    return response.data;
  }
};

// 2. Create component: /Front/src/components/your-feature/YourFeatureComponent.tsx
interface YourFeatureProps {
  onSuccess?: () => void;
}

export const YourFeatureComponent: React.FC<YourFeatureProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  // Component logic
};

// 3. Add to parent component or page
```

### Adding Database Model
```python
# 1. Create model: /Back/app/models/your_model.py
class YourModel(Base):
    __tablename__ = "your_models"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 2. Add to imports: /Back/app/models/__init__.py
from .your_model import YourModel

# 3. Create migration script: /Back/migrate_your_model.py
```

---

## 🔧 Key Dependencies & Imports

### Backend Critical Imports
```python
# FastAPI essentials
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer

# Database
from sqlalchemy.orm import Session
from app.core.database import get_async_db
from app.models.user import User
from app.core.security import get_current_user

# Validation
from pydantic import BaseModel, Field
from typing import Optional, List

# LLM Integration
import openai
import anthropic
from app.services.llm_service import LLMService

# File Processing
import PyPDF2
from python_docx import Document
```

### Frontend Critical Imports
```typescript
// React essentials
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// State Management
import { useAuth } from '@/hooks/useAuth';

// API Integration
import { chatService } from '@/services/chatService';
import { adminService } from '@/services/adminService';

// Types
import type { User, ChatMessage } from '@/types';

// File Upload
import { useDropzone } from 'react-dropzone';
```

---

## ⚙️ Configuration Locations

### Environment Variables
- **Backend**: `/Back/.env` (see `/Back/.env.example`)
  - `DATABASE_URL`, `SECRET_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- **Frontend**: `/Front/.env.local`
  - `VITE_API_BASE_URL=http://localhost:8000`

### Key Configuration Files
- **Backend Config**: `/Back/app/core/config.py` - All environment settings
- **Frontend Config**: `/Front/vite.config.ts` - Build and dev server
- **Database**: `/Back/app/core/database.py` - Connection and session setup
- **Security**: `/Back/app/middleware/security.py` - CSP, headers, auth

### Router Registration
- **Backend**: `/Back/app/main.py` - All API routers registered here
- **Frontend**: `/Front/src/App.tsx` - React Router routes defined here

---

## 📋 Component Templates

### Standard React Component
```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface YourComponentProps {
  title: string;
  onAction?: () => void;
}

export const YourComponent: React.FC<YourComponentProps> = ({ title, onAction }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    try {
      setIsLoading(true);
      // Your logic here
      onAction?.();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleAction} 
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-500 to-blue-600"
        >
          {isLoading ? 'Loading...' : 'Action'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

### Standard FastAPI Endpoint
```python
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class YourRequest(BaseModel):
    name: str
    description: Optional[str] = None

class YourResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

@router.post("/your-endpoint", response_model=YourResponse)
async def create_your_resource(
    request: YourRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        # Your business logic here
        result = await your_service.create(request, current_user)
        return YourResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

---

## 🔍 Common Issues & Solutions

### Backend Not Starting
1. **Check**: `/Back/app/main.py` for import errors
2. **Check**: All model imports in `/Back/app/models/__init__.py`
3. **Check**: Database connection in `/Back/app/core/database.py`
4. **Run**: `uvicorn app.main:app --reload` from `/Back/` directory

### Frontend Build Errors
1. **Check**: TypeScript errors in console
2. **Check**: Missing imports in components
3. **Check**: API base URL in environment variables
4. **Run**: `npm run dev` from `/Front/` directory

### Authentication Issues
1. **Check**: JWT token in localStorage
2. **Check**: Backend `/auth` endpoints working
3. **Check**: `useAuth` hook implementation
4. **Test**: Login flow with browser dev tools

### File Upload Issues
1. **Check**: Dependencies installed (`PyPDF2`, `python-docx`)
2. **Check**: File size limits (25MB PDF, 10MB others)
3. **Check**: MIME type validation
4. **Check**: Frontend file attachment integration

---

**🎉 Ready for Integration**: This enhanced guide provides both conceptual patterns AND specific file locations, dependencies, and templates needed for AI assistants to seamlessly work with the AI Dock codebase!
