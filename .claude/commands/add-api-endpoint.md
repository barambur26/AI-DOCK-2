Add a new API endpoint to AI Dock following the established patterns: $ARGUMENTS

Follow these steps:

1. **Analyze existing patterns**: Look at similar endpoints in `/Back/app/api/` to understand the structure
2. **Create Pydantic schema**: Add request/response schemas in `/Back/app/schemas/`
3. **Implement service layer**: Add business logic in `/Back/app/services/`
4. **Create API endpoint**: Add the endpoint in appropriate `/Back/app/api/` file
5. **Register router**: Update `/Back/app/main.py` to include the new router
6. **Add frontend service**: Create corresponding service in `/Front/src/services/`
7. **Update types**: Add TypeScript interfaces in `/Front/src/types/`
8. **Test the integration**: Verify the endpoint works with proper authentication
9. **Add error handling**: Ensure comprehensive error handling on both ends
10. **Commit with tests**: Create commit with integration tests

Always follow the service layer pattern: api → service → model
Ensure proper authentication and role-based access control.
