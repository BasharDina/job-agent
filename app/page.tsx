import { prisma } from "../lib/prisma";
import LiveDashboard from "./components/LiveDashboard";

export default async function Page() {
  const jobs = await prisma.job.findMany({
    include: {
      source: true,
      score: true,
    },
    orderBy: {
      discoveredAt: "desc",
    },
  });

  const applications = await prisma.application.findMany({
    include: {
      job: true,
    },
    orderBy: {
      lastUpdateAt: "desc",
    },
  });

  const communications = await prisma.communication.findMany({
    include: {
      application: {
        include: {
          job: true,
        },
      },
    },
    orderBy: {
      receivedAt: "desc",
    },
  });

  return (
    <LiveDashboard
      jobs={jobs}
      applications={applications}
      communications={communications}
    />
  );
}