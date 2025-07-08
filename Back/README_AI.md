# Backend AI Guide - `/Back/`

> **Quick Reference**: FastAPI backend with service layer architecture, JWT auth, and multi-provider LLM integration

## 🎯 Backend Overview

**Entry Point**: `app/main.py` - FastAPI app with all router registrations  
**Architecture**: Clean separation → API → Service → Model → Database  
**Authentication**: JWT tokens with role-based access control  
**Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations

## 📁 Directory Structure

```
app/                 → Main application package
├── main.py         → FastAPI app entry point, CORS, router registration
├── core/           → Core functionality (config, database, security)
├── api/            → API endpoints organized by feature
├── models/         → SQLAlchemy database models
├── schemas/        → Pydantic request/response validation
├── services/       → Business logic layer
└── middleware/     → Custom middleware (security headers, etc.)

alembic/            → Database migration management
├── versions/       → Migration files
└── env.py         → Alembic configuration

scripts/            → Utility scripts (create admin, explore DB)
test_*.py          → Integration test files
requirements.txt   → Python dependencies
```

## 🚀 Quick Start Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload

# Create admin user
python scripts/create_admin_user.py

# Run tests
python test_claude_quick.py
python test_conversation_default_assistant.py
```

## 🔧 Key Patterns

### API Endpoint Pattern
```python
# In api/ files
@router.post("/endpoint")
async def endpoint_name(
    request: RequestSchema,
    current_user: User = Depends(get_current_user)
):
    return await service.method(request, current_user)
```

### Service Layer Pattern
```python
# In services/ files
async def business_method(request: Schema, user: User):
    # Validation, business logic, database operations
    return result
```

### Model Relationships
```python
# In models/ files
class Model(Base):
    __tablename__ = "table_name"
    id = Column(Integer, primary_key=True)
    # Relationships with back_populates
```

## 🔍 Common Tasks

**Add New Endpoint**: `api/` → `services/` → `schemas/` → register in `main.py`  
**Database Changes**: `models/` → create migration → update services  
**Authentication**: Check `core/security.py` for JWT handling  
**LLM Integration**: `services/llm/` for provider logic  
**File Processing**: `services/file_processing/` for uploads

## 🚨 Debug Checklist

- [ ] Check `main.py` for import errors
- [ ] Verify database connection in `core/database.py`
- [ ] Test endpoints with `test_*.py` scripts
- [ ] Check logs for authentication issues
- [ ] Validate environment variables in `core/config.py` 