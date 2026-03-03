/**
 * Fix Verification Test
 *
 * Purpose: Verify that the API routes are now properly accessible
 * Expected: This test should PASS after the fix (API working on port 3001)
 */

async function testFixVerification() {
  console.log("=== Fix Verification Test ===\n");

  const API_PORT = 3001;
  const BASE_URL = `http://localhost:${API_PORT}`;

  // Test endpoints
  const tests = [
    {
      name: "Health Check",
      url: `${BASE_URL}/`,
      method: "GET",
      expectedStatus: 200,
      expectedContentType: "application/json",
    },
    {
      name: "Auth Login (Invalid Credentials)",
      url: `${BASE_URL}/api/auth/login`,
      method: "POST",
      body: { nationalId: "1234567890123", laserCode: "INVALID" },
      expectedStatus: 400,
      expectedContentType: "application/json",
    },
    {
      name: "Vote Ballot (No Auth)",
      url: `${BASE_URL}/api/votes/ballot`,
      method: "GET",
      expectedStatus: 401,
      expectedContentType: "application/json",
    },
    {
      name: "Election Constituencies",
      url: `${BASE_URL}/api/election/constituencies`,
      method: "GET",
      expectedStatus: 200,
      expectedContentType: "application/json",
    },
    {
      name: "Admin Users (No Auth)",
      url: `${BASE_URL}/api/admin/users`,
      method: "GET",
      expectedStatus: 401,
      expectedContentType: "application/json",
    },
  ];

  let allPassed = true;
  const results: string[] = [];

  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    console.log(`  ${test.method} ${test.url}`);

    try {
      const options: RequestInit = {
        method: test.method,
        headers: { "Content-Type": "application/json" },
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(test.url, options);
      const contentType = response.headers.get("content-type") || "";

      // Check status code
      const statusMatch = response.status === test.expectedStatus;
      const contentTypeMatch = contentType.includes(test.expectedContentType);

      if (statusMatch && contentTypeMatch) {
        console.log(
          `  ✅ PASS: Status ${response.status}, Content-Type: ${contentType}`,
        );
        results.push(`${test.name}: PASS`);
      } else {
        console.log(
          `  ❌ FAIL: Expected ${test.expectedStatus} ${test.expectedContentType}, got ${response.status} ${contentType}`,
        );
        results.push(`${test.name}: FAIL`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`  ❌ ERROR: ${error}`);
      results.push(`${test.name}: ERROR`);
      allPassed = false;
    }
    console.log("");
  }

  // Summary
  console.log("=== Test Results Summary ===");
  results.forEach((result) => console.log(`  - ${result}`));
  console.log("\n=== Test Conclusion ===");

  if (allPassed) {
    console.log("✅ ALL TESTS PASSED");
    console.log("The API is now properly accessible on port 3001.");
    console.log(
      "All endpoints return correct JSON responses with appropriate status codes.",
    );
    process.exit(0);
  } else {
    console.log("❌ SOME TESTS FAILED");
    console.log("The fix may not be complete or there are other issues.");
    process.exit(1);
  }
}

// Run the test
testFixVerification();
