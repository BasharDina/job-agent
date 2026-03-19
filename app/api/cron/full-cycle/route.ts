import { NextResponse } from "next/server";

function getAuthDebug(req: Request) {
  const url = new URL(req.url);

  const secretFromQueryRaw = url.searchParams.get("secret") || "";
  const authHeaderRaw = req.headers.get("authorization") || "";
  const expectedRaw = process.env.CRON_SECRET || "";

  const secretFromQuery = secretFromQueryRaw.trim();
  const authHeader = authHeaderRaw.trim();
  const expected = expectedRaw.trim();

  const queryAuthorized = !!secretFromQuery && secretFromQuery === expected;
  const headerAuthorized = authHeader === `Bearer ${expected}`;

  return {
    queryAuthorized,
    headerAuthorized,
    hasExpected: !!expected,
    expectedLength: expected.length,
    queryLength: secretFromQuery.length,
    authHeaderLength: authHeader.length,
    queryPreview: secretFromQuery ? `${secretFromQuery.slice(0, 4)}***` : "",
    expectedPreview: expected ? `${expected.slice(0, 4)}***` : "",
  };
}

function isAuthorized(req: Request) {
  const debug = getAuthDebug(req);
  return debug.queryAuthorized || debug.headerAuthorized;
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
        {
          success: false,
          message: "Unauthorized",
          debug: getAuthDebug(req),
        },
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
        {
          success: false,
          message: "Unauthorized",
          debug: getAuthDebug(req),
        },
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