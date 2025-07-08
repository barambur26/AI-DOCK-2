# Core Directory AI Guide - `/Back/app/core/`

> **Infrastructure**: Core application infrastructure - config, database, security

## 🎯 Core Components

**Purpose**: Foundation layer for configuration, database, and security  
**Pattern**: Infrastructure as code with environment-based configuration  
**Security**: JWT tokens, password hashing, role-based access  
**Database**: Async SQLAlchemy with PostgreSQL

## 📁 Key Files

```
config.py            → Environment variables, API keys, database URL
database.py          → SQLAlchemy setup, session management, connection
security.py          → JWT tokens, password hashing, authentication
```

## 🔧 Critical Functions

### Configuration (`config.py`)
```python
class Settings(BaseSettings):
    database_url: str
    secret_key: str
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Database (`database.py`)
```python
# Async database session
async def get_async_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

# Database dependency
from app.core.database import get_async_db
db: AsyncSession = Depends(get_async_db)
```

### Security (`security.py`)
```python
# Authentication dependency
async def get_current_user(token: str = Depends(oauth2_scheme)):
    # JWT token validation and user retrieval
    return user

# Role-based access
def require_role(required_role: str):
    def role_checker(current_user: User = Depends(get_current_user)):
        if not check_role_hierarchy(current_user.role.name, required_role):
            raise HTTPException(403, "Insufficient permissions")
        return current_user
    return role_checker

# Password hashing
def hash_password(password: str) -> str:
def verify_password(plain_password: str, hashed_password: str) -> bool:
```

## 🔍 Common Operations

### Environment Setup
```python
# Access configuration
from app.core.config import settings
database_url = settings.database_url
api_key = settings.openai_api_key
```

### Database Operations
```python
# In API endpoints
async def endpoint(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(Model))
    return result.scalars().all()
```

### Authentication
```python
# Protect endpoints
@router.get("/protected")
async def protected_endpoint(
    current_user: User = Depends(get_current_user)
):
    return {"user_id": current_user.id}

# Role-based protection
@router.get("/admin-only")
async def admin_endpoint(
    admin_user: User = Depends(require_role("admin"))
):
    return {"message": "Admin access granted"}
```

## 🚨 Common Issues

**Database Connection**: Check `DATABASE_URL` in environment  
**Authentication Fails**: Verify `SECRET_KEY` and token format  
**Permission Denied**: Check user role hierarchy  
**Migration Errors**: Ensure database schema matches models

## 🔧 Key Dependencies

**Import Pattern**:
```python
from app.core.config import settings
from app.core.database import get_async_db
from app.core.security import get_current_user, require_role
```

**Environment Variables Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT signing key
- `OPENAI_API_KEY` - OpenAI API access
- `ANTHROPIC_API_KEY` - Anthropic API access 