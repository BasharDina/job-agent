"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Job = {
  id: string;
  companyName: string;
  roleTitle: string;
  location: string | null;
  remoteType: string | null;
  salaryText: string | null;
  description?: string | null;
  requirements?: string | null;
  source: {
    platformName: string;
  };
  score: {
    totalScore: number;
    explanation?: string | null;
  } | null;
};

type Application = {
  id: string;
  status: string;
  method: string;
  platform: string;
  contactEmail: string | null;
  job: {
    roleTitle: string;
    companyName: string;
    id?: string;
  };
};

type Communication = {
  id: string;
  messageType: string;
  channel: string;
  sender: string | null;
  subject: string | null;
  summary: string | null;
  application: {
    job: {
      companyName: string;
      roleTitle: string;
    };
  };
};

function scoreBadgeClass(score: number) {
  if (score >= 90) {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }
  if (score >= 80) {
    return "bg-blue-100 text-blue-700 border border-blue-200";
  }
  if (score >= 70) {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

function statusBadgeClass(status: string) {
  const value = status.toLowerCase();

  if (value.includes("applied")) {
    return "bg-blue-100 text-blue-700 border border-blue-200";
  }
  if (value.includes("awaiting")) {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }
  if (value.includes("interview")) {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }
  if (value.includes("rejected")) {
    return "bg-rose-100 text-rose-700 border border-rose-200";
  }

  return "bg-slate-100 text-slate-700 border border-slate-200";
}

function messageBadgeClass(type: string) {
  const value = type.toLowerCase();

  if (value.includes("submitted")) {
    return "bg-blue-100 text-blue-700 border border-blue-200";
  }
  if (value.includes("confirmation")) {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }
  if (value.includes("interview")) {
    return "bg-violet-100 text-violet-700 border border-violet-200";
  }

  return "bg-slate-100 text-slate-700 border border-slate-200";
}

export default function LiveDashboard({
  jobs,
  applications,
  communications,
}: {
  jobs: Job[];
  applications: Application[];
  communications: Communication[];
}) {
  const router = useRouter();

  const [syncing, setSyncing] = useState(false);
  const [runningAgent, setRunningAgent] = useState(false);
  const [runningCycle, setRunningCycle] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const appliedKeys = useMemo(() => {
    return new Set(
      applications.map((app) => `${app.job.companyName}__${app.job.roleTitle}`)
    );
  }, [applications]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setNotice("");

      const res = await fetch("/api/sync/jobs", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to sync jobs");
      }

      setNotice(data?.message || "Sync completed.");
      router.refresh();
    } catch (error) {
      console.error(error);
      setNotice("Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const handleRunAgent = async () => {
    try {
      setRunningAgent(true);
      setNotice("");

      const res = await fetch("/api/agent/run", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to run agent");
      }

      setNotice(data?.message || "Agent completed.");
      router.refresh();
    } catch (error) {
      console.error(error);
      setNotice("Agent run failed.");
    } finally {
      setRunningAgent(false);
    }
  };

  const handleRunCycle = async () => {
    try {
      setRunningCycle(true);
      setNotice("");

      const res = await fetch("/api/agent/cycle", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to run full cycle");
      }

      const syncCount = data?.sync?.count ?? 0;
      const appliedCount = data?.agent?.appliedCount ?? 0;

      setNotice(
        `Full cycle completed. Added ${syncCount} jobs and applied to ${appliedCount} jobs.`
      );

      router.refresh();
    } catch (error) {
      console.error(error);
      setNotice("Full cycle failed.");
    } finally {
      setRunningCycle(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      setApplyingId(jobId);
      setNotice("");

      const res = await fetch("/api/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to apply");
      }

      setNotice(data?.message || "Application updated.");
      router.refresh();
    } catch (error) {
      console.error(error);
      setNotice("Apply failed.");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200">Global AI Job Agent</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                Live Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-200">
                Search jobs, evaluate role fit, apply from the dashboard, and
                track every communication in one place.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-slate-300">Jobs</p>
                  <p className="text-xl font-semibold text-white">{jobs.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-slate-300">Applications</p>
                  <p className="text-xl font-semibold text-white">
                    {applications.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-slate-300">Communications</p>
                  <p className="text-xl font-semibold text-white">
                    {communications.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {syncing ? "Syncing..." : "Sync Jobs"}
              </button>

              <button
                onClick={handleRunAgent}
                disabled={runningAgent}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {runningAgent ? "Running..." : "Run Agent"}
              </button>

              <button
                onClick={handleRunCycle}
                disabled={runningCycle}
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {runningCycle ? "Running Cycle..." : "Run Full Cycle"}
              </button>
            </div>
          </div>

          {notice ? (
            <div className="mt-5 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
              {notice}
            </div>
          ) : null}
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Jobs</h2>
            <p className="text-sm text-slate-500">
              Best matching roles discovered by the agent.
            </p>
          </div>

          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                No jobs yet. Press <span className="font-semibold">Sync Jobs</span>.
              </div>
            ) : (
              jobs.map((job) => {
                const alreadyApplied = appliedKeys.has(
                  `${job.companyName}__${job.roleTitle}`
                );

                return (
                  <div
                    key={job.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {job.roleTitle}
                          </h3>
                          <p className="text-base text-slate-600">{job.companyName}</p>
                        </div>

                        <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                          <p>
                            <span className="font-semibold text-slate-900">
                              Location:
                            </span>{" "}
                            {job.location || "—"}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900">
                              Source:
                            </span>{" "}
                            {job.source.platformName}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900">
                              Remote:
                            </span>{" "}
                            {job.remoteType || "—"}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900">
                              Salary:
                            </span>{" "}
                            {job.salaryText || "—"}
                          </p>
                        </div>

                        {job.score?.explanation ? (
                          <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
                            <p className="text-sm text-slate-700">
                              <span className="font-semibold text-slate-900">
                                Why it matches:
                              </span>{" "}
                              {job.score.explanation}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-col items-start gap-3 lg:items-end">
                        <div
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${
                            job.score
                              ? scoreBadgeClass(job.score.totalScore)
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {job.score?.totalScore ?? 0}% match
                        </div>

                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={alreadyApplied || applyingId === job.id}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                            alreadyApplied
                              ? "bg-slate-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          } disabled:opacity-70`}
                        >
                          {alreadyApplied
                            ? "Already Applied"
                            : applyingId === job.id
                            ? "Applying..."
                            : "Apply"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Applications</h2>
            <p className="text-sm text-slate-500">
              These are the jobs you already applied to.
            </p>
          </div>

          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                No applications yet.
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {app.job.roleTitle}
                      </h3>
                      <p className="text-base text-slate-600">{app.job.companyName}</p>

                      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                        <p>
                          <span className="font-semibold text-slate-900">Status:</span>{" "}
                          {app.status}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">Method:</span>{" "}
                          {app.method}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">Platform:</span>{" "}
                          {app.platform}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">Contact:</span>{" "}
                          {app.contactEmail || "—"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${statusBadgeClass(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Communications</h2>
            <p className="text-sm text-slate-500">
              Any reply, system event, or update related to your applications
              appears here.
            </p>
          </div>

          <div className="space-y-4">
            {communications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                No communications yet.
              </div>
            ) : (
              communications.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.application.job.companyName} —{" "}
                          {item.application.job.roleTitle}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Message type: {item.messageType}
                        </p>
                      </div>

                      <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                        <p>
                          <span className="font-semibold text-slate-900">Channel:</span>{" "}
                          {item.channel}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">Sender:</span>{" "}
                          {item.sender || "—"}
                        </p>
                        <p className="sm:col-span-2">
                          <span className="font-semibold text-slate-900">Subject:</span>{" "}
                          {item.subject || "—"}
                        </p>
                        <p className="sm:col-span-2">
                          <span className="font-semibold text-slate-900">Summary:</span>{" "}
                          {item.summary || "—"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${messageBadgeClass(
                        item.messageType
                      )}`}
                    >
                      {item.messageType}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}