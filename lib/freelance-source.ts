export type FreelanceLead = {
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

export async function fetchFreelanceLeads(): Promise<FreelanceLead[]> {
  return [
    {
      companyName: "Freelance Client A",
      roleTitle: "Brand Identity Designer",
      location: "Remote",
      remoteType: "Remote",
      description:
        "Need a designer to build a full visual identity for a startup brand including logo, colors, and social media kit.",
      requirements:
        "Branding, logo design, Illustrator, brand guidelines, social media kit",
      salaryText: "$800 fixed",
      sourceUrl: "https://example.com/freelance/brand-identity-designer",
      applicationUrl: "https://example.com/freelance/brand-identity-designer",
      sourceName: "Freelance Feed",
      externalId: "freelance-brand-001",
    },
    {
      companyName: "Freelance Client B",
      roleTitle: "Social Media Designer",
      location: "Remote",
      remoteType: "Remote",
      description:
        "Looking for a long-term designer for social posts, reels covers, ad creatives, and campaign visuals.",
      requirements:
        "Photoshop, social media design, campaign design, ad creatives, branding",
      salaryText: "$1200 monthly",
      sourceUrl: "https://example.com/freelance/social-media-designer",
      applicationUrl: "https://example.com/freelance/social-media-designer",
      sourceName: "Freelance Feed",
      externalId: "freelance-social-002",
    },
    {
      companyName: "Freelance Client C",
      roleTitle: "Presentation Designer",
      location: "Remote",
      remoteType: "Remote",
      description:
        "Need a designer to prepare a modern investor pitch deck and branded presentation templates.",
      requirements:
        "Presentation design, branding, typography, layout, PowerPoint, Figma",
      salaryText: "$600 fixed",
      sourceUrl: "https://example.com/freelance/presentation-designer",
      applicationUrl: "https://example.com/freelance/presentation-designer",
      sourceName: "Freelance Feed",
      externalId: "freelance-presentation-003",
    },
    {
      companyName: "Freelance Client D",
      roleTitle: "Backend API Developer",
      location: "Remote",
      remoteType: "Remote",
      description:
        "Build API integrations and backend services for a SaaS app.",
      requirements: "Node.js, PostgreSQL, REST APIs",
      salaryText: "$2000 fixed",
      sourceUrl: "https://example.com/freelance/backend-api-developer",
      applicationUrl: "https://example.com/freelance/backend-api-developer",
      sourceName: "Freelance Feed",
      externalId: "freelance-backend-004",
    },
    {
      companyName: "Freelance Client E",
      roleTitle: "Motion Graphics Designer",
      location: "Remote",
      remoteType: "Remote",
      description:
        "Need motion design for social media ads and short campaign videos.",
      requirements:
        "After Effects, motion graphics, social media ads, branding",
      salaryText: "$900 fixed",
      sourceUrl: "https://example.com/freelance/motion-graphics-designer",
      applicationUrl: "https://example.com/freelance/motion-graphics-designer",
      sourceName: "Freelance Feed",
      externalId: "freelance-motion-005",
    },
  ];
}