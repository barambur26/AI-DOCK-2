Create a new React component for AI Dock following the modular architecture: $ARGUMENTS

Follow these steps:

1. **Analyze component patterns**: Look at recently refactored components like `/Front/src/components/chat/ui/` and `/Front/src/components/admin/quota/` for patterns
2. **Plan component structure**: Decide if this needs:
   - Container-component separation
   - Custom hooks for state management  
   - Atomic sub-components
   - Service layer integration
3. **Create component files**: 
   - Main component with TypeScript interfaces
   - Custom hooks if needed (in `/Front/src/hooks/`)
   - Sub-components if complex
   - Service integration if API calls needed
4. **Follow UI patterns**:
   - Use glassmorphism theme classes
   - Implement responsive design (mobile-first)
   - Add loading and error states
   - Use existing UI components from `/Front/src/components/ui/`
5. **Add TypeScript types**: Create interfaces in `/Front/src/types/`
6. **Integrate with auth**: Use `useAuth` hook for authentication
7. **Add to parent component**: Update imports and usage
8. **Test responsiveness**: Verify mobile and desktop layouts
9. **Commit with documentation**: Include component documentation

Always preserve the glassmorphism design theme and responsive behavior.
Follow the established component composition patterns.
