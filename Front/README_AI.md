# Frontend AI Guide - `/Front/`

> **Quick Reference**: React 18 + TypeScript + Vite with glassmorphism UI, streaming chat, and responsive design

## 🎯 Frontend Overview

**Entry Point**: `src/main.tsx` → `src/App.tsx` with React Router  
**Architecture**: Container-component pattern with custom hooks  
**UI Theme**: Glassmorphism with Tailwind CSS + shadcn/ui components  
**State**: Context API for auth, custom hooks for features

## 📁 Directory Structure

```
src/
├── main.tsx           → React app entry point
├── App.tsx           → Router setup, layout, auth protection
├── pages/            → Route components (Login, Dashboard, ChatInterface)
├── components/       → Reusable UI components by feature
├── hooks/            → Custom React hooks for state/logic
├── services/         → API integration layer
├── types/            → TypeScript interfaces and types
├── contexts/         → React Context providers
└── utils/            → Helper functions and utilities

public/               → Static assets
package.json         → Dependencies and scripts
vite.config.ts       → Build configuration
tailwind.config.js   → UI theme configuration
```

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

## 🔧 Key Patterns

### Component Pattern
```typescript
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20">
      {/* Component content */}
    </Card>
  );
};
```

### Service Integration
```typescript
// In services/ files
export const featureService = {
  async method(data: RequestType): Promise<ResponseType> {
    const response = await apiClient.post('/endpoint', data);
    return response.data;
  }
};
```

### Custom Hook Pattern
```typescript
export const useFeature = () => {
  const [state, setState] = useState(initialState);
  
  const method = useCallback(async () => {
    // Hook logic
  }, []);
  
  return { state, method };
};
```

## 🎨 UI Standards

### Glassmorphism Classes
```css
bg-white/10 backdrop-blur-md border border-white/20  /* Glass card */
bg-gradient-to-r from-blue-500 to-blue-600          /* Primary button */
```

### Responsive Design
```typescript
const isMobile = window.innerWidth < 768;
className={`${isMobile ? 'mobile-class' : 'desktop-class'}`}
```

## 🔍 Common Tasks

**New Page**: Create in `pages/` → add route in `App.tsx`  
**New Component**: Create in `components/feature/` → export from `index.ts`  
**API Integration**: Add service in `services/` → use in components  
**State Management**: Custom hook in `hooks/` or context in `contexts/`  
**Types**: Add interface in `types/` → export from `index.ts`

## 🚨 Debug Checklist

- [ ] Check console for TypeScript errors
- [ ] Verify API endpoints are working
- [ ] Test responsive design on mobile
- [ ] Check authentication token in localStorage
- [ ] Validate component props and state
- [ ] Test error boundaries and loading states 