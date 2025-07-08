# Schemas Directory AI Guide - `/Back/app/schemas/`

> **Data Validation**: Pydantic models for request/response validation and serialization

## 🎯 Schema Purpose

**Validation**: Input validation and sanitization for all API endpoints  
**Serialization**: Consistent response formatting and data transformation  
**Documentation**: Auto-generated OpenAPI/Swagger documentation  
**Type Safety**: Runtime type checking and IDE support

## 📁 Schema Organization

```
auth.py              → Login, logout, token schemas
chat.py              → Chat requests, responses, streaming
conversation.py      → Chat history management
admin.py             → Admin panel operations (users, departments)
assistant.py         → AI assistant configuration
quota.py             → Usage limit management
file_upload.py       → File processing schemas
llm_config.py        → LLM provider settings
department.py        → Department management
role.py              → Role definitions

chat_api/            → Chat-specific API schemas
├── models.py        → Chat data models
├── requests.py      → Chat request schemas
└── responses.py     → Chat response schemas
```

## 🔧 Schema Patterns

### Base Schema Structure
```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

class BaseSchema(BaseModel):
    class Config:
        from_attributes = True  # For SQLAlchemy model conversion
        
class RequestSchema(BaseModel):
    field: str = Field(..., min_length=1, max_length=100)
    optional_field: Optional[str] = None
    
    @validator('field')
    def validate_field(cls, v):
        # Custom validation logic
        return v

class ResponseSchema(BaseSchema):
    id: int
    field: str
    created_at: datetime
```

### Request/Response Pairs
```python
# Request schema
class CreateUserRequest(BaseModel):
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    password: str = Field(..., min_length=8)
    department_id: int = Field(..., gt=0)
    role_id: int = Field(..., gt=0)

# Response schema
class UserResponse(BaseSchema):
    id: int
    email: str
    is_active: bool
    created_at: datetime
    
    # Nested relationships
    role: RoleResponse
    department: DepartmentResponse
```

## 🔍 Key Schema Groups

### Authentication (`auth.py`)
```python
class LoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=1)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
```

### Chat (`chat.py`)
```python
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    model_name: str
    file_attachment_ids: Optional[List[int]] = []
    stream: bool = True

class ChatResponse(BaseModel):
    content: str
    model_used: str
    tokens_used: int
    cost_usd: Optional[float]
```

### Admin Operations (`admin.py`)
```python
class CreateUserRequest(BaseModel):
    email: str = Field(..., regex=EMAIL_REGEX)
    password: str = Field(..., min_length=8)
    role_id: int
    department_id: int

class UpdateUserRequest(BaseModel):
    email: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[int] = None
    department_id: Optional[int] = None
```

## 🔧 Validation Patterns

### Field Validation
```python
from pydantic import validator, Field

class Schema(BaseModel):
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    age: int = Field(..., ge=0, le=150)
    tags: List[str] = Field(..., min_items=1, max_items=10)
    
    @validator('email')
    def validate_email_domain(cls, v):
        if not v.endswith('@company.com'):
            raise ValueError('Must use company email')
        return v.lower()
```

### Custom Validators
```python
class ChatRequest(BaseModel):
    message: str
    model_name: str
    
    @validator('message')
    def validate_message_content(cls, v):
        if len(v.strip()) == 0:
            raise ValueError('Message cannot be empty')
        return v.strip()
    
    @validator('model_name')
    def validate_model_exists(cls, v):
        valid_models = ['gpt-4', 'claude-3-opus', 'gpt-3.5-turbo']
        if v not in valid_models:
            raise ValueError(f'Model must be one of: {valid_models}')
        return v
```

## 🔍 Common Operations

### Schema Usage in APIs
```python
@router.post("/endpoint", response_model=ResponseSchema)
async def create_endpoint(
    request: RequestSchema,
    current_user: User = Depends(get_current_user)
):
    # Schema automatically validates request
    result = await service.create(request, current_user)
    return ResponseSchema.from_orm(result)  # SQLAlchemy model → Schema
```

### Schema Conversion
```python
# SQLAlchemy model → Pydantic schema
user_schema = UserResponse.from_orm(user_model)

# Dictionary → Pydantic schema
user_schema = UserResponse.parse_obj(user_dict)

# Schema → Dictionary
user_dict = user_schema.dict()
```

## 🚨 Common Issues

**Validation Errors**: Check field constraints and custom validators  
**Type Mismatches**: Ensure schema types match database column types  
**Missing Fields**: Verify required fields are provided in requests  
**Circular Imports**: Use forward references for model relationships  
**Serialization Errors**: Check `from_attributes = True` in Config

## 🔧 Schema Development

### Adding New Schema
1. Create request/response schema pair
2. Add field validation with appropriate constraints
3. Include custom validators for business rules
4. Test with sample data
5. Use in API endpoints with proper response models

### Schema Best Practices
- Use descriptive field names and docstrings
- Add appropriate field constraints (min/max length, regex)
- Include custom validators for business logic
- Use optional fields for partial updates
- Provide clear error messages in validators

## 📋 Schema Checklist

- [ ] Request schema with validation
- [ ] Response schema with from_attributes = True
- [ ] Appropriate field constraints
- [ ] Custom validators for business rules
- [ ] Clear field descriptions
- [ ] Proper type annotations 