# Bug Exploration Test Results

## Task 1: Bug Condition Exploration Test

### Test Execution Date

March 2, 2026

### Test Results

✅ **Bug Condition C(X) is TRUE** - Bug confirmed to exist

### Endpoint Test Results

| Endpoint                     | Method | Expected | Actual        | Status           |
| ---------------------------- | ------ | -------- | ------------- | ---------------- |
| /api/auth/login              | POST   | JSON API | 404 Not Found | ❌ Bug Confirmed |
| /api/auth/register           | POST   | JSON API | 404 Not Found | ❌ Bug Confirmed |
| /api/votes/ballot            | GET    | JSON API | HTML (Vite)   | ❌ Bug Confirmed |
| /api/election/constituencies | GET    | JSON API | HTML (Vite)   | ❌ Bug Confirmed |

### Root Cause Analysis

The test reveals that:

1. **Auth routes return 404**: The `/api/auth/*` endpoints are completely not found, suggesting these routes are not registered at all.

2. **Other routes return HTML**: The `/api/votes/*` and `/api/election/*` endpoints return HTML from a Vite development server instead of JSON API responses.

3. **Wrong server is running**: A frontend development server (Vite) is running on port 3000, intercepting all requests that should go to the Express API backend.

### Hypothesis

The Express API server defined in `src/server.ts` is NOT actually running on port 3000. Instead, a frontend development server (likely Vite for a Vue.js application) is running on that port and serving the frontend application.

The `npm run dev` command is executing `nodemon` which runs `tsx src/server.ts`, but the server may be:

- Failing to start silently
- Starting on a different port
- Being overridden by another process

### Next Steps

Task 2 will investigate the nodemon configuration and verify what is actually running on port 3000.

## Task 2: Nodemon Configuration Investigation

### Investigation Results

✅ **Root Cause Identified**

### Process Analysis

| PID   | Process           | Port | Status                                  |
| ----- | ----------------- | ---- | --------------------------------------- |
| 2156  | Vite (Frontend)   | 3000 | ✅ Listening                            |
| 90106 | Express (Backend) | 3000 | ❌ Failed to bind (port already in use) |

### Nodemon Configuration

File: `nodemon.json`

```json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.test.ts"],
  "exec": "tsx src/server.ts"
}
```

✅ Configuration is correct - uses `tsx` to run TypeScript files

### Root Cause Confirmed

**Port Conflict**: Two servers are trying to use port 3000:

1. **Frontend (Vite)** - Started first, successfully bound to port 3000
   - Located in: `~/Desktop/frontend-final-713-main/`
   - Serving Vue.js application
2. **Backend (Express)** - Started second, failed to bind to port 3000
   - Located in: `~/Desktop/final-project-713-main/` (current project)
   - Logs show "Server is running on http://localhost:3000" but this is misleading
   - The server attempted to listen on port 3000 but the port was already taken
   - Express silently continues running but cannot accept connections

### Why Auth Routes Return 404

The auth routes return 404 because:

1. Requests to `http://localhost:3000/api/auth/*` go to the Vite frontend server (PID 2156)
2. The Vite server doesn't have these routes defined
3. Vite returns 404 for unknown routes

### Why Other Routes Return HTML

The other routes return HTML because:

1. Requests to `http://localhost:3000/api/votes/*` and `/api/election/*` go to the Vite frontend server
2. Vite's dev server has a fallback that serves `index.html` for client-side routing
3. This is why we see the Vue.js application HTML

### Solution

The backend Express server needs to run on a different port (e.g., 5000 or 3001) to avoid conflict with the frontend Vite server.

## Final Summary

### Fix Implemented

✅ **Changed backend API port from 3000 to 3001**

**File Modified**: `.env`

- Changed `PORT=3000` to `PORT=3001`

### Verification Results

✅ **All API endpoints now working correctly**

| Endpoint                     | Method | Expected | Actual   | Status  |
| ---------------------------- | ------ | -------- | -------- | ------- |
| /                            | GET    | 200 JSON | 200 JSON | ✅ PASS |
| /api/auth/login              | POST   | 400 JSON | 400 JSON | ✅ PASS |
| /api/votes/ballot            | GET    | 401 JSON | 401 JSON | ✅ PASS |
| /api/election/constituencies | GET    | 200 JSON | 200 JSON | ✅ PASS |
| /api/admin/users             | GET    | 401 JSON | 401 JSON | ✅ PASS |

### Documentation Updated

✅ **README.md** - Updated port references from 3000 to 3001
✅ **BUGFIX_NOTES.md** - Comprehensive documentation of the bug and fix

### Configuration

**Backend API**:

- Port: 3001
- URL: http://localhost:3001
- Swagger Docs: http://localhost:3001/api-docs

**Frontend (Vite)**:

- Port: 3000
- URL: http://localhost:3000
- Location: ~/Desktop/frontend-final-713-main/

### Next Steps for Frontend Integration

The frontend application needs to be configured to make API requests to `http://localhost:3001` instead of `http://localhost:3000`.

**Option 1**: Update API base URL in frontend code
**Option 2**: Configure Vite proxy to forward `/api/*` requests to port 3001

### Bug Resolution

✅ **Bug Condition C(X) is now FALSE** - Bug is fixed

- Auth routes now return proper JSON responses (not 404)
- All API routes return JSON (not HTML)
- Backend API is accessible on port 3001
- No port conflicts between frontend and backend
