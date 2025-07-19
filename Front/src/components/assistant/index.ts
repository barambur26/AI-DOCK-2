// 🤖 Assistant Components Index
// Clean exports for all assistant-related UI components

export { AssistantDivider } from './AssistantDivider';
export { AssistantBadge } from './AssistantBadge';
export { AssistantCard } from './AssistantCard';
export { CreateAssistantModal } from './CreateAssistantModal';
export { EditAssistantModal } from './EditAssistantModal';
export { AssistantEditPopup } from './AssistantEditPopup';
export { AssistantDiagnostic } from './AssistantDiagnostic';

/**
 * 🎓 LEARNING: Component Organization
 * ==================================
 * Index files provide:
 * - Clean import statements in other files
 * - Single source of truth for component exports
 * - Easy refactoring and component management
 * - Better developer experience with autocompletion
 * 
 * Usage:
 * ```tsx
 * import { AssistantDivider, AssistantBadge, AssistantDiagnostic, AssistantEditPopup } from '../components/assistant';
 * ```
 * 
 * **AssistantEditPopup**: Large popup modal for comfortable assistant editing
 * - Replaces embedded sidebar editing with spacious modal interface
 * - Triggered via URL parameter `?assistant=ID`
 * - Features: Dark theme, 4-column layout, all elements fit properly
 */