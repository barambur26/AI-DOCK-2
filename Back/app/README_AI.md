# App Directory AI Guide - `/Back/app/`

> **Core Application**: FastAPI application with clean architecture separation

## 🎯 App Structure

**Entry**: `main.py` - FastAPI app initialization and router registration  
**Pattern**: Layered architecture with clear separation of concerns  
**Auth**: JWT-based with role hierarchy (admin > manager > user)  
**Database**: SQLAlchemy with async support

## 📁 Key Modules

```
main.py              → FastAPI app, CORS, router registration, startup
├── api/             → HTTP endpoints grouped by feature
├── core/            → Core infrastructure (config, database, security)
├── models/          → SQLAlchemy ORM models with relationships
├── schemas/         → Pydantic models for request/response validation
├── services/        → Business logic layer (where magic happens)
└── middleware/      → Custom middleware (security headers, etc.)
```

## 🔧 Integration Flow

```
HTTP Request → API Router → Pydantic Schema → Service Layer → SQLAlchemy Model → Database
```

## 🚨 Critical Files

**`main.py`**: Router registration, CORS, app lifecycle  
**`core/config.py`**: Environment variables, database URL, API keys  
**`core/database.py`**: Database connection, session management  
**`core/security.py`**: JWT tokens, password hashing, user authentication

## 🔍 Common Patterns

### Router Registration (main.py)
```python
from app.api import auth, chat, admin
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
```

### Dependencies
```python
from app.core.security import get_current_user
from app.core.database import get_async_db
```

### Error Handling
```python
try:
    result = await service.method()
    return result
except SomeException as e:
    raise HTTPException(status_code=400, detail=str(e))
```

## 🔧 Quick Operations

**Add Router**: Create in `api/` → register in `main.py`  
**Add Service**: Create in `services/` → import in API  
**Add Model**: Create in `models/` → add to `__init__.py`  
**Add Schema**: Create in `schemas/` → use in API endpoints  
**Debug**: Check `main.py` imports, then specific module errors 