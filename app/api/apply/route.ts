import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const jobId = body?.jobId as string | undefined;

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "jobId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No user found" },
        { status: 404 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: user.id,
        jobId: job.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        message: "You already applied to this job.",
        application: existingApplication,
      });
    }

    const application = await prisma.application.create({
      data: {
        userId: user.id,
        jobId: job.id,
        appliedAt: new Date(),
        method: "Dashboard Apply",
        platform: "Internal Dashboard",
        contactEmail: "applications@example.com",
        formUrl: job.applicationUrl,
        resumeVersion: "portfolio-site-v1",
        coverLetterVersion: "auto-generated-v1",
        status: "Applied",
      },
    });

    await prisma.communication.create({
      data: {
        applicationId: application.id,
        channel: "Dashboard",
        messageType: "Application Submitted",
        sender: "system@job-agent.local",
        subject: `Application submitted for ${job.roleTitle}`,
        summary: `Your application for ${job.companyName} was created from the dashboard.`,
        actionRequired: false,
      },
    });

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      message: "Application created successfully.",
      application,
    });
  } catch (error) {
    console.error("POST /api/apply error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create application",
      },
      { status: 500 }
    );
  }
}