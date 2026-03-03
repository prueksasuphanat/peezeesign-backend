# Bugfix Design Document

## Root Cause Analysis

### Investigation Summary

After examining the codebase, the following observations were made:

1. **Route Files**: All route files (`auth.routes.ts`, `vote.routes.ts`, `election.routes.ts`, `admin.routes.ts`) correctly export Express Router instances using `export default router`

2. **Server Configuration**: The `server.ts` file properly imports routes and mounts them with `app.use()` at the correct paths:
   - `/api/votes` → voteRoutes
   - `/api/auth` → authRoutes
   - `/api/election` → electionRoutes
   - `/api/admin` → adminRoutes

3. **Controller Methods**: Controllers use arrow function syntax (`public method = async (req, res) => {}`) which properly binds the `this` context

4. **Server Startup**: The terminal output shows the server starts successfully without errors, and nodemon is watching for changes

### Identified Root Cause

The most likely root cause is **TypeScript compilation issues**. The symptoms indicate:

- **Hypothesis 1 (Most Likely)**: The TypeScript files are not being compiled to JavaScript, or the compiled output is outdated. The `nodemon` configuration may be running TypeScript files directly using `ts-node`, but if there's a compilation error or misconfiguration, the routes might not be properly loaded at runtime.

- **Hypothesis 2**: The `dist/` directory (compiled output) doesn't exist or contains outdated code, and the server is trying to run from an incorrect location.

- **Hypothesis 3**: There's a silent import error in one of the route files that causes the router to be `undefined` when imported in `server.ts`, but doesn't throw an error during startup.

### Evidence Supporting Root Cause

1. The `package.json` shows:
   - `"start": "node dist/app.js"` (expects compiled JS in dist/)
   - `"dev": "nodemon"` (uses nodemon config)
   - `"build": "prisma generate && tsc"` (TypeScript compilation)

2. The `nodemon.json` configuration was not examined, but it likely uses `ts-node` or `tsx` to run TypeScript directly

3. No `dist/` directory was visible in the file tree, suggesting compilation may not have been run

4. The server starts without throwing import errors, but routes return 404, indicating the Express app is running but routes are not registered

## Bug Condition C(X)

### Formal Definition

Let `X` be the state of the Express application at runtime.

**Bug Condition C(X)** is TRUE when:

```
C(X) = (ServerRunning(X) = true) ∧
       (RoutesMounted(X) = false ∨ RouteHandlersUndefined(X) = true) ∧
       (RequestToValidEndpoint(X) → Response404(X))
```

Where:

- `ServerRunning(X)`: The Express server is listening on port 3000
- `RoutesMounted(X)`: Routes are successfully registered with `app.use()`
- `RouteHandlersUndefined(X)`: Imported route modules are `undefined` or invalid
- `RequestToValidEndpoint(X)`: A request is made to a defined API endpoint
- `Response404(X)`: The server returns HTTP 404 Not Found

### Bug Condition in Plain Language

The bug occurs when:

1. The Express server starts successfully and listens on port 3000
2. Route imports in `server.ts` resolve to `undefined` or invalid Router instances due to compilation/runtime issues
3. Any request to API endpoints (e.g., `/api/auth/login`) returns 404 because no routes are actually registered

## Fix Strategy

### Fix Approach

The fix will address the root cause through a systematic verification and correction process:

1. **Verify TypeScript Compilation**
   - Check if `dist/` directory exists and contains compiled JavaScript
   - Run `npm run build` to ensure clean compilation
   - Verify no TypeScript compilation errors

2. **Verify Nodemon Configuration**
   - Check `nodemon.json` to ensure it's configured correctly for TypeScript
   - Ensure it uses `ts-node` or `tsx` with proper settings
   - Verify it's watching the correct files and restarting properly

3. **Add Runtime Diagnostics**
   - Add console.log statements in `server.ts` to verify route imports are not `undefined`
   - Log the router objects before mounting them
   - Add a catch-all 404 handler to confirm the issue

