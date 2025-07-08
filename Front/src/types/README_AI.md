# Types Directory AI Guide - `/Front/src/types/`

> **TypeScript Interfaces**: Type definitions and interfaces for comprehensive type safety

## 🎯 Type System Architecture

**Organization**: Feature-based type organization with shared interfaces  
**Safety**: Comprehensive type coverage for API responses and component props  
**Consistency**: Matching backend schemas with frontend types  
**Reusability**: Shared types across components and services

## 📁 Type Organization

```
index.ts             → Main type exports and re-exports
auth.ts              → Authentication types (User, Login, Token)
chat.ts              → Chat messaging and streaming types
conversation.ts      → Chat history and conversation types
admin.ts             → Admin panel types (users, departments, roles)
assistant.ts         → AI assistant configuration types
quota.ts             → Usage quota and limit types
usage.ts             → Analytics and usage tracking types
manager.ts           → Manager dashboard types
project.ts           → Project organization types

admin/               → Admin-specific type organization
├── index.ts        → Admin type exports

file/                → File-related types
├── index.ts        → File type exports
├── core.ts         → Core file types
├── constants.ts    → File constants and enums
├── upload.ts       → File upload types
├── processing.ts   → File processing types
├── metadata.ts     → File metadata types
└── validation.ts   → File validation types
```

## 🔧 Type Patterns

### Base Interface Structure
```typescript
// Base entity interface
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Request/Response pattern
export interface CreateRequest {
  name: string;
  description?: string;
}

export interface UpdateRequest {
  name?: string;
  description?: string;
}

export interface EntityResponse extends BaseEntity {
  name: string;
  description: string | null;
  is_active: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}
```

### Component Props Interface
```typescript
// Component prop interfaces
export interface ComponentProps {
  title: string;
  data?: EntityResponse[];
  isLoading?: boolean;
  onAction?: (id: number) => void;
  onEdit?: (item: EntityResponse) => void;
  onDelete?: (id: number) => void;
  className?: string;
  children?: React.ReactNode;
}

// Modal prop interfaces
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

## 🔍 Core Type Groups

### Authentication Types (`auth.ts`)
```typescript
export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role: Role;
  department: Department;
}

export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export interface Department {
  id: number;
  name: string;
  budget_limit: number;
  current_usage: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
```

### Chat Types (`chat.ts`)
```typescript
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  model_used?: string;
  tokens_used?: number;
  cost_usd?: number;
  attachments?: FileAttachment[];
}

export interface ChatRequest {
  message: string;
  model_name: string;
  file_attachment_ids?: number[];
  stream?: boolean;
  conversation_id?: number;
}

export interface ChatResponse {
  content: string;
  model_used: string;
  tokens_used: number;
  cost_usd: number;
  conversation_id?: number;
}

export interface StreamingChunk {
  type: 'content' | 'done' | 'error' | 'thinking';
  content: string;
  metadata?: {
    tokens_used?: number;
    model_used?: string;
    cost_usd?: number;
  };
}

export interface FileAttachment {
  id: number;
  filename: string;
  size: number;
  content_type: string;
  processed_content?: string;
}
```

### Conversation Types (`conversation.ts`)
```typescript
export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  assistant_id?: number;
  messages: ChatMessage[];
  message_count: number;
  last_message_at: string;
}

export interface ConversationSummary {
  id: number;
  title: string;
  message_count: number;
  last_message_at: string;
  preview: string;
}

export interface SaveConversationRequest {
  title?: string;
  messages: ChatMessage[];
  assistant_id?: number;
}

export interface SaveConversationResponse {
  id: number;
  title: string;
  message_count: number;
}
```

### Admin Types (`admin.ts`)
```typescript
export interface CreateUserRequest {
  email: string;
  password: string;
  role_id: number;
  department_id: number;
}

export interface UpdateUserRequest {
  email?: string;
  is_active?: boolean;
  role_id?: number;
  department_id?: number;
}

export interface UserWithDetails extends User {
  role: Role;
  department: Department;
  usage_stats: {
    total_requests: number;
    total_cost: number;
    last_activity: string;
  };
}

export interface DepartmentWithStats extends Department {
  user_count: number;
  usage_stats: {
    total_requests: number;
    total_cost: number;
    avg_cost_per_request: number;
  };
}

export interface QuotaConfiguration {
  id: number;
  department_id: number;
  monthly_limit: number;
  current_usage: number;
  reset_date: string;
  is_active: boolean;
}
```

## 🔧 Type Utilities

### Generic Types
```typescript
// API state management
export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// Form state management
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Filter options
export interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}

export interface FilterState {
  search: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  filters: Record<string, any>;
}
```

### Utility Types
```typescript
// Create types for partial updates
export type CreateType<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateType<T> = Partial<CreateType<T>>;

// Extract specific properties
export type WithoutTimestamps<T> = Omit<T, 'created_at' | 'updated_at'>;
export type TimestampFields = Pick<BaseEntity, 'created_at' | 'updated_at'>;

// Status enums
export enum RequestStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum FileStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}
```

## 🔍 Type Organization Patterns

### Feature-Based Export
```typescript
// In index.ts - centralized exports
export * from './auth';
export * from './chat';
export * from './conversation';
export * from './admin';
export * from './assistant';
export * from './quota';
export * from './usage';

// Feature-specific index files
// In admin/index.ts
export * from './users';
export * from './departments';
export * from './roles';
export * from './quotas';
```

### Backend Schema Alignment
```typescript
// Ensure frontend types match backend Pydantic schemas
export interface UserResponse {
  // Must match backend UserResponse schema exactly
  id: number;
  email: string;
  is_active: boolean;
  created_at: string; // ISO string from backend
  updated_at: string; // ISO string from backend
  role: RoleResponse;
  department: DepartmentResponse;
}

// Transform types for frontend use
export interface UserForDisplay extends Omit<UserResponse, 'created_at' | 'updated_at'> {
  created_at: Date; // Transformed to Date object
  updated_at: Date; // Transformed to Date object
  display_name: string; // Computed field
}
```

## 🔧 Type Development

### Adding New Types
1. Create interface matching backend schema exactly
2. Add request/response pairs for API operations
3. Include component prop interfaces if needed
4. Add to appropriate feature export
5. Update main index.ts exports
6. Add utility types if needed

### Type Best Practices
- Use descriptive interface names
- Align with backend schema naming
- Include optional properties appropriately
- Use unions for status/enum fields
- Provide JSDoc comments for complex types
- Use generic types for reusable patterns

## 🚨 Common Issues

**Type Mismatches**: Ensure frontend types match backend schemas exactly  
**Missing Properties**: Check optional vs required fields  
**Date Handling**: Transform ISO strings to Date objects where needed  
**Enum Values**: Ensure enum values match backend constants  
**Generic Constraints**: Use proper generic constraints for type safety

## 📋 Type Development Checklist

- [ ] Interface matches backend schema
- [ ] Proper optional/required property marking
- [ ] Request/response type pairs defined
- [ ] Component prop interfaces included
- [ ] Exported from feature index
- [ ] Added to main index.ts
- [ ] JSDoc comments for complex types
- [ ] Utility types created if needed 