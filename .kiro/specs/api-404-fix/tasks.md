# Implementation Tasks

## Phase 1: Diagnostic Verification & Bug Condition Exploration

### Task 1: Write bug condition exploration property test

**Purpose**: Create a test that confirms the bug exists (test should FAIL on unfixed code, proving bug condition C(X) is TRUE)

**Acceptance Criteria**:

- [ ] 1.1 Create test file `tests/bug-exploration.test.ts` (or similar location)
- [ ] 1.2 Implement test that verifies server is running on port 3000
- [ ] 1.3 Implement test that makes requests to valid API endpoints (`/api/auth/login`, `/api/votes/ballot`, `/api/election/constituencies`)
- [ ] 1.4 Test asserts that responses return 404 status (confirming bug exists)
- [ ] 1.5 Run the test and verify it PASSES (meaning bug is confirmed)
- [ ] 1.6 Document the test output showing the bug condition is TRUE

**Expected Outcome**: Test passes on unfixed code, confirming that valid API endpoints return 404 errors

---

### Task 2: Investigate nodemon configuration

**Purpose**: Verify nodemon is configured correctly to run TypeScript files

**Acceptance Criteria**:

- [ ] 2.1 Read and examine `nodemon.json` configuration file
- [ ] 2.2 Verify the `exec` command uses `ts-node`, `tsx`, or similar TypeScript runner
- [ ] 2.3 Verify watch paths include `src/**/*.ts` or similar patterns
- [ ] 2.4 Verify file extensions include `.ts` files
- [ ] 2.5 Check for any configuration issues that might prevent proper TypeScript execution
- [ ] 2.6 Document findings in a comment or log

**Expected Outcome**: Understanding of how nodemon is configured and whether it's correctly set up for TypeScript

---

### Task 3: Add diagnostic logging to server.ts

**Purpose**: Add temporary logging to identify if route imports are undefined or invalid

**Acceptance Criteria**:

- [ ] 3.1 Add console.log to verify each route import is not `undefined` (log `voteRoutes`, `authRoutes`, `electionRoutes`, `adminRoutes`)
- [ ] 3.2 Add console.log before each `app.use()` call to show routes are being mounted
- [ ] 3.3 Add console.log after each `app.use()` call to confirm mounting completed
- [ ] 3.4 Add a catch-all 404 handler at the end of route definitions: `app.use((req, res) => { console.log('404:', req.method, req.path); res.status(404).json({ error: 'Not Found' }); })`
- [ ] 3.5 Restart the server and observe the console output
- [ ] 3.6 Make a test request to an API endpoint and observe which logs appear

**Expected Outcome**: Clear visibility into whether routes are being imported and mounted correctly

---

### Task 4: Verify TypeScript compilation

**Purpose**: Ensure TypeScript can compile without errors and check if dist/ directory exists

**Acceptance Criteria**:

- [ ] 4.1 Run `npm run build` command
- [ ] 4.2 Check for any TypeScript compilation errors in the output
- [ ] 4.3 Verify `dist/` directory is created
- [ ] 4.4 Verify `dist/server.js` (or `dist/app.js`) exists
- [ ] 4.5 Spot-check that compiled JavaScript files match TypeScript source structure
- [ ] 4.6 If compilation fails, document the specific errors

**Expected Outcome**: Confirmation that TypeScript compiles successfully or identification of compilation errors

---

## Phase 2: Root Cause Fix Implementation

### Task 5: Fix identified root cause

**Purpose**: Implement the fix based on diagnostic findings from Phase 1

**Acceptance Criteria**:

- [ ] 5.1 Based on diagnostic results, implement the appropriate fix:
  - [ ] 5.1a IF nodemon config is wrong: Update `nodemon.json` to use correct TypeScript runner (ts-node or tsx) with proper flags
  - [ ] 5.1b IF compilation errors exist: Fix TypeScript compilation errors in source files
  - [ ] 5.1c IF route imports are undefined: Fix import statements or circular dependencies in route files
  - [ ] 5.1d IF tsconfig is misconfigured: Update `tsconfig.json` with correct settings (module, target, outDir, etc.)
  - [ ] 5.1e IF Prisma client is outdated: Run `npx prisma generate` to regenerate Prisma client
- [ ] 5.2 Document what was wrong and what was changed
- [ ] 5.3 Restart the development server with `npm run dev`
- [ ] 5.4 Verify server starts without errors
- [ ] 5.5 Verify diagnostic logs show routes are properly imported and mounted

**Expected Outcome**: The root cause is fixed and routes are properly registered with Express

---

## Phase 3: Fix Verification & Testing

### Task 6: Verify bug condition exploration test now fails

**Purpose**: Confirm the bug is fixed by running the exploration test (should now FAIL, meaning bug no longer exists)

**Acceptance Criteria**:

- [ ] 6.1 Run the bug condition exploration test from Task 1
- [ ] 6.2 Verify the test now FAILS (because endpoints no longer return 404)
- [ ] 6.3 Update test expectations to verify correct behavior (endpoints return appropriate status codes, not 404)
- [ ] 6.4 Run updated test and verify it PASSES
- [ ] 6.5 Document the test output showing bug condition C(X) is now FALSE

