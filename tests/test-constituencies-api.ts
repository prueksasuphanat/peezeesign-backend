// Test script for getAllConstituencies API
import { prisma } from "../src/lib/prisma";
import {
  findAllWithExtendedCounts,
  findByProvinceWithExtendedCounts,
} from "../src/repositories/constituency.repository";

async function testConstituenciesAPI() {
  console.log("🧪 Testing getAllConstituencies with extended counts...\n");

  try {
    // Test 1: Get all constituencies
    console.log("Test 1: Get all constituencies");
    const allConstituencies = await findAllWithExtendedCounts();

    console.log(`Found ${allConstituencies.length} constituencies\n`);

    // Transform and display sample data
    const transformed = allConstituencies.map((constituency) => {
      const { candidates, ...rest } = constituency;
      return {
        ...rest,
        _count: {
          ...rest._count,
          eligibleVoters: rest._count.users,
          parties: candidates.length,
        },
      };
    });

    console.log("Sample response (first 2 constituencies):");
    console.log(JSON.stringify(transformed.slice(0, 2), null, 2));

    // Test 2: Get constituencies by province
    console.log("\n\nTest 2: Get constituencies by province (กรุงเทพมหานคร)");
    const bkkConstituencies =
      await findByProvinceWithExtendedCounts("กรุงเทพมหานคร");

    const transformedBkk = bkkConstituencies.map((constituency) => {
      const { candidates, ...rest } = constituency;
      return {
        ...rest,
        _count: {
          ...rest._count,
          eligibleVoters: rest._count.users,
          parties: candidates.length,
        },
      };
    });

    console.log(
      `Found ${transformedBkk.length} constituencies in กรุงเทพมหานคร`,
    );
    console.log(JSON.stringify(transformedBkk, null, 2));

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConstituenciesAPI();
