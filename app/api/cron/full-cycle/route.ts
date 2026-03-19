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

async function runCycle(origin: string) {
  const res = await fetch(`${origin}/api/agent/cycle`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const rawText = await res.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON from /api/agent/cycle but got ${contentType || "unknown content-type"}`
    );
  }

  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error("Failed to parse JSON returned from /api/agent/cycle");
  }

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

    const origin = new URL(req.url).origin;
    const data = await runCycle(origin);

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

    const origin = new URL(req.url).origin;
    const data = await runCycle(origin);

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