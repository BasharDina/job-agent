import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { prisma } from "@/lib/prisma";
import { matchJobToProfile } from "@/lib/job-matcher";
import { fetchFreelanceLeads } from "@/lib/freelance-source";

type NormalizedJob = {
  companyName: string;
  roleTitle: string;
  location: string;
  remoteType: string;
  description: string;
  requirements: string;
  salaryText: string;
  sourceUrl: string;
  applicationUrl: string;
  sourceName: string;
  externalId?: string;
};

function stripHtml(input?: string | null) {
  return (input || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function looksRelevantToDesign(job: NormalizedJob) {
  const text = [
    job.roleTitle,
    job.description,
    job.requirements,
    job.companyName,
  ]
    .join(" ")
    .toLowerCase();

  const strongPositiveSignals = [
    "graphic designer",
    "brand designer",
    "branding designer",
    "visual designer",
    "creative designer",
    "social media designer",
    "marketing designer",
    "multimedia designer",
    "motion designer",
    "motion graphics",
    "ui designer",
    "ux designer",
    "ui/ux designer",
    "product designer",
    "presentation designer",
    "designer",
    "design",
    "branding",
    "visual design",
    "graphic design",
  ];

  const strongNegativeSignals = [
    "firmware",
    "engineer",
    "developer",
    "backend",
    "frontend engineer",
    "full stack",
    "full-stack",
    "data scientist",
    "data engineer",
    "trainer",
    "audio ai",
    "machine learning",
    "ml engineer",
    "software",
    "devops",
    "sales",
    "account executive",
    "customer support",
    "recruiter",
    "talent acquisition",
    "teacher",
    "writer",
    "copywriter",
    "content writer",
  ];

  const hasPositive = strongPositiveSignals.some((word) => text.includes(word));
  const hasNegative = strongNegativeSignals.some((word) => text.includes(word));

  return hasPositive && !hasNegative;
}

async function ensureJobSource(platformName: string, sourceType: string) {
  const existing = await prisma.jobSource.findFirst({
    where: { platformName },
  });

  if (existing) return existing.id;

  const created = await prisma.jobSource.create({
    data: {
      platformName,
      sourceType,
      policyLevel: "safe",
    },
  });

  return created.id;
}

async function fetchRemotiveJobs(): Promise<NormalizedJob[]> {
  const res = await fetch("https://remotive.com/api/remote-jobs?search=design", {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 JobAgent/1.0",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Remotive fetch failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];

  return jobs.map((job: any) => ({
    companyName: job.company_name || "Unknown Company",
    roleTitle: job.title || "Unknown Role",
    location: job.candidate_required_location || "Remote",
    remoteType: "Remote",
    description: stripHtml(job.description),
    requirements: stripHtml(job.description),
    salaryText: job.salary || "",
    sourceUrl: job.url || "",
    applicationUrl: job.url || "",
    sourceName: "Remotive",
    externalId: job.id ? String(job.id) : undefined,
  }));
}

async function fetchWWRDesignJobs(): Promise<NormalizedJob[]> {
  const res = await fetch(
    "https://weworkremotely.com/categories/remote-design-jobs.rss",
    {
      cache: "no-store",
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
        "User-Agent": "Mozilla/5.0 JobAgent/1.0",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WWR RSS fetch failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const xml = await res.text();
  const safeXml = decodeEntities(xml);

  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
    processEntities: false,
  });

  const parsed = parser.parse(safeXml);
  const rawItems = parsed?.rss?.channel?.item ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return items
    .filter(Boolean)
    .map((item: any) => {
      const title = String(item?.title || "");
      const parts = title.split(":");
      const companyName =
        parts.length > 1 ? parts[0].trim() : "Unknown Company";
      const roleTitle =
        parts.length > 1 ? parts.slice(1).join(":").trim() : title.trim();

      const description = stripHtml(item?.description || "");
      const link = String(item?.link || "");

      return {
        companyName,
        roleTitle: roleTitle || "Unknown Role",
        location: "Remote",
        remoteType: "Remote",
        description,
        requirements: description,
        salaryText: "",
        sourceUrl: link,
        applicationUrl: link,
        sourceName: "We Work Remotely",
      };
    });
}

async function fetchGreenhouseJobs(): Promise<NormalizedJob[]> {
  const tokenString = process.env.GREENHOUSE_BOARD_TOKENS || "";
  const boardTokens = tokenString
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  if (!boardTokens.length) {
    return [];
  }

  const allJobs: NormalizedJob[] = [];

  for (const boardToken of boardTokens) {
    try {
      const res = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`,
        {
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 JobAgent/1.0",
          },
        }
      );

      if (!res.ok) continue;

      const data = await res.json();
      const jobs = Array.isArray(data?.jobs) ? data.jobs : [];

      for (const job of jobs) {
        const offices = Array.isArray(job?.offices) ? job.offices : [];
        const officeLocation =
          offices.map((o: any) => o?.location).filter(Boolean).join(" · ") ||
          job?.location?.name ||
          "Remote";

        const content = stripHtml(job?.content || "");
        const companyName =
          boardToken.charAt(0).toUpperCase() + boardToken.slice(1);

        allJobs.push({
          companyName,
          roleTitle: job?.title || "Unknown Role",
          location: officeLocation,
          remoteType: officeLocation.toLowerCase().includes("remote")
            ? "Remote"
            : "Hybrid",
          description: content,
          requirements: content,
          salaryText: "",
          sourceUrl: job?.absolute_url || "",
          applicationUrl: job?.absolute_url || "",
          sourceName: "Greenhouse",
          externalId: job?.id ? String(job.id) : undefined,
        });
      }
    } catch {
      continue;
    }
  }

  return allJobs;
}

export async function POST() {
  try {
    const profile = await prisma.profile.findFirst();

    const [
      remotiveSourceId,
      wwrSourceId,
      greenhouseSourceId,
      freelanceSourceId,
    ] = await Promise.all([
      ensureJobSource("Remotive", "public_api"),
      ensureJobSource("We Work Remotely", "rss"),
      ensureJobSource("Greenhouse", "job_board_api"),
      ensureJobSource("Freelance Feed", "freelance_feed"),
    ]);

    const remotiveResult = await fetchRemotiveJobs()
      .then((jobs) => ({ ok: true as const, jobs }))
      .catch((error) => ({
        ok: false as const,
        jobs: [] as NormalizedJob[],
        error: error instanceof Error ? error.message : "Unknown Remotive error",
      }));

    const wwrResult = await fetchWWRDesignJobs()
      .then((jobs) => ({ ok: true as const, jobs }))
      .catch((error) => ({
        ok: false as const,
        jobs: [] as NormalizedJob[],
        error: error instanceof Error ? error.message : "Unknown WWR error",
      }));

    const greenhouseResult = await fetchGreenhouseJobs()
      .then((jobs) => ({ ok: true as const, jobs }))
      .catch((error) => ({
        ok: false as const,
        jobs: [] as NormalizedJob[],
        error:
          error instanceof Error ? error.message : "Unknown Greenhouse error",
      }));

    const freelanceResult = await fetchFreelanceLeads()
      .then((jobs) => ({ ok: true as const, jobs }))
      .catch((error) => ({
        ok: false as const,
        jobs: [] as NormalizedJob[],
        error:
          error instanceof Error ? error.message : "Unknown Freelance Feed error",
      }));

    const allJobs = [
      ...remotiveResult.jobs,
      ...wwrResult.jobs,
      ...greenhouseResult.jobs,
      ...freelanceResult.jobs,
    ];

    if (allJobs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No jobs fetched from any source.",
          debug: {
            remotive: remotiveResult.ok ? "ok" : remotiveResult.error,
            wwr: wwrResult.ok ? "ok" : wwrResult.error,
            greenhouse: greenhouseResult.ok ? "ok" : greenhouseResult.error,
            freelance: freelanceResult.ok ? "ok" : freelanceResult.error,
          },
        },
        { status: 500 }
      );
    }

    let checked = 0;
    let relevant = 0;
    let created = 0;
    let duplicates = 0;
    let skippedLowScore = 0;

    const createdJobs: Array<{
      companyName: string;
      roleTitle: string;
      source: string;
      score: number;
    }> = [];

    for (const job of allJobs) {
      checked += 1;

      if (!job.sourceUrl || !job.roleTitle || !job.companyName) {
        continue;
      }

      if (!looksRelevantToDesign(job)) {
        continue;
      }

      relevant += 1;

      const match = matchJobToProfile(profile, {
        roleTitle: job.roleTitle,
        location: job.location,
        remoteType: job.remoteType,
        description: job.description,
        requirements: job.requirements,
      });

      if (match.totalScore < 72) {
        skippedLowScore += 1;
        continue;
      }

      const existing = await prisma.job.findFirst({
        where: {
          OR: [
            { sourceUrl: job.sourceUrl },
            {
              companyName: job.companyName,
              roleTitle: job.roleTitle,
            },
          ],
        },
      });

      if (existing) {
        duplicates += 1;
        continue;
      }

      const sourceId =
        job.sourceName === "Remotive"
          ? remotiveSourceId
          : job.sourceName === "We Work Remotely"
          ? wwrSourceId
          : job.sourceName === "Greenhouse"
          ? greenhouseSourceId
          : freelanceSourceId;

      const createdJob = await prisma.job.create({
        data: {
          externalId: job.externalId,
          companyName: job.companyName,
          roleTitle: job.roleTitle,
          location: job.location,
          remoteType: job.remoteType,
          description: job.description,
          requirements: job.requirements,
          salaryText: job.salaryText,
          sourceUrl: job.sourceUrl,
          applicationUrl: job.applicationUrl,
          sourceId,
        },
      });

      await prisma.jobScore.create({
        data: {
          jobId: createdJob.id,
          totalScore: match.totalScore,
          skillsScore: match.skillsScore,
          seniorityScore: match.seniorityScore,
          portfolioScore: match.portfolioScore,
          locationScore: match.locationScore,
          explanation: `${match.explanation} • Source: ${job.sourceName}`,
        },
      });

      created += 1;

      createdJobs.push({
        companyName: createdJob.companyName,
        roleTitle: createdJob.roleTitle,
        source: job.sourceName,
        score: match.totalScore,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Real sync completed. Added ${created} new jobs.`,
      stats: {
        checked,
        relevant,
        created,
        duplicates,
        skippedLowScore,
        remotiveFetched: remotiveResult.jobs.length,
        wwrFetched: wwrResult.jobs.length,
        greenhouseFetched: greenhouseResult.jobs.length,
        freelanceFetched: freelanceResult.jobs.length,
        remotiveStatus: remotiveResult.ok ? "ok" : remotiveResult.error,
        wwrStatus: wwrResult.ok ? "ok" : wwrResult.error,
        greenhouseStatus: greenhouseResult.ok ? "ok" : greenhouseResult.error,
        freelanceStatus: freelanceResult.ok ? "ok" : freelanceResult.error,
      },
      jobs: createdJobs,
    });
  } catch (error) {
    console.error("POST /api/sync/jobs error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to sync real jobs",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}