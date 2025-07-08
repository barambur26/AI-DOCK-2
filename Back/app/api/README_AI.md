# API Directory AI Guide - `/Back/app/api/`

> **HTTP Endpoints**: FastAPI routers organized by feature with authentication and validation

## 🎯 API Structure

**Pattern**: Feature-based router organization with consistent auth patterns  
**Auth**: JWT bearer tokens with role-based access control  
**Validation**: Pydantic schemas for all request/response data  
**Streaming**: Server-Sent Events for real-time chat responses

## 📁 Router Organization

```
auth.py                → Login, logout, token refresh
chat.py               → Chat completion, streaming responses
chat_streaming.py     → Dedicated streaming endpoint
conversations.py      → Chat history CRUD operations
files/                → File upload, processing, management (15+ endpoints)
admin/                → Admin panel functionality
├── users.py         → User management (CRUD, roles)
├── departments.py   → Department management 
├── quotas.py        → Usage quota configuration
└── llm_configs.py   → LLM provider settings
assistants/           → AI assistant management
manager/              → Manager dashboard functionality
projects/             → Project-based organization
```

## 🔧 Standard Patterns

### Basic Endpoint
```python
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.schemas.feature import FeatureRequest, FeatureResponse

router = APIRouter()

@router.post("/endpoint", response_model=FeatureResponse)
async def create_feature(
    request: FeatureRequest,
    current_user: User = Depends(get_current_user)
):
    return await feature_service.create(request, current_user)
```

### Role-Based Access
```python
from app.core.security import require_role

@router.get("/admin-only")
async def admin_endpoint(
    current_user: User = Depends(require_role("admin"))
):
    return await admin_service.get_data()
```

### Streaming Response
```python
from fastapi.responses import StreamingResponse

@router.post("/stream")
async def stream_endpoint(request: StreamRequest):
    async def generate():
        async for chunk in service.stream_data(request):
            yield f"data: {chunk}\n\n"
    
    return StreamingResponse(
        generate(), 
        media_type="text/plain",
        headers={"Cache-Control": "no-cache"}
    )
```

## 🔍 Key Endpoints

### Authentication (`auth.py`)
- `POST /login` - Email/password authentication
- `POST /logout` - Token invalidation
- `POST /refresh` - Token refresh

### Chat (`chat.py`, `chat_streaming.py`)
- `POST /stream` - Streaming chat responses
- `POST /send` - Standard chat completion
- File attachment support via `file_attachment_ids`

### Files (`files/`)
- `POST /upload` - File upload with processing
- `GET /{id}/download` - File download
- `DELETE /{id}` - File deletion
- `GET /` - List user files

### Admin (`admin/`)
- User CRUD with role management
- Department management with user assignment
- Quota configuration and monitoring
- LLM provider configuration

## 🚨 Common Issues

**Authentication Errors**: Check JWT token format and expiry  
**Validation Errors**: Verify Pydantic schema matches request data  
**Permission Denied**: Check user role and department access  
**Streaming Issues**: Verify SSE connection and chunk formatting

## 🔧 Adding New Endpoints

1. Create router file or add to existing
2. Define Pydantic schemas for request/response
3. Implement endpoint with proper auth dependencies
4. Register router in `main.py`
5. Test with appropriate user roles 