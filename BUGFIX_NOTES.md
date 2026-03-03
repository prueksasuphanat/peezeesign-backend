# API 404 Error Bugfix Documentation

## Bug Summary

All API endpoint requests were returning 404 Not Found errors or HTML responses instead of JSON API responses.

## Root Cause

**Port Conflict**: The Express API backend and the Vue.js frontend (Vite dev server) were both configured to run on port 3000.

### Detailed Analysis

1. **Frontend Server (Vite)**: Running on port 3000, serving the Vue.js application
   - Process: `node .../vite` (PID 2156)
   - Started first and successfully bound to port 3000
2. **Backend Server (Express)**: Configured to run on port 3000 but failed to bind
   - Process: `tsx src/server.ts` (PID 90106)
   - Started second, attempted to bind to port 3000
   - Port was already in use by the frontend
   - Server logs showed "Server is running on http://localhost:3000" but this was misleading
   - The server process continued running but couldn't accept connections

### Symptoms

- **Auth routes** (`/api/auth/*`): Returned 404 Not Found
  - Requests went to the Vite frontend server
  - Vite didn't have these routes defined
- **Other API routes** (`/api/votes/*`, `/api/election/*`): Returned HTML instead of JSON
  - Requests went to the Vite frontend server
  - Vite's fallback served `index.html` for client-side routing

## Solution

Changed the backend API server to run on port 3001 to avoid conflict with the frontend on port 3000.

### Changes Made

**File**: `.env`

```diff
- PORT=3000
+ PORT=3001
```

### Why Port 3001?

- Port 3000: Reserved for frontend (Vite dev server)
- Port 5000: Occupied by Apple AirPlay service on macOS
- Port 3001: Available and commonly used for backend APIs in development

## Verification

### Before Fix

```bash
# Auth endpoint returned 404
curl -X POST http://localhost:3000/api/auth/login
# Response: 404 Not Found

# Other endpoints returned HTML
curl -X GET http://localhost:3000/api/election/constituencies
# Response: HTML (Vue.js app)
```

### After Fix

```bash
# Auth endpoint returns JSON with proper error
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nationalId":"1234567890123","laserCode":"INVALID"}'
# Response: {"success":false,"message":"Laser Code ไม่ถูกต้อง"}

# Election endpoint returns JSON data
curl -X GET http://localhost:3001/api/election/constituencies
# Response: {"success":true,"data":[...]}
```

## Test Results

### Bug Exploration Test (Task 1)

✅ Confirmed bug existed before fix:

- Auth routes: 404 (route not found)
- Other routes: HTML response (frontend server intercepting)

### Fix Verification Test (Task 6-7)

✅ All endpoints now working correctly:

- Health Check (`GET /`): 200 OK
- Auth Login (`POST /api/auth/login`): 400 Bad Request (correct error for invalid credentials)
- Vote Ballot (`GET /api/votes/ballot`): 401 Unauthorized (correct - no auth token)
- Election Constituencies (`GET /api/election/constituencies`): 200 OK with JSON data
- Admin Users (`GET /api/admin/users`): 401 Unauthorized (correct - no auth token)

## Configuration for Development

### Backend API

- **Port**: 3001
- **Base URL**: `http://localhost:3001`
- **API Routes**: `/api/*`
- **Documentation**: `http://localhost:3001/api-docs`

### Frontend (Vite)

- **Port**: 3000
- **Base URL**: `http://localhost:3000`
- **Location**: `~/Desktop/frontend-final-713-main/`

### Frontend API Configuration

The frontend should be configured to proxy API requests to the backend:

**Option 1**: Update frontend API base URL to `http://localhost:3001`

**Option 2**: Configure Vite proxy in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

## Lessons Learned

1. **Port conflicts are silent**: Express doesn't crash when it fails to bind to a port, making diagnosis difficult
2. **Check running processes**: Always verify what's actually listening on a port using `lsof -i :PORT`
3. **Separate concerns**: Frontend and backend should run on different ports in development
4. **Misleading logs**: Server logs can be misleading - verify actual network bindings

## Related Files

- `.env` - Environment configuration (PORT setting)
- `src/server.ts` - Express server entry point
- `nodemon.json` - Nodemon configuration (correct, no changes needed)
- `tests/bug-exploration.test.ts` - Bug condition exploration test
- `tests/fix-verification.test.ts` - Fix verification test

## Date

March 2, 2026
