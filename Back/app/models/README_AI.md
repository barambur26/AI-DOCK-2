# Models Directory AI Guide - `/Back/app/models/`

> **Database Models**: SQLAlchemy ORM models with relationships and constraints

## 🎯 Database Schema

**ORM**: SQLAlchemy with async support  
**Pattern**: Relationship-based design with foreign keys  
**Audit**: Created/updated timestamps on all models  
**Validation**: Database-level constraints + Pydantic validation

## 📁 Core Models

```
user.py              → User accounts, authentication, roles
role.py              → Role definitions (admin, manager, user)
department.py        → Organizational departments with quotas
llm_config.py        → LLM provider configurations
conversation.py      → Chat conversation storage
chat.py              → Individual chat messages
file_upload.py       → File attachments and metadata
usage_log.py         → Request tracking (40+ analytics fields)
quota.py             → Department usage limits
assistant.py         → AI assistant configurations
project.py           → Project-based organization
```

## 🔧 Model Patterns

### Base Model Structure
```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Model(Base):
    __tablename__ = "table_name"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    related = relationship("RelatedModel", back_populates="model")
```

### Key Relationships
```python
# User → Department (many-to-one)
class User(Base):
    department_id = Column(Integer, ForeignKey("departments.id"))
    department = relationship("Department", back_populates="users")

# Department → Users (one-to-many)
class Department(Base):
    users = relationship("User", back_populates="department")

# Conversation → Messages (one-to-many)
class Conversation(Base):
    messages = relationship("ChatMessage", back_populates="conversation")
```

## 🔍 Core Models Detail

### User Model (`user.py`)
```python
class User(Base):
    email: str (unique, indexed)
    hashed_password: str
    role_id: int (FK to roles)
    department_id: int (FK to departments)
    is_active: bool = True
    
    # Relationships
    role = relationship("Role")
    department = relationship("Department")
    conversations = relationship("Conversation")
    usage_logs = relationship("UsageLog")
```

### Conversation Model (`conversation.py`)
```python
class Conversation(Base):
    title: str
    user_id: int (FK to users)
    assistant_id: Optional[int] (FK to assistants)
    
    # Relationships
    user = relationship("User")
    messages = relationship("ChatMessage")
    assistant = relationship("Assistant")
```

### Usage Log Model (`usage_log.py`)
```python
class UsageLog(Base):
    # Analytics tracking (40+ fields)
    user_id: int
    model_name: str
    input_tokens: int
    output_tokens: int
    cost_usd: Decimal
    response_time_ms: int
    success: bool
    # ... many more tracking fields
```

## 🔧 Common Operations

### Model Import Pattern
```python
# In __init__.py
from .user import User
from .role import Role
from .department import Department
# ... all models

# Usage in services
from app.models import User, Conversation, ChatMessage
```

### Database Queries
```python
# Basic queries
user = await db.get(User, user_id)
users = await db.execute(select(User).where(User.is_active == True))

# With relationships
user_with_dept = await db.execute(
    select(User).options(joinedload(User.department))
)

# Complex queries
conversations = await db.execute(
    select(Conversation)
    .where(Conversation.user_id == user_id)
    .options(joinedload(Conversation.messages))
    .order_by(Conversation.updated_at.desc())
)
```

## 🚨 Common Issues

**Relationship Errors**: Check `back_populates` matches on both sides  
**Foreign Key Issues**: Ensure referenced table exists and has correct column  
**Migration Problems**: Add new columns with defaults or nullable=True  
**Import Errors**: Check circular imports, use forward references if needed

## 🔧 Adding New Models

1. Create model file with proper Base inheritance
2. Define columns with appropriate types and constraints
3. Add relationships with `back_populates`
4. Add to `__init__.py` imports
5. Create Alembic migration
6. Update related services and schemas

## 📋 Model Checklist

- [ ] Inherits from `Base`
- [ ] Has `__tablename__`
- [ ] Primary key column (`id`)
- [ ] Timestamps (`created_at`, `updated_at`)
- [ ] Proper foreign key relationships
- [ ] Added to `__init__.py`
- [ ] Migration created 