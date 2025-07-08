# CLAUDE.md - AI Dock Project Quick Reference

> **For Claude**: Essential navigation and patterns for the AI Dock enterprise LLM gateway  
> **📋 For detailed guides**: Check `README_AI.md` files in each directory

## 🎯 Project Summary

**AI Dock** is a production-ready enterprise LLM gateway with:
- **Tech Stack**: FastAPI + React + TypeScript + PostgreSQL + JWT auth
- **Features**: Multi-provider LLM access, streaming chat, file uploads, quotas, analytics
- **Architecture**: Service layer pattern, component composition, mobile-first responsive design
- **Security**: Role-based access (admin/manager/user), department isolation, CSP headers

**Status**: Fully functional with 5 completed phases. All core features working including conversation persistence (recently fixed).

---

## 🗂️ Navigation & Detailed Guides

### Backend (`/Back/`)
📖 **Read**: [`/Back/README_AI.md`](Back/README_AI.md) for backend overview

```
app/main.py          → FastAPI entry point
├── api/             → HTTP endpoints → 📖 README_AI.md
├── core/            → Infrastructure → 📖 README_AI.md  
├── models/          → Database ORM → 📖 README_AI.md
├── services/        → Business logic → 📖 README_AI.md
└── schemas/         → Validation → 📖 README_AI.md
```

### Frontend (`/Front/`)
📖 **Read**: [`/Front/README_AI.md`](Front/README_AI.md) for frontend overview

```
src/App.tsx          → React entry point
├── components/      → UI components → 📖 README_AI.md
├── services/        → API integration → 📖 README_AI.md
├── hooks/           → Custom hooks → 📖 README_AI.md
└── types/           → TypeScript → 📖 README_AI.md
```

---

## 🔧 Core Patterns

### Backend Flow
```python
# Standard: api → service → model → database
@router.post("/endpoint")
async def endpoint(request: Schema, user: User = Depends(get_current_user)):
    return await service.method(request, user)
```

### Frontend Flow
```typescript
// Component → Hook → Service → API
const { data, isLoading } = useFeature();
```

### Key Relationships
```python
User → Department → Quota → Usage Analytics
Conversation → Messages → File Attachments
Assistant → LLM Config → Provider
```

---

## 🚨 Quick Debugging

### 1. Find the Right Guide
- **API Issues**: [`/Back/app/api/README_AI.md`](Back/app/api/README_AI.md)
- **Database Problems**: [`/Back/app/models/README_AI.md`](Back/app/models/README_AI.md)
- **Business Logic**: [`/Back/app/services/README_AI.md`](Back/app/services/README_AI.md)
- **UI Components**: [`/Front/src/components/README_AI.md`](Front/src/components/README_AI.md)
- **State Management**: [`/Front/src/hooks/README_AI.md`](Front/src/hooks/README_AI.md)
- **API Integration**: [`/Front/src/services/README_AI.md`](Front/src/services/README_AI.md)

### 2. Common Issue Locations
| Problem | Backend Location | Frontend Location |
|---------|------------------|-------------------|
| **Chat Streaming** | `/services/llm/` + `/api/chat_streaming.py` | `/services/chat/streaming.ts` + `/hooks/chat/` |
| **Authentication** | `/core/security.py` + `/api/auth.py` | `/hooks/useAuth.ts` + `/services/authService.ts` |
| **File Upload** | `/api/files/` + `/services/file_processing/` | `/components/chat/ui/FileUploadArea.tsx` |
| **Database** | `/models/` + `/core/database.py` | API service integration |

### 3. Quick Commands
```bash
# Backend
cd Back && uvicorn app.main:app --reload
cd Back && python test_*.py

# Frontend  
cd Front && npm run dev
```

---

## 🔑 Recent Fixes & Architecture

### Fixed: Conversation Persistence ✅
- **Issue**: New messages in old conversations weren't saving to DB
- **Fix**: Smart persistence in `conversationUpdateService.ts`
- **Details**: See [`/Front/src/services/README_AI.md`](Front/src/services/README_AI.md)

