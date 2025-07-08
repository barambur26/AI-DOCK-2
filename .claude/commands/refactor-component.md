Refactor a large monolithic component into modular architecture: $ARGUMENTS

Follow the proven AI Dock refactoring patterns:

1. **Analyze current component**: 
   - Read the target component file
   - Identify distinct responsibilities 
   - Look for state management, UI rendering, business logic
   - Check for reusable patterns
2. **Study successful refactoring examples**:
   - `/Front/src/components/chat/ui/` (ChatInterface.tsx refactoring)
   - `/Front/src/components/admin/quota/` (QuotaManagement.tsx refactoring)  
   - `/Front/src/components/admin/components/department/` (DepartmentModals.tsx refactoring)
3. **Create refactoring plan**:
   - Break down into atomic components (single responsibility)
   - Extract custom hooks for state management
   - Separate pure utility functions
   - Plan container-component architecture
4. **Execute modular refactoring**:
   - Create folder structure for new components
   - Extract hooks to `/Front/src/hooks/`
   - Create atomic UI components
   - Add utility functions to `/Front/src/utils/`
   - Create clean index.ts exports
5. **Preserve functionality**: 
   - Maintain exact same props interface
   - Keep all existing behavior
   - Ensure backward compatibility
6. **Update imports**: Create main component that orchestrates the modules
7. **Test thoroughly**: Verify no functionality lost
8. **Document refactoring**: Create summary of changes like existing REFACTORING_MIGRATION_GUIDE.md

CRITICAL: Never break existing functionality. Always maintain 100% backward compatibility.
Follow the Single Responsibility Principle for each extracted component.
