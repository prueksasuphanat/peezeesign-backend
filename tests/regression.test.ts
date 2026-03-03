/**
 * Regression Prevention Test
 *
 * Purpose: Ensure existing functionality continues to work after the fix
 * Tests: Health check, Swagger docs, CORS, JSON parsing
 */

async function testRegression() {
  console.log("=== Regression Prevention Test ===\n");

  const API_PORT = 3001;
  const BASE_URL = `http://localhost:${API_PORT}`;

  let allPassed = true;
  const results: string[] = [];

  // Test 1: Health Check Endpoint
  console.log("Test 1: Health Check Endpoint");
  try {
    const response = await fetch(`${BASE_URL}/`);
    const data = await response.json();

    if (response.status === 200 && data.status === "OK") {
      console.log("  ✅ PASS: Health check returns 200 with status OK");
      results.push("Health Check: PASS");
    } else {
      console.log(
        `  ❌ FAIL: Expected 200 with status OK, got ${response.status}`,
      );
      results.push("Health Check: FAIL");
      allPassed = false;
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error}`);
    results.push("Health Check: ERROR");
    allPassed = false;
  }
  console.log("");

  // Test 2: Swagger Documentation
  console.log("Test 2: Swagger Documentation Endpoint");
  try {
    const response = await fetch(`${BASE_URL}/api-docs/`);

    if (response.status === 200) {
      console.log("  ✅ PASS: Swagger docs accessible");
      results.push("Swagger Docs: PASS");
    } else {
      console.log(`  ❌ FAIL: Expected 200, got ${response.status}`);
      results.push("Swagger Docs: FAIL");
      allPassed = false;
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error}`);
    results.push("Swagger Docs: ERROR");
    allPassed = false;
  }
  console.log("");

  // Test 3: CORS Middleware
  console.log("Test 3: CORS Middleware");
  try {
    const response = await fetch(`${BASE_URL}/`, {
      headers: { Origin: "http://example.com" },
    });

    const corsHeader = response.headers.get("access-control-allow-origin");

    if (corsHeader) {
      console.log(`  ✅ PASS: CORS headers present (${corsHeader})`);
      results.push("CORS Middleware: PASS");
    } else {
      console.log("  ❌ FAIL: CORS headers missing");
      results.push("CORS Middleware: FAIL");
      allPassed = false;
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error}`);
    results.push("CORS Middleware: ERROR");
    allPassed = false;
  }
  console.log("");

  // Test 4: JSON Parsing Middleware
  console.log("Test 4: JSON Parsing Middleware");
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nationalId: "1234567890123",
        laserCode: "TEST",
      }),
    });

    const data = await response.json();

    if (data && typeof data === "object") {
      console.log("  ✅ PASS: JSON request body parsed correctly");
      results.push("JSON Parsing: PASS");
    } else {
      console.log("  ❌ FAIL: JSON parsing failed");
      results.push("JSON Parsing: FAIL");
      allPassed = false;
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error}`);
    results.push("JSON Parsing: ERROR");
    allPassed = false;
  }
  console.log("");

  // Summary
  console.log("=== Test Results Summary ===");
  results.forEach((result) => console.log(`  - ${result}`));
  console.log("\n=== Test Conclusion ===");

  if (allPassed) {
    console.log("✅ ALL REGRESSION TESTS PASSED");
    console.log(
      "Existing functionality continues to work correctly after the fix.",
    );
    process.exit(0);
  } else {
    console.log("❌ SOME REGRESSION TESTS FAILED");
    console.log("The fix may have broken existing functionality.");
    process.exit(1);
  }
}

// Run the test
testRegression();