### Authentication System
- JWT with auto-refresh (5min before expiry)
- Role hierarchy: admin > manager > user
- Department isolation for data access
- **Details**: See [`/Back/app/core/README_AI.md`](Back/app/core/README_AI.md)

### LLM Integration
- Multi-provider (OpenAI, Anthropic)
- Server-Sent Events streaming
- Usage tracking (40+ fields)
- Quota enforcement
- **Details**: See [`/Back/app/services/README_AI.md`](Back/app/services/README_AI.md)

---

## 📋 Development Workflow

### Adding New Feature
1. **Backend**: Schema → Service → API → Register router
2. **Frontend**: Service → Component → Hook → Types
3. **Both**: Follow patterns in respective README_AI.md files

### Quick Integration Checklist
- [ ] **Backend**: Check [`/Back/README_AI.md`](Back/README_AI.md) for patterns
- [ ] **Frontend**: Check [`/Front/README_AI.md`](Front/README_AI.md) for patterns  
- [ ] **Database**: Check [`/Back/app/models/README_AI.md`](Back/app/models/README_AI.md) for relationships
- [ ] **Types**: Check [`/Front/src/types/README_AI.md`](Front/src/types/README_AI.md) for interfaces

---

## 🎨 UI Standards

### Glassmorphism Theme
```css
.glass-card { @apply bg-white/10 backdrop-blur-md border border-white/20; }
.btn-primary { @apply bg-gradient-to-r from-blue-500 to-blue-600; }
```
**Details**: See [`/Front/src/components/README_AI.md`](Front/src/components/README_AI.md)

### Component Standards
- Loading states with spinners
- Error handling with toast notifications  
- Mobile-first responsive design
- Auto-scroll for chat messages

---

## 🚨 Emergency Debugging

| Issue | Quick Fix | Detailed Guide |
|-------|-----------|----------------|
| **App Won't Start** | Check `main.py` imports | [`/Back/app/README_AI.md`](Back/app/README_AI.md) |
| **Auth Not Working** | Check JWT secret | [`/Back/app/core/README_AI.md`](Back/app/core/README_AI.md) |
| **Streaming Broken** | Check SSE connection | [`/Back/app/services/README_AI.md`](Back/app/services/README_AI.md) |
| **UI Issues** | Check glassmorphism classes | [`/Front/src/components/README_AI.md`](Front/src/components/README_AI.md) |
| **Type Errors** | Check interface alignment | [`/Front/src/types/README_AI.md`](Front/src/types/README_AI.md) |

---

## 📁 Using the Folder Structure File

**Location**: [`Helpers/folder_structure.txt`](Helpers/folder_structure.txt)

### Quick File Location
```bash
# Find any file instantly
grep -n "filename.py" Helpers/folder_structure.txt
grep -n "ComponentName.tsx" Helpers/folder_structure.txt
```

### Navigation Workflow
1. **🔍 Locate**: Use folder_structure.txt to find exact file paths
2. **📖 Understand**: Read corresponding README_AI.md for patterns
3. **🔧 Debug**: Apply fixes using the emergency table below

### File Types at a Glance
- **`.py`** → Backend logic (FastAPI, services, models)
- **`.tsx`** → Frontend components (React, UI)
- **`.ts`** → Frontend logic (services, hooks, types)
- **`/api/`** → HTTP endpoints
- **`/services/`** → Business logic
- **`/components/`** → UI components


---

**🎯 Usage**: Start here for navigation, then dive into specific `README_AI.md` files for detailed patterns, examples, and troubleshooting in each directory.

Step 1: Think step-by-step to identify the root cause of the issue.
Step 2: Once identified, plan a fix that is minimal, modular, and preserves all existing functionality.
Step 3: Apply the fix. Ensure changes are atomic and follow clean, standard programming practices. Do not introduce regressions.