**Expected Outcome**: Exploration test confirms the bug is fixed

---

### Task 7: Implement fix verification tests

**Purpose**: Create comprehensive tests to verify routes are working correctly

**Acceptance Criteria**:

- [ ] 7.1 Create test file `tests/fix-verification.test.ts` (or add to existing test file)
- [ ] 7.2 Implement test for auth endpoints (login should return 400/401, not 404)
- [ ] 7.3 Implement test for vote endpoints (ballot should return 401, not 404)
- [ ] 7.4 Implement test for election endpoints (constituencies should return 200, not 404)
- [ ] 7.5 Implement test for admin endpoints (users should return 401, not 404)
- [ ] 7.6 Run all tests and verify they PASS
- [ ] 7.7 Document test results

**Expected Outcome**: All fix verification tests pass, confirming routes are properly registered

---

### Task 8: Implement regression prevention tests

**Purpose**: Ensure existing functionality continues to work after the fix

**Acceptance Criteria**:

- [ ] 8.1 Create test for health check endpoint (`GET /`) - should return 200 with status message
- [ ] 8.2 Create test for Swagger documentation endpoint (`GET /api-docs/`) - should return 200
- [ ] 8.3 Create test for CORS middleware - should include CORS headers in responses
- [ ] 8.4 Create test for JSON parsing middleware - should accept JSON request bodies
- [ ] 8.5 Run all regression tests and verify they PASS
- [ ] 8.6 Document test results

**Expected Outcome**: All regression tests pass, confirming no existing functionality was broken

---

### Task 9: Manual testing with Postman

**Purpose**: Perform manual end-to-end testing of all API endpoints

**Acceptance Criteria**:

- [ ] 9.1 Test health check: `GET http://localhost:3000/` - should return 200 with status message
- [ ] 9.2 Test auth register: `POST http://localhost:3000/api/auth/register` with valid data - should return 201 or 400, not 404
- [ ] 9.3 Test auth login: `POST http://localhost:3000/api/auth/login` with credentials - should return 200 or 400, not 404
- [ ] 9.4 Test vote ballot: `GET http://localhost:3000/api/votes/ballot` without auth - should return 401, not 404
- [ ] 9.5 Test election constituencies: `GET http://localhost:3000/api/election/constituencies` - should return 200, not 404
- [ ] 9.6 Test admin users: `GET http://localhost:3000/api/admin/users` without auth - should return 401, not 404
- [ ] 9.7 Test Swagger docs: `GET http://localhost:3000/api-docs/` - should return 200 with Swagger UI
- [ ] 9.8 Document all test results with screenshots or response logs

**Expected Outcome**: All API endpoints respond with appropriate status codes (not 404)

---

## Phase 4: Cleanup & Documentation

### Task 10: Remove diagnostic logging

**Purpose**: Clean up temporary logging added during investigation

**Acceptance Criteria**:

- [ ] 10.1 Remove temporary console.log statements added in Task 3 from `server.ts`
- [ ] 10.2 Keep only essential logging (server startup messages, error logging)
- [ ] 10.3 Remove the catch-all 404 handler if it was only for diagnostics
- [ ] 10.4 Verify server still works correctly after cleanup
- [ ] 10.5 Commit the cleaned-up code

**Expected Outcome**: Code is clean and production-ready without diagnostic clutter

---

### Task 11: Document the fix

**Purpose**: Create clear documentation of what was wrong and how it was fixed

**Acceptance Criteria**:

- [ ] 11.1 Create or update a `BUGFIX_NOTES.md` file (or add to existing documentation)
- [ ] 11.2 Document the root cause that was identified
- [ ] 11.3 Document the specific changes made to fix the issue
- [ ] 11.4 Document any configuration changes (nodemon.json, tsconfig.json, etc.)
- [ ] 11.5 Add comments in code if the fix required non-obvious changes
- [ ] 11.6 Update README.md if setup instructions need clarification

**Expected Outcome**: Clear documentation for future reference and team members

---

## Summary

**Total Tasks**: 11 tasks across 4 phases

**Estimated Effort**:

- Phase 1 (Diagnostic): 4 tasks - Investigation and bug confirmation
- Phase 2 (Fix): 1 task - Root cause fix implementation
- Phase 3 (Verification): 4 tasks - Comprehensive testing
- Phase 4 (Cleanup): 2 tasks - Code cleanup and documentation

**Success Criteria**:

1. Bug condition exploration test confirms bug exists before fix
2. Root cause is identified and fixed
3. All API endpoints return appropriate status codes (not 404)
4. All tests pass (exploration, verification, regression)
5. Manual testing confirms all endpoints work in Postman
6. Code is clean and well-documented

**Note**: The actual fix in Task 5 will depend on the findings from Tasks 2-4. The most likely scenarios are:

- Nodemon configuration needs updating
- TypeScript compilation issues need resolving
- Route imports have circular dependencies or errors
- Prisma client needs regeneration
