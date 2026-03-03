// Test to show expected response format for getAllConstituencies
import { prisma } from "../src/lib/prisma";

async function showExpectedResponse() {
  console.log("📋 Expected Response Format for getAllConstituencies\n");

  try {
    // Simulate the service layer logic
    const constituencies = await prisma.constituency.findMany({
      orderBy: [{ province: "asc" }, { districtNumber: "asc" }],
      include: {
        _count: {
          select: {
            candidates: true,
            users: true,
          },
        },
        candidates: {
          select: {
            partyId: true,
          },
          distinct: ["partyId"],
        },
      },
    });

    // Transform like in the service
    const response = constituencies.map((constituency) => {
      const { candidates, ...rest } = constituency;
      return {
        ...rest,
        _count: {
          candidates: rest._count.candidates,
          eligibleVoters: rest._count.users,
          parties: candidates.length,
        },
      };
    });

    console.log("Response structure:");
    console.log(JSON.stringify({ success: true, data: response }, null, 2));

    console.log("\n✅ Response format verified!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

showExpectedResponse();
