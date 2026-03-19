import { NextResponse } from "next/server";

function isAuthorized(req: Request) {
  const url = new URL(req.url);
  const secretFromQuery = url.searchParams.get("secret");
  const authHeader = req.headers.get("authorization");

  const expected = process.env.CRON_SECRET;

  if (!expected) return false;

  if (secretFromQuery && secretFromQuery === expected) {
    return true;
  }

  if (authHeader === `Bearer ${expected}`) {
    return true;
  }

  return false;
}

async function runCycle() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/agent/cycle`, {
    method: "POST",
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Cycle failed");
  }

  return data;
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await runCycle();

    return NextResponse.json({
      success: true,
      message: "Scheduled full cycle completed.",
      result: data,
    });
  } catch (error) {
    console.error("GET /api/cron/full-cycle error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Scheduled cycle failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await runCycle();

    return NextResponse.json({
      success: true,
      message: "Scheduled full cycle completed.",
      result: data,
    });
  } catch (error) {
    console.error("POST /api/cron/full-cycle error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Scheduled cycle failed",
      },
      { status: 500 }
    );
  }
}