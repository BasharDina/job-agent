import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const origin = new URL(req.url).origin;

    const syncRes = await fetch(`${origin}/api/sync/jobs`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const syncText = await syncRes.text();
    let syncData: any = null;

    try {
      syncData = JSON.parse(syncText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          step: "sync",
          message: "Sync returned non-JSON response",
          raw: syncText.slice(0, 500),
        },
        { status: 500 }
      );
    }

    if (!syncRes.ok) {
      return NextResponse.json(
        {
          success: false,
          step: "sync",
          message: syncData?.message || "Sync step failed",
          sync: syncData,
        },
        { status: 500 }
      );
    }

    const agentRes = await fetch(`${origin}/api/agent/run`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const agentText = await agentRes.text();
    let agentData: any = null;

    try {
      agentData = JSON.parse(agentText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          step: "agent",
          message: "Agent returned non-JSON response",
          raw: agentText.slice(0, 500),
          sync: syncData,
        },
        { status: 500 }
      );
    }

    if (!agentRes.ok) {
      return NextResponse.json(
        {
          success: false,
          step: "agent",
          message: agentData?.message || "Agent step failed",
          sync: syncData,
          agent: agentData,
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
        message:
          error instanceof Error ? error.message : "Failed to run full cycle",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}