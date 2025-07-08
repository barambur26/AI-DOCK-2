export const conversationUpdateService = {
  smartSaveConversation: jest.fn(),
  getLastSavedCount: jest.fn().mockReturnValue(0),
  initializeConversationState: jest.fn(),
  clearConversationState: jest.fn(),
};
