# Src Directory AI Guide - `/Front/src/`

> **React Application**: Main source code with TypeScript, component architecture, and state management

## 🎯 Application Structure

**Entry**: `main.tsx` → `App.tsx` with React Router setup  
**Architecture**: Component-based with custom hooks and context providers  
**State**: Context API for global state, custom hooks for features  
**Styling**: Tailwind CSS with glassmorphism theme and shadcn/ui components

## 📁 Core Organization

```
main.tsx             → React app entry point, provider setup
App.tsx              → Router configuration, layout, protected routes
index.css            → Global styles, Tailwind imports

pages/               → Route components (full page views)
components/          → Reusable UI components organized by feature
hooks/               → Custom React hooks for state and logic
services/            → API integration and business logic
types/               → TypeScript interfaces and type definitions
contexts/            → React Context providers for global state
utils/               → Helper functions and utilities
styles/              → Additional CSS files (animations, etc.)
```

## 🔧 Entry Point Flow

### Application Bootstrap (`main.tsx`)
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

### Router Setup (`App.tsx`)
```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ChatInterface from './pages/ChatInterface'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}
```

## 🔍 Core Patterns

### Component Structure
```typescript
// Standard component pattern
interface ComponentProps {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  onAction, 
  children 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
};
```

### Custom Hook Usage
```typescript
// Feature-specific hook
export const useFeature = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await featureService.getData();
      setData(result);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { data, isLoading, fetchData };
};
```

### Service Integration
```typescript
// API service usage
import { chatService } from '../services/chatService';

const handleSendMessage = async (message: string) => {
  try {
    const response = await chatService.sendMessage({
      message,
      model_name: selectedModel,
      file_attachment_ids: attachments.map(f => f.id)
    });
    setMessages(prev => [...prev, response]);
  } catch (error) {
    toast.error('Failed to send message');
  }
};
```

## 🎨 Styling Patterns

### Glassmorphism Theme
```typescript
// Standard glass card
<Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">

// Primary action button
<Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">

// Input field
<Input className="bg-white/5 border-white/20 text-white placeholder-white/50">
```

### Responsive Design
```typescript
// Mobile-first responsive classes
<div className="flex flex-col md:flex-row">
<div className="w-full md:w-1/3">
<div className="p-4 md:p-6 lg:p-8">

// Conditional mobile behavior
const isMobile = window.innerWidth < 768;
<Dialog className={`${isMobile ? 'h-full' : 'max-w-md'}`}>
```

## 🔧 Common Operations

### Adding New Page
1. Create component in `pages/`
2. Add route in `App.tsx`
3. Include authentication if needed with `<ProtectedRoute>`
4. Add navigation links in layout components

### Adding New Component
1. Create in appropriate `components/` subdirectory
2. Export from `index.ts` if needed
3. Include TypeScript interface for props
4. Follow glassmorphism styling patterns

### State Management
1. Use `useState` for local component state
2. Use custom hooks for feature-specific state
3. Use Context API for global state (auth, theme)
4. Use services for API data fetching

## 🚨 Common Issues

**Import Errors**: Check relative paths and index.ts exports  
**Styling Issues**: Verify Tailwind classes and glassmorphism patterns  
**Type Errors**: Ensure proper TypeScript interfaces and props  
**Routing Issues**: Check protected routes and authentication  
**API Integration**: Verify service calls and error handling

## 📋 Development Checklist

- [ ] Component has proper TypeScript interface
- [ ] Follows glassmorphism styling patterns
- [ ] Includes loading and error states
- [ ] Uses appropriate custom hooks
- [ ] Handles responsive design
- [ ] Includes proper error boundaries 