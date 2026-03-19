import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "moaz@example.com" },
    update: {},
    create: {
      fullName: "Moaz Mahmoud",
      email: "moaz@example.com",
      portfolioUrl: "https://your-portfolio-site.com",
    },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      headline: "Graphic Designer & Multimedia Specialist",
      summary:
        "Designer specialized in branding, social media, visual storytelling, and multimedia production.",
      skills:
        "Graphic Design, Branding, Social Media Design, UI Design, Motion Graphics, Video Editing",
      tools:
        "Photoshop, Illustrator, InDesign, Figma, Premiere Pro, After Effects",
      languages: "Arabic, English",
      preferredRoles:
        "Graphic Designer, Brand Designer, Visual Designer, Multimedia Designer, UI Designer",
      preferredLocations: "Worldwide, Remote",
      remoteOk: true,
      salaryCurrency: "USD",
    },
  });

  const existingSources = await prisma.jobSource.findMany();
  if (existingSources.length > 0) {
    await prisma.alert.deleteMany();
    await prisma.communication.deleteMany();
    await prisma.application.deleteMany();
    await prisma.jobScore.deleteMany();
    await prisma.job.deleteMany();
    await prisma.jobSource.deleteMany();
  }

  const greenhouse = await prisma.jobSource.create({
    data: {
      platformName: "Greenhouse",
      sourceType: "ATS",
      policyLevel: "safe",
    },
  });

  const lever = await prisma.jobSource.create({
    data: {
      platformName: "Lever",
      sourceType: "ATS",
      policyLevel: "safe",
    },
  });

  const companySite = await prisma.jobSource.create({
    data: {
      platformName: "Company Career Site",
      sourceType: "direct",
      policyLevel: "review",
    },
  });

  const job1 = await prisma.job.create({
    data: {
      companyName: "Studio Nova",
      roleTitle: "Senior Graphic Designer",
      location: "Remote · Global",
      remoteType: "Remote",
      description: "Lead visual design across campaigns and brand assets.",
      requirements: "Branding, social media, Adobe Creative Suite",
      salaryText: "$2500 - $3500",
      sourceUrl: "https://example.com/jobs/studio-nova",
      applicationUrl: "https://example.com/jobs/studio-nova/apply",
      sourceId: greenhouse.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      companyName: "Pixel Harbor",
      roleTitle: "Brand Designer",
      location: "Berlin · Remote Friendly",
      remoteType: "Hybrid",
      description: "Design strong brand systems and visual campaigns.",
      requirements: "Brand identity, typography, layout systems",
      salaryText: "€3000 - €4200",
      sourceUrl: "https://example.com/jobs/pixel-harbor",
      applicationUrl: "https://example.com/jobs/pixel-harbor/apply",
      sourceId: lever.id,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      companyName: "Orbit Creative",
      roleTitle: "Visual Designer",
      location: "Dubai · Hybrid",
      remoteType: "Hybrid",
      description: "Create marketing visuals and digital campaign assets.",
      requirements: "Photoshop, Illustrator, campaign design",
      salaryText: "$2200 - $3000",
      sourceUrl: "https://example.com/jobs/orbit-creative",
      applicationUrl: "https://example.com/jobs/orbit-creative/apply",
      sourceId: companySite.id,
    },
  });

  await prisma.jobScore.create({
    data: {
      jobId: job1.id,
      totalScore: 94,
      skillsScore: 95,
      seniorityScore: 90,
      portfolioScore: 96,
      locationScore: 94,
      explanation: "Excellent fit for branding, campaigns, and remote work.",
    },
  });

  await prisma.jobScore.create({
    data: {
      jobId: job2.id,
      totalScore: 91,
      skillsScore: 92,
      seniorityScore: 88,
      portfolioScore: 93,
      locationScore: 90,
      explanation: "Strong branding match with good international fit.",
    },
  });

  await prisma.jobScore.create({
    data: {
      jobId: job3.id,
      totalScore: 88,
      skillsScore: 89,
      seniorityScore: 85,
      portfolioScore: 90,
      locationScore: 87,
      explanation:
        "Very relevant visual design role with good campaign alignment.",
    },
  });

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      jobId: job3.id,
      appliedAt: new Date(),
      method: "Email",
      platform: "Company Career Site",
      contactEmail: "jobs@orbitcreative.com",
      formUrl: "https://example.com/jobs/orbit-creative/apply",
      resumeVersion: "v1-design",
      coverLetterVersion: "v1-brand-visual",
      status: "Awaiting Reply",
    },
  });

  await prisma.communication.create({
    data: {
      applicationId: application.id,
      channel: "Email",
      messageType: "Confirmation",
      sender: "jobs@orbitcreative.com",
      subject: "Application Received",
      summary: "Your application was received successfully.",
      actionRequired: false,
    },
  });

  await prisma.alert.create({
    data: {
      applicationId: application.id,
      alertType: "Application Update",
      sentVia: "Dashboard",
      status: "sent",
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });