import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      include: {
        job: true,
      },
      orderBy: {
        lastUpdateAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("GET /api/applications error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load applications" },
      { status: 500 }
    );
  }
}