export default function JobAgentDashboardMVP() {
  const stats = [
    { label: "Jobs Found", value: "1,284" },
    { label: "Shortlisted", value: "142" },
    { label: "Applied", value: "57" },
    { label: "Replies", value: "9" },
  ];

  const jobs = [
    {
      company: "Studio Nova",
      role: "Senior Graphic Designer",
      location: "Remote · Global",
      source: "Greenhouse",
      score: 94,
      method: "Direct ATS",
      status: "Ready to Apply",
    },
    {
      company: "Pixel Harbor",
      role: "Brand Designer",
      location: "Berlin · Remote Friendly",
      source: "Lever",
      score: 91,
      method: "Company Form",
      status: "Draft Prepared",
    },
    {
      company: "Orbit Creative",
      role: "Visual Designer",
      location: "Dubai · Hybrid",
      source: "Career Site",
      score: 88,
      method: "Email",
      status: "Applied",
    },
    {
      company: "Luma Labs",
      role: "Multimedia Designer",
      location: "Remote · Worldwide",
      source: "Remote Board",
      score: 85,
      method: "External Form",
      status: "Awaiting Reply",
    },
  ];

  const applications = [
    {
      company: "Orbit Creative",
      role: "Visual Designer",
      platform: "Career Site",
      appliedVia: "Email",
      email: "jobs@orbitcreative.com",
      date: "2026-03-17",
      status: "Awaiting Reply",
    },
    {
      company: "Northframe",
      role: "Brand Designer",
      platform: "Greenhouse",
      appliedVia: "ATS Form",
      email: "recruiting@northframe.com",
      date: "2026-03-16",
      status: "Interview Invite",
    },
    {
      company: "Velora Studio",
      role: "Motion Designer",
      platform: "Lever",
      appliedVia: "Company Form",
      email: "talent@velora.studio",
      date: "2026-03-15",
      status: "Rejected",
    },
  ];

  const replies = [
    {
      company: "Northframe",
      type: "Interview Invite",
      summary: "The company asked you to schedule a first interview.",
      channel: "Email",
      time: "2 hours ago",
    },
    {
      company: "Orbit Creative",
      type: "Confirmation",
      summary: "Your application was received successfully.",
      channel: "Email",
      time: "Yesterday",
    },
    {
      company: "Luma Labs",
      type: "Assessment Request",
      summary: "A short design task is waiting for review.",
      channel: "ATS Portal",
      time: "Yesterday",
    },
  ];

  const pipelines = [
    { label: "To Review", count: 33 },
    { label: "Ready", count: 21 },
    { label: "Applied", count: 57 },
    { label: "Awaiting Reply", count: 34 },
    { label: "Interview", count: 6 },
    { label: "Rejected", count: 11 },
  ];

const badgeClass = (status: string) => {
      const base = "inline-flex rounded-full px-3 py-1 text-xs font-medium border";
    if (status === "Interview Invite") return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`;
    if (status === "Applied") return `${base} bg-blue-50 text-blue-700 border-blue-200`;
    if (status === "Awaiting Reply") return `${base} bg-amber-50 text-amber-700 border-amber-200`;
    if (status === "Rejected") return `${base} bg-rose-50 text-rose-700 border-rose-200`;
    if (status === "Ready to Apply") return `${base} bg-violet-50 text-violet-700 border-violet-200`;
    if (status === "Draft Prepared") return `${base} bg-slate-100 text-slate-700 border-slate-200`;
    return `${base} bg-slate-100 text-slate-700 border-slate-200`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Global AI Job Agent</p>
            <h1 className="text-3xl font-bold tracking-tight">Job Search Command Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Search worldwide, rank jobs by fit, track applications, monitor replies, and keep every submission organized in one dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Recommended Jobs</h2>
                <p className="text-sm text-slate-500">High-match roles discovered across platforms</p>
              </div>
              <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                Sync Search
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-7 bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <div className="col-span-2">Role</div>
                <div>Location</div>
                <div>Source</div>
                <div>Score</div>
                <div>Method</div>
                <div>Status</div>
              </div>

              {jobs.map((job) => (
                <div key={job.company + job.role} className="grid grid-cols-7 items-center border-t border-slate-200 px-4 py-4 text-sm">
                  <div className="col-span-2">
                    <p className="font-semibold">{job.role}</p>
                    <p className="text-slate-500">{job.company}</p>
                  </div>
                  <div className="text-slate-600">{job.location}</div>
                  <div className="text-slate-600">{job.source}</div>
                  <div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{job.score}%</span>
                  </div>
                  <div className="text-slate-600">{job.method}</div>
                  <div>
                    <span className={badgeClass(job.status)}>{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold">Pipeline</h2>
              <p className="mb-4 text-sm text-slate-500">Application flow by stage</p>
              <div className="space-y-3">
                {pipelines.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm text-slate-500">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold">Agent Rules</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">Auto-apply when score is above 82 and the role is design-related.</div>
                <div className="rounded-2xl bg-slate-50 p-4">Require approval for sensitive platforms and logged-in portals.</div>
                <div className="rounded-2xl bg-slate-50 p-4">Monitor recruiter emails and classify replies automatically.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Applications Tracker</h2>
              <p className="text-sm text-slate-500">Every submission, source, and method in one place</p>
            </div>

            <div className="space-y-4">
              {applications.map((item) => (
                <div key={item.company + item.role} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.role}</p>
                      <p className="text-sm text-slate-500">{item.company}</p>
                    </div>
                    <span className={badgeClass(item.status)}>{item.status}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p><span className="font-medium text-slate-800">Platform:</span> {item.platform}</p>
                    <p><span className="font-medium text-slate-800">Applied via:</span> {item.appliedVia}</p>
                    <p><span className="font-medium text-slate-800">Contact:</span> {item.email}</p>
                    <p><span className="font-medium text-slate-800">Date:</span> {item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Reply Watcher</h2>
              <p className="text-sm text-slate-500">Detected updates from inbox and ATS portals</p>
            </div>

            <div className="space-y-4">
              {replies.map((item) => (
                <div key={item.company + item.type} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.company}</p>
                      <p className="text-sm text-slate-500">{item.channel}</p>
                    </div>
                    <span className={badgeClass(item.type)}>{item.type}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{item.summary}</p>
                  <p className="mt-2 text-xs text-slate-400">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
