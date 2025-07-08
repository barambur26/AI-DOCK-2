# Default Assistant Helper Functions Usage

This document demonstrates how `ChatContainer` can use the new helper functions from `useFolderContext` to obtain default assistant information for projects/folders.

## Available Helper Functions

### 1. Synchronous Helpers (for cached data)

```typescript
const {
  // For the current new chat folder context
  getNewChatFolderDefaultAssistant,        // Returns { id: number, name: string } | null
  getNewChatFolderDefaultAssistantId,      // Returns number | null
  getNewChatFolderDefaultAssistantName,    // Returns string | null
  
  // For the currently viewing folder
  getViewingFolderDefaultAssistant,        // Returns { id: number, name: string } | null
  
  // For any project by ID (async)
  getProjectDefaultAssistantById           // async (projectId: number) => Promise<{ id: number, name: string } | null>
} = useFolderContext();
```

### 2. Usage Examples in ChatContainer

#### Example 1: Check if current new chat folder has a default assistant
```typescript
const handleNewChatWithFolderDefault = () => {
  const defaultAssistant = getNewChatFolderDefaultAssistant();
  
  if (defaultAssistant) {
    console.log(`Auto-selecting default assistant: ${defaultAssistant.name} (ID: ${defaultAssistant.id})`);
    handleAssistantSelect(defaultAssistant.id);
  } else {
    console.log('No default assistant for this folder');
  }
};
```

#### Example 2: Check viewing folder's default assistant
```typescript
const handleShowFolderInfo = () => {
  const defaultAssistant = getViewingFolderDefaultAssistant();
  
  if (defaultAssistant) {
    console.log(`Viewing folder has default assistant: ${defaultAssistant.name}`);
  }
};
```

#### Example 3: Fetch default assistant for any project ID
```typescript
const handleCheckProjectDefaultAssistant = async (projectId: number) => {
  try {
    const defaultAssistant = await getProjectDefaultAssistantById(projectId);
    
    if (defaultAssistant) {
      console.log(`Project ${projectId} has default assistant: ${defaultAssistant.name} (ID: ${defaultAssistant.id})`);
      return defaultAssistant;
    } else {
      console.log(`Project ${projectId} has no default assistant`);
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch project default assistant:', error);
    return null;
  }
};
```

#### Example 4: Use in conversation loading logic
```typescript
const handleLoadConversationWithProjectDefault = async (conversationId: number, projectId?: number) => {
  // Load the conversation first
  await handleLoadConversation(conversationId);
  
  // If conversation is in a project, check for default assistant
  if (projectId) {
    const defaultAssistant = await getProjectDefaultAssistantById(projectId);
    
    if (defaultAssistant && defaultAssistant.id !== selectedAssistantId) {
      console.log(`Auto-selecting project default assistant: ${defaultAssistant.name}`);
      handleAssistantSelect(defaultAssistant.id);
    }
  }
};
```

## Key Benefits

1. **Cached Data Access**: For frequently accessed folders (viewing/new chat), data is already cached and available synchronously
2. **On-Demand Fetching**: For arbitrary project IDs, the async helper fetches fresh data from the API
3. **Consistent Interface**: All helpers return the same `{ id: number, name: string } | null` format
4. **Error Handling**: The async helper includes proper error handling and logging
5. **No Side Effects**: All helpers are pure functions that don't modify state

## Implementation Status

✅ **COMPLETED**: All helper functions have been implemented in `useFolderContext`
✅ **COMPLETED**: Functions are properly exported and available for use
✅ **COMPLETED**: Proper TypeScript typing with consistent return types
✅ **COMPLETED**: Error handling for the async project fetching helper
✅ **COMPLETED**: Comprehensive logging for debugging

The `ChatContainer` can now easily access default assistant information in three ways:
1. From cached new chat folder context (synchronous)
2. From cached viewing folder context (synchronous)  
3. From any project ID via API call (asynchronous)
