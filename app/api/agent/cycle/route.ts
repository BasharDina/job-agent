import { NextResponse } from "next/server";

export async function POST() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const syncRes = await fetch(`${baseUrl}/api/sync/jobs`, {
      method: "POST",
      cache: "no-store",
    });

    const syncData = await syncRes.json();

    if (!syncRes.ok) {
      return NextResponse.json(
        {
          success: false,
          step: "sync",
          message: syncData?.message || "Sync step failed",
        },
        { status: 500 }
      );
    }

    const agentRes = await fetch(`${baseUrl}/api/agent/run`, {
      method: "POST",
      cache: "no-store",
    });

    const agentData = await agentRes.json();

    if (!agentRes.ok) {
      return NextResponse.json(
        {
          success: false,
          step: "agent",
          message: agentData?.message || "Agent step failed",
          sync: syncData,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Full cycle completed successfully.",
      sync: syncData,
      agent: agentData,
    });
  } catch (error) {
    console.error("POST /api/agent/cycle error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to run full cycle",
      },
      { status: 500 }
    );
  }
}