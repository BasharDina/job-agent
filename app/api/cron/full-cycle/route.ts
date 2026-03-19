import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "CRON ROUTE VERSION 2",
    envValue: process.env.CRON_SECRET || null,
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "CRON ROUTE VERSION 2 POST",
    envValue: process.env.CRON_SECRET || null,
  });
}