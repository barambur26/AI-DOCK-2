Debug an issue in AI Dock using systematic troubleshooting: $ARGUMENTS

Follow these systematic debugging steps:

1. **Gather information**:
   - Read error messages, logs, and console output
   - Check browser dev tools for frontend issues
   - Look at FastAPI logs for backend issues
   - Identify which layer the issue is in (UI, API, Database, Auth)

2. **Check common AI Dock issues**:
   - **Auth issues**: Verify JWT tokens, check `/Back/app/core/security.py`
   - **Database issues**: Check connection in `/Back/app/core/database.py`
   - **File upload issues**: Verify file processing in `/Back/app/services/file_services/`
   - **Streaming issues**: Check SSE implementation in chat services
   - **Quota issues**: Verify quota enforcement in `/Back/app/services/quota_service.py`

3. **Trace the request flow**:
   - Frontend: Component → Service → API call
   - Backend: API → Service → Model → Database
   - Check each layer systematically

4. **Use debugging tools**:
   - `console.log` for frontend debugging
   - `print()` or `logger` for backend debugging  
   - Browser Network tab for API calls
   - Database queries with `/Back/scripts/explore_database.py`

5. **Check recent changes**:
   - Look at git history: `git log --oneline -10`
   - Check if related to recent refactoring
   - Review migration files in `/Back/alembic/versions/`

6. **Fix systematically**:
   - Start with the simplest possible fix
   - Follow established error handling patterns
   - Add appropriate logging for future debugging
   - Test the fix thoroughly

7. **Document and commit**:
   - Add comments explaining the fix
   - Update error handling if needed
   - Commit with clear description of issue and solution

Always check both frontend and backend logs when debugging API-related issues.
