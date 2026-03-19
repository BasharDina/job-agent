import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        source: true,
        score: true,
      },
      orderBy: {
        discoveredAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("GET /api/jobs error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load jobs" },
      { status: 500 }
    );
  }
}