# Conversation Loading Assistant Selection Tests

This directory contains regression/behavior tests for the conversation loading functionality, specifically testing the assistant selection logic when loading conversations with `assistant_id = null` and `project_id`.

## Test Scenarios Covered

### 1. Loading a conversation with `assistant_id = null` and `project_id` with default assistant triggers `handleAssistantSelect`

**Location**: `conversationLoadingAssistantSelection.test.ts`  
**Test**: "should call handleAssistantSelect with default assistant when conversation has null assistant_id and project has default"

This test verifies that when:
- A conversation is loaded with `assistant_id = null`
- The conversation has a `project_id` 
- The project has a `default_assistant_id` set

Then:
- The `handleAssistantSelect` function is called with the project's default assistant ID

### 2. Same scenario but project has no default assistant triggers `deactivateAssistant`

**Location**: `conversationLoadingAssistantSelection.test.ts`  
**Test**: "should call deactivateAssistant when conversation has null assistant_id and project has no default"

This test verifies that when:
- A conversation is loaded with `assistant_id = null`
- The conversation has a `project_id`
- The project has no `default_assistant_id` (is null)

Then:
- The `deactivateAssistant` function is called

## Additional Test Coverage

The test suite also covers:

1. **Conversation with specific assistant**: When a conversation has a specific `assistant_id`, it should always use that assistant regardless of project defaults.

2. **Conversation with no project**: When a conversation has no `project_id`, and no `assistant_id`, it should deactivate the assistant.

## Test Implementation

The tests are implemented using:
- **Jest** for the testing framework
- **Pure logic testing** without complex mocking to ensure reliability
- **Simulation of ChatContainer logic** to test the integration flow

The tests simulate the exact logic found in `ChatContainer.tsx` in the `handleLoadSelectedConversation` function (lines 334-350), which determines whether to:
- Call `handleAssistantSelect(conversationAssistantId)` for conversations with specific assistants
- Call `handleAssistantSelect(fallbackAssistantId)` for conversations using project default assistants
- Call `deactivateAssistant()` for conversations with no available assistant

## Running the Tests

```bash
# Run all tests
npm test

# Run only these tests
npm test conversationLoadingAssistantSelection.test.ts

# Run tests in watch mode
npm test:watch
```

## Code Coverage

The tests cover the critical decision-making logic that determines assistant behavior when loading conversations, ensuring that:
- Project default assistants are properly activated when conversations don't specify an assistant
- Assistant deactivation occurs when no assistant is available
- Conversation-specific assistants take precedence over project defaults