4. **Verify Route Registration**
   - Ensure routes are mounted after middleware setup
   - Verify the order of middleware and route mounting
   - Check for any middleware that might be intercepting requests

### Implementation Plan

#### Phase 1: Diagnostic Verification (Investigation)

**Task 1.1**: Check nodemon configuration

- Read `nodemon.json` to verify TypeScript execution setup
- Ensure `exec` command uses `ts-node` or `tsx`
- Verify watch paths and file extensions

**Task 1.2**: Add runtime logging to server.ts

- Log imported route objects to verify they're not `undefined`
- Add logging before and after `app.use()` calls
- Add a catch-all 404 handler at the end to confirm routing issue

**Task 1.3**: Verify TypeScript compilation

- Run `npm run build` and check for errors
- Verify `dist/` directory is created with compiled files
- Check if compiled JavaScript matches source TypeScript

#### Phase 2: Fix Implementation

**Task 2.1**: Fix compilation issues (if found)

- Resolve any TypeScript compilation errors
- Ensure `tsconfig.json` is configured correctly
- Regenerate Prisma client if needed

**Task 2.2**: Fix nodemon configuration (if needed)

- Update `nodemon.json` to use correct TypeScript runner
- Ensure proper file watching and restart behavior
- Add `--files` flag if using `ts-node` to include all TypeScript files

**Task 2.3**: Fix route imports (if needed)

- If route imports are `undefined`, check for circular dependencies
- Verify all route files export default correctly
- Ensure no runtime errors in route file initialization

#### Phase 3: Verification

**Task 3.1**: Test API endpoints

- Restart the development server
- Test each API endpoint in Postman
- Verify correct responses (not 404)

**Task 3.2**: Remove diagnostic logging

- Clean up temporary console.log statements
- Keep only essential logging

**Task 3.3**: Document the fix

- Document what was wrong and how it was fixed
- Add comments if configuration was unclear

### Preservation of Correct Behavior

The fix will preserve all existing correct behaviors:

1. **Server Startup**: The server will continue to start on port 3000 with startup messages
2. **Middleware**: CORS, JSON parsing, and error handling middleware will continue to work
3. **Health Check**: The `/` endpoint will continue to return status information
4. **Authentication**: JWT authentication will continue to work once routes are fixed
5. **Database**: Prisma client connections will remain unchanged
6. **Swagger Documentation**: API documentation at `/api-docs` will continue to work

### Testing Strategy

#### Bug Condition Exploration Test (Property-Based Test)

**Test Purpose**: Verify that the bug condition C(X) exists before the fix

**Test Implementation**:

```typescript
// Test: Bug condition exploration
// Expected: This test SHOULD FAIL before the fix (confirming bug exists)
// Expected: This test SHOULD PASS after the fix (confirming bug is resolved)

describe("Bug Condition C(X) - API 404 Error", () => {
  it("should return 404 for valid API endpoints (bug condition)", async () => {
    // Given: Server is running
    const serverRunning = await checkServerHealth("http://localhost:3000");
    expect(serverRunning).toBe(true);

    // When: Request is made to valid API endpoint
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nationalId: "1234567890123",
        laserCode: "TEST123",
      }),
    });

    // Then: Bug condition C(X) is TRUE (returns 404)
    // Before fix: This assertion PASSES (bug exists)
    // After fix: This assertion FAILS (bug is fixed)
    expect(response.status).toBe(404);
  });
});
```

#### Fix Verification Test

**Test Purpose**: Verify that routes are properly registered and respond correctly

**Test Implementation**:

