import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const communications = await prisma.communication.findMany({
      include: {
        application: {
          include: {
            job: true,
          },
        },
      },
      orderBy: {
        receivedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: communications.length,
      communications,
    });
  } catch (error) {
    console.error("GET /api/communications error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load communications" },
      { status: 500 }
    );
  }
}