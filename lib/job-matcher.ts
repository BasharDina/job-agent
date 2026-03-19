type ProfileInput = {
  skills?: string | null;
  preferredRoles?: string | null;
  preferredLocations?: string | null;
  remoteOk?: boolean | null;
};

type JobInput = {
  roleTitle: string;
  location?: string | null;
  remoteType?: string | null;
  description?: string | null;
  requirements?: string | null;
};

type MatchResult = {
  totalScore: number;
  skillsScore: number;
  seniorityScore: number;
  portfolioScore: number;
  locationScore: number;
  explanation: string;
};

function normalize(text?: string | null) {
  return (text || "").toLowerCase();
}

function splitKeywords(text?: string | null) {
  return normalize(text)
    .split(/[,\n|/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function matchJobToProfile(
  profile: ProfileInput | null,
  job: JobInput
): MatchResult {
  const skills = splitKeywords(profile?.skills);
  const preferredRoles = splitKeywords(profile?.preferredRoles);
  const preferredLocations = splitKeywords(profile?.preferredLocations);

  const roleText = normalize(job.roleTitle);
  const locationText = normalize(job.location);
  const remoteText = normalize(job.remoteType);
  const descText = normalize(job.description);
  const reqText = normalize(job.requirements);

  const fullText = `${roleText} ${locationText} ${remoteText} ${descText} ${reqText}`;

  let skillsScore = 55;
  let seniorityScore = 70;
  let portfolioScore = 65;
  let locationScore = 60;

  const matchedSkills = skills.filter((skill) => fullText.includes(skill));
  skillsScore += Math.min(matchedSkills.length * 8, 35);

  const matchedPreferredRoles = preferredRoles.filter((role) =>
    roleText.includes(role) || descText.includes(role)
  );
  seniorityScore += Math.min(matchedPreferredRoles.length * 10, 20);

  const designSignals = [
    "design",
    "branding",
    "visual",
    "social media",
    "illustrator",
    "photoshop",
    "figma",
    "multimedia",
    "creative",
  ];

  const designHits = designSignals.filter((signal) => fullText.includes(signal));
  portfolioScore += Math.min(designHits.length * 4, 25);

  if (profile?.remoteOk && remoteText.includes("remote")) {
    locationScore += 25;
  }

  const matchedLocations = preferredLocations.filter((loc) =>
    locationText.includes(loc)
  );
  locationScore += Math.min(matchedLocations.length * 10, 15);

  skillsScore = Math.min(skillsScore, 100);
  seniorityScore = Math.min(seniorityScore, 100);
  portfolioScore = Math.min(portfolioScore, 100);
  locationScore = Math.min(locationScore, 100);

  const totalScore = Math.round(
    skillsScore * 0.35 +
      seniorityScore * 0.2 +
      portfolioScore * 0.25 +
      locationScore * 0.2
  );

  const reasons: string[] = [];

  if (matchedSkills.length) {
    reasons.push(`Matched skills: ${matchedSkills.slice(0, 4).join(", ")}`);
  }

  if (matchedPreferredRoles.length) {
    reasons.push(`Role alignment: ${matchedPreferredRoles.slice(0, 3).join(", ")}`);
  }

  if (profile?.remoteOk && remoteText.includes("remote")) {
    reasons.push("Remote-friendly match");
  }

  if (!reasons.length) {
    reasons.push("General design relevance match");
  }

  return {
    totalScore,
    skillsScore,
    seniorityScore,
    portfolioScore,
    locationScore,
    explanation: reasons.join(" • "),
  };
}