```typescript
// Test: Fix verification
// Expected: This test SHOULD FAIL before the fix
// Expected: This test SHOULD PASS after the fix

describe("Fix Verification - Routes Properly Registered", () => {
  it("should return appropriate response (not 404) for auth endpoints", async () => {
    // Test login endpoint
    const loginResponse = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nationalId: "1234567890123",
        laserCode: "INVALID",
      }),
    });

    // Should return 400 (bad request) or 401 (unauthorized), NOT 404
    expect(loginResponse.status).not.toBe(404);
    expect([400, 401]).toContain(loginResponse.status);
  });

  it("should return appropriate response for vote endpoints", async () => {
    // Test ballot endpoint (requires auth)
    const ballotResponse = await fetch(
      "http://localhost:3000/api/votes/ballot",
      {
        method: "GET",
      },
    );

    // Should return 401 (unauthorized), NOT 404
    expect(ballotResponse.status).not.toBe(404);
    expect(ballotResponse.status).toBe(401);
  });

  it("should return appropriate response for election endpoints", async () => {
    // Test public constituencies endpoint
    const constituenciesResponse = await fetch(
      "http://localhost:3000/api/election/constituencies",
      {
        method: "GET",
      },
    );

    // Should return 200 (success), NOT 404
    expect(constituenciesResponse.status).not.toBe(404);
    expect(constituenciesResponse.status).toBe(200);
  });
});
```

#### Regression Prevention Tests

**Test Purpose**: Ensure existing functionality continues to work

**Test Implementation**:

```typescript
describe("Regression Prevention", () => {
  it("should continue to serve health check endpoint", async () => {
    const response = await fetch("http://localhost:3000/");
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("OK");
    expect(data.message).toContain("Election System API");
  });

  it("should continue to serve Swagger documentation", async () => {
    const response = await fetch("http://localhost:3000/api-docs/");
    expect(response.status).toBe(200);
  });

  it("should continue to apply CORS middleware", async () => {
    const response = await fetch("http://localhost:3000/", {
      headers: { Origin: "http://example.com" },
    });
    expect(response.headers.get("access-control-allow-origin")).toBeTruthy();
  });
});
```

### Manual Testing Checklist

After implementing the fix, perform these manual tests:

1. ✅ Start the development server with `npm run dev`
2. ✅ Verify server starts without errors
3. ✅ Test health check: `GET http://localhost:3000/`
4. ✅ Test auth endpoints:
   - `POST http://localhost:3000/api/auth/register` (should return 400 or 201, not 404)
   - `POST http://localhost:3000/api/auth/login` (should return 400 or 200, not 404)
5. ✅ Test vote endpoints:
   - `GET http://localhost:3000/api/votes/ballot` (should return 401, not 404)
6. ✅ Test election endpoints:
   - `GET http://localhost:3000/api/election/constituencies` (should return 200, not 404)
7. ✅ Test admin endpoints:
   - `GET http://localhost:3000/api/admin/users` (should return 401, not 404)

## Additional Considerations

### Supabase RLS Warnings

The Security Advisor screenshot shows RLS (Row Level Security) is disabled on all tables. While this is a separate security issue, it should be addressed after fixing the routing issue:

**Security Risk**: Without RLS, any database query can access all rows regardless of user permissions. This is a critical security vulnerability for a voting system.

**Recommendation**: After fixing the 404 issue, create a separate spec to implement RLS policies for:

- User table: Users can only read/update their own data
- Vote table: Users can only create/read their own votes
- Candidate table: Public read, EC write
- Party table: Public read, EC write
- Constituency table: Public read, Admin write

### Environment Variables

Verify all required environment variables are set in `.env`:

- `DATABASE_URL`: ✅ Present
- `DIRECT_URL`: ✅ Present
- `JWT_SECRET`: ✅ Present
- `PORT`: ✅ Present (3000)
- `NODE_ENV`: ✅ Present (development)
- Supabase credentials: ✅ Present

## Summary

The API 404 issue is most likely caused by TypeScript compilation or runtime loading problems that prevent routes from being properly registered with the Express application. The fix strategy focuses on:

1. Diagnosing the exact cause through runtime logging and compilation verification
2. Fixing the identified issue (compilation, nodemon config, or import problems)
3. Verifying the fix through comprehensive testing
4. Ensuring no regression in existing functionality

The bug condition C(X) formally defines when the bug occurs, and property-based tests will verify both the existence of the bug before the fix and its resolution after the fix.
