import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shouldAutoApply } from "@/lib/agent-rules";

export async function POST() {
  try {
    const user = await prisma.user.findFirst({
      include: {
        profile: true,
      },
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

    const jobs = await prisma.job.findMany({
      include: {
        score: true,
      },
      orderBy: {
        discoveredAt: "desc",
      },
    });

    let appliedCount = 0;
    const results: Array<{
      jobId: string;
      companyName: string;
      roleTitle: string;
      action: string;
      reason: string;
    }> = [];

    for (const job of jobs) {
      const existingApplication = await prisma.application.findFirst({
        where: {
          userId: user.id,
          jobId: job.id,
        },
      });

      if (existingApplication) {
        results.push({
          jobId: job.id,
          companyName: job.companyName,
          roleTitle: job.roleTitle,
          action: "skipped",
          reason: "Already applied",
        });
        continue;
      }

      const decision = shouldAutoApply(user.profile, job);

      if (!decision.allowed) {
        results.push({
          jobId: job.id,
          companyName: job.companyName,
          roleTitle: job.roleTitle,
          action: "skipped",
          reason: decision.reason,
        });
        continue;
      }

      const application = await prisma.application.create({
        data: {
          userId: user.id,
          jobId: job.id,
          appliedAt: new Date(),
          method: "Auto Apply Agent",
          platform: "Internal Agent",
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
          channel: "Agent",
          messageType: "Auto Application Submitted",
          sender: "agent@job-agent.local",
          subject: `Auto-applied to ${job.roleTitle}`,
          summary: `The agent applied automatically to ${job.companyName} for the role ${job.roleTitle}.`,
          actionRequired: false,
        },
      });

      appliedCount += 1;

      results.push({
        jobId: job.id,
        companyName: job.companyName,
        roleTitle: job.roleTitle,
        action: "applied",
        reason: decision.reason,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Agent run completed. Applied to ${appliedCount} jobs.`,
      appliedCount,
      checkedJobs: jobs.length,
      results,
    });
  } catch (error) {
    console.error("POST /api/agent/run error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to run agent",
      },
      { status: 500 }
    );
  }
}