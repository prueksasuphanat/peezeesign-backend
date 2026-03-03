/**
 * Bug Condition Exploration Test
 *
 * Purpose: Confirm that the bug exists - API routes are not properly registered
 * Bug Symptoms:
 * - Auth routes return 404 (not found)
 * - Other routes return HTML from frontend instead of JSON API responses
 *
 * Expected: This test should PASS before the fix (confirming bug exists)
 * Expected: This test should FAIL after the fix (confirming bug is resolved)
 */

async function checkServerHealth(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function testBugCondition() {
  console.log("=== Bug Condition Exploration Test ===\n");

  // Test 1.2: Verify server is running on port 3000
  console.log("Test 1.2: Verifying server is running on port 3000...");
  const serverRunning = await checkServerHealth("http://localhost:3000");

  if (!serverRunning) {
    console.error("❌ FAIL: Server is not running on port 3000");
    process.exit(1);
  }
  console.log("✅ PASS: Server is running\n");

  // Test 1.3 & 1.4: Make requests to valid API endpoints
  // Bug condition: Routes either return 404 or HTML (wrong server) instead of JSON API responses
  const endpoints = [
    {
      name: "Auth Login",
      url: "http://localhost:3000/api/auth/login",
      method: "POST",
      body: { nationalId: "1234567890123", laserCode: "TEST123" },
    },
    {
      name: "Auth Register",
      url: "http://localhost:3000/api/auth/register",
      method: "POST",
      body: {
        nationalId: "1234567890123",
        laserCode: "TEST123",
        firstName: "Test",
        lastName: "User",
        province: "Bangkok",
        districtNumber: 1,
      },
    },
    {
      name: "Vote Ballot",
      url: "http://localhost:3000/api/votes/ballot",
      method: "GET",
    },
    {
      name: "Election Constituencies",
      url: "http://localhost:3000/api/election/constituencies",
      method: "GET",
    },
  ];

  let bugConfirmed = true;
  const results: string[] = [];

  for (const endpoint of endpoints) {
    console.log(
      `Test 1.3-1.4: Testing ${endpoint.name} (${endpoint.method} ${endpoint.url})...`,
    );

    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
      };

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(endpoint.url, options);
      const contentType = response.headers.get("content-type") || "";

      // Bug exists if:
      // 1. Endpoint returns 404 (route not found)
      // 2. Endpoint returns HTML instead of JSON (wrong server responding)

      if (response.status === 404) {
        console.log(
          `✅ PASS: ${endpoint.name} returns 404 (bug confirmed - route not registered)`,
        );
        results.push(`${endpoint.name}: 404 (route not found)`);
      } else if (contentType.includes("text/html")) {
        console.log(
          `✅ PASS: ${endpoint.name} returns HTML (bug confirmed - wrong server responding)`,
        );
        results.push(
          `${endpoint.name}: HTML response (frontend server intercepting)`,
        );
      } else if (contentType.includes("application/json")) {
        console.log(
          `❌ FAIL: ${endpoint.name} returns ${response.status} with JSON (bug NOT confirmed - API working)`,
        );
        results.push(
          `${endpoint.name}: ${response.status} JSON (API working correctly)`,
        );
        bugConfirmed = false;
      } else {
        console.log(
          `⚠️  WARN: ${endpoint.name} returns ${response.status} with ${contentType} (unexpected)`,
        );
        results.push(
          `${endpoint.name}: ${response.status} ${contentType} (unexpected)`,
        );
      }
    } catch (error) {
      console.error(`❌ ERROR: ${endpoint.name} - ${error}`);
      bugConfirmed = false;
    }
    console.log("");
  }

  // Test 1.5 & 1.6: Document results
  console.log("=== Test Results Summary ===");
  console.log(
    "Bug Condition C(X) Status:",
    bugConfirmed ? "TRUE (bug exists)" : "FALSE (bug does not exist)",
  );
  console.log("\nEndpoint Results:");
  results.forEach((result) => console.log(`  - ${result}`));
  console.log("\n=== Test Conclusion ===");

  if (bugConfirmed) {
    console.log("✅ TEST PASSED: Bug condition C(X) is TRUE");
    console.log("API routes are not properly registered:");
    console.log("- Auth routes return 404 (not found)");
    console.log("- Other routes return HTML from frontend server");
    console.log(
      "\nRoot Cause: Express API server is not running or routes are not mounted correctly.",
    );
    console.log(
      "A frontend dev server (Vite) is running on port 3000 instead of the Express API.",
    );
    process.exit(0);
  } else {
    console.log("❌ TEST FAILED: Bug condition C(X) is FALSE");
    console.log(
      "Some endpoints return correct JSON API responses, bug may already be fixed.",
    );
    process.exit(1);
  }
}

// Run the test
testBugCondition();
