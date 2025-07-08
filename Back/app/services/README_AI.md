# Services Directory AI Guide - `/Back/app/services/`

> **Business Logic**: Service layer containing core business logic, LLM integration, and data processing

## 🎯 Service Architecture

**Pattern**: Business logic separation from API layer  
**LLM**: Multi-provider integration (OpenAI, Anthropic)  
**Processing**: File upload, streaming, analytics  
**Validation**: Business rule enforcement before database operations

## 📁 Key Services

```
auth_service.py           → Authentication, login, token management
llm_service*.py          → LLM provider integration, streaming
conversation_service.py  → Chat history management
file_service.py          → File upload, processing, storage
usage_service.py         → Analytics tracking, quota monitoring
admin_service.py         → Admin panel operations
quota_service.py         → Usage limit enforcement
assistant_service.py     → AI assistant management
project_service.py       → Project organization

llm/                     → LLM-specific modules
├── providers/           → Provider implementations (OpenAI, Anthropic)
├── handlers/            → Request handling, streaming
├── core/                → Cost calculation, config validation
└── logging/             → Error handling, request logging

file_processing/         → File processing modules
├── processors/          → Format-specific processors (PDF, Word, etc.)
├── exceptions/          → Processing error handling
└── utils/               → File utilities

chat/                    → Chat-specific services
file_services/           → File management services
```

## 🔧 Service Patterns

### Standard Service Structure
```python
from app.models import Model
from app.schemas.feature import FeatureRequest, FeatureResponse
from sqlalchemy.ext.asyncio import AsyncSession

class FeatureService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, request: FeatureRequest, user: User) -> FeatureResponse:
        # Business logic validation
        # Database operations
        # Return response
        pass
    
    async def get_by_user(self, user_id: int) -> List[FeatureResponse]:
        # Query with user filtering
        pass
```

### LLM Service Pattern
```python
# Multi-provider support
async def stream_chat(
    message: str, 
    model_name: str, 
    user: User
) -> AsyncGenerator[str, None]:
    # Provider routing
    provider = get_provider(model_name)
    
    # Quota checking
    await check_quota(user, estimated_cost)
    
    # Stream processing
    async for chunk in provider.stream(message):
        yield chunk
    
    # Usage logging
    await log_usage(user, tokens, cost)
```

## 🔍 Critical Services

### LLM Service (`llm_service.py`)
```python
async def chat_completion(request: ChatRequest, user: User):
    # Provider selection based on model
    # Quota validation
    # Request processing
    # Response streaming
    # Usage tracking
```

### Authentication Service (`auth_service.py`)
```python
async def authenticate_user(email: str, password: str):
    # User lookup
    # Password verification
    # JWT token generation
    # Refresh token handling
```

### File Service (`file_service.py`)
```python
async def process_upload(file: UploadFile, user: User):
    # File validation (size, type)
    # Content extraction
    # Storage management
    # Metadata tracking
```

### Conversation Service (`conversation_service.py`)
```python
async def save_conversation(messages: List[Message], user: User):
    # Message validation
    # Conversation creation/update
    # Title generation
    # History management
```

## 🔧 Common Operations

### Service Dependency Injection
```python
# In API endpoints
@router.post("/endpoint")
async def endpoint(
    request: Schema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    service = FeatureService(db)
    return await service.method(request, current_user)
```

### Error Handling
```python
from app.core.exceptions import BusinessLogicError

async def service_method(data):
    try:
        # Business logic
        return result
    except ValidationError as e:
        raise BusinessLogicError(f"Invalid data: {e}")
    except Exception as e:
        logger.error(f"Service error: {e}")
        raise
```

### Database Operations in Services
```python
async def get_user_data(user_id: int, db: AsyncSession):
    result = await db.execute(
        select(Model)
        .where(Model.user_id == user_id)
        .options(joinedload(Model.relationships))
    )
    return result.scalars().all()
```

## 🚨 Common Issues

**Provider Errors**: Check API keys and provider availability  
**Quota Exceeded**: Verify department limits and usage calculations  
**File Processing**: Check file format support and size limits  
**Stream Interruption**: Handle client disconnection gracefully  
**Database Locks**: Use proper transaction management

## 🔧 Service Development

### Adding New Service
1. Create service class with database dependency
2. Implement business logic methods
3. Add error handling and validation
4. Include logging and monitoring
5. Write unit tests
6. Integrate with API layer

### LLM Provider Integration
1. Implement provider interface in `llm/providers/`
2. Add model mapping in configuration
3. Update routing logic in LLM service
4. Test streaming and error handling
5. Add cost calculation support 