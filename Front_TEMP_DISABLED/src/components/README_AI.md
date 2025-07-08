# Components Directory AI Guide - `/Front/src/components/`

> **UI Components**: Feature-organized React components with glassmorphism theme and responsive design

## 🎯 Component Architecture

**Organization**: Feature-based grouping with shared UI components  
**Theme**: Glassmorphism design with Tailwind CSS  
**Responsive**: Mobile-first design with breakpoint handling  
**Reusable**: Modular components with clear interfaces

## 📁 Component Organization

```
ui/                  → Base UI components (buttons, cards, inputs)
├── ChatContainer.tsx    → Main chat layout container
├── ChatHeader.tsx       → Chat page header with controls
├── MessageList.tsx      → Chat message display with auto-scroll
├── MessageInput.tsx     → Message input with file attachments
└── ErrorDisplay.tsx     → Error handling and display

chat/                → Chat-specific components
├── conversation/        → Conversation management
├── ui/                 → Chat UI components
├── AssistantSelector.tsx → AI assistant selection
└── FileUploadArea.tsx   → Drag-and-drop file interface

admin/               → Admin panel components
├── components/         → Admin-specific UI components
├── DepartmentManagement.tsx → Department CRUD
├── UserManagement.tsx      → User administration
└── LLMConfiguration.tsx    → LLM provider setup

assistant/           → AI assistant management
├── edit/               → Assistant editing components
├── edit-modal/         → Modal-based editing
├── AssistantCard.tsx   → Assistant display card
└── AssistantBadge.tsx  → Assistant status indicator

ProtectedRoute.tsx   → Authentication wrapper component
```

## 🔧 Component Patterns

### Base Component Structure
```typescript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  title: string;
  data?: any[];
  onAction?: (id: number) => void;
  isLoading?: boolean;
}

export const Component: React.FC<ComponentProps> = ({
  title,
  data = [],
  onAction,
  isLoading = false
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleClick = (id: number) => {
    setSelectedId(id);
    onAction?.(id);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="space-y-2">
            {data.map(item => (
              <Button
                key={item.id}
                onClick={() => handleClick(item.id)}
                variant={selectedId === item.id ? "default" : "outline"}
                className="w-full justify-start"
              >
                {item.name}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

### Modal Component Pattern
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
```

## 🔍 Key Component Groups

### Chat Components (`chat/`)
```typescript
// Message display with streaming support
export const MessageList: React.FC<MessageListProps> = ({ messages, streamingContent }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
      {streamingContent && (
        <div className="bg-white/5 rounded-lg p-4">
          <ReactMarkdown>{streamingContent}</ReactMarkdown>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Message input with file support
export const MessageInput: React.FC<MessageInputProps> = ({ onSend, attachments }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSend(message, attachments);
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-white/20 p-4">
      <div className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-white/5 border-white/20"
          disabled={isLoading}
        />
        <Button type="submit" disabled={!message.trim() || isLoading}>
          {isLoading ? <Spinner /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
};
```

### Admin Components (`admin/`)
```typescript
// Data table with search and filtering
export const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  columns, 
  searchKey,
  onEdit,
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = data.filter(item =>
    item[searchKey]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Data Management</CardTitle>
          <Input
            placeholder={`Search by ${searchKey}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-white/5 border-white/20"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map(item => (
              <TableRow key={item.id}>
                {columns.map(column => (
                  <TableCell key={column.key}>
                    {item[column.key]}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => onEdit(item)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
```

## 🎨 Styling Standards

### Glassmorphism Components
```typescript
// Standard glass card
<Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">

// Glass input field
<Input className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-blue-400">

// Primary button with gradient
<Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">

// Danger button
<Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
```

### Responsive Design
```typescript
// Mobile-responsive layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive text sizes
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">

// Mobile-specific behavior
<Dialog className={`${isMobile ? 'h-full w-full' : 'max-w-md'}`}>
```

## 🔧 Component Development

### Adding New Component
1. Create in appropriate feature directory
2. Define TypeScript interface for props
3. Implement with glassmorphism styling
4. Add loading and error states
5. Ensure mobile responsiveness
6. Export from index.ts if reusable

### Component Best Practices
- Use proper TypeScript interfaces
- Include loading and error states
- Follow glassmorphism design patterns
- Ensure mobile responsiveness
- Add proper accessibility attributes
- Use proper event handling

## 🚨 Common Issues

**Styling Inconsistency**: Use established glassmorphism classes  
**Mobile Layout**: Test on mobile devices and use responsive classes  
**Type Errors**: Ensure proper prop interfaces and default values  
**Performance**: Use useCallback/useMemo for expensive operations  
**Accessibility**: Add proper ARIA labels and keyboard navigation

## 📋 Component Checklist

- [ ] TypeScript interface for props
- [ ] Glassmorphism styling applied
- [ ] Loading state handling
- [ ] Error state handling
- [ ] Mobile responsive design
- [ ] Proper event handling
- [ ] Accessibility considerations
- [ ] Exported from appropriate index.ts 