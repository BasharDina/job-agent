type JobForRules = {
  roleTitle: string;
  location?: string | null;
  remoteType?: string | null;
  score?: {
    totalScore: number;
  } | null;
};

type ProfileForRules = {
  remoteOk?: boolean | null;
  preferredRoles?: string | null;
};

function normalize(text?: string | null) {
  return (text || "").toLowerCase();
}

export function shouldAutoApply(
  profile: ProfileForRules | null,
  job: JobForRules
) {
  const score = job.score?.totalScore ?? 0;
  const role = normalize(job.roleTitle);
  const remoteType = normalize(job.remoteType);
  const preferredRoles = normalize(profile?.preferredRoles);

  if (score < 80) {
    return {
      allowed: false,
      reason: "Score is below auto-apply threshold",
    };
  }

  const allowedRole =
    role.includes("designer") ||
    role.includes("design") ||
    role.includes("branding") ||
    role.includes("visual") ||
    role.includes("creative") ||
    role.includes("motion");

  if (!allowedRole) {
    return {
      allowed: false,
      reason: "Role is outside target design scope",
    };
  }

  if (profile?.remoteOk && remoteType && !remoteType.includes("remote") && preferredRoles.includes("remote")) {
    return {
      allowed: false,
      reason: "Profile prefers remote roles",
    };
  }

  return {
    allowed: true,
    reason: "Passed auto-apply rules",
  };
}