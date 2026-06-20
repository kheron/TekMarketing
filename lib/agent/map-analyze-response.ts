import type { BusinessProfileInput } from "@/lib/agent/types";

interface AnalyzeApiResponse {
  name?: string;
  companyName?: string;
  industry?: string;
  brandVoice?: string;
  voiceDescription?: string;
  targetAudience?: string;
  keyServices?: string;
  productsServices?: string;
  keyDifferentiators?: string;
  primaryGoals?: string;
  toneKeywords?: string;
  contentPillars?: string;
  visualStyle?: string;
  preferredPlatforms?: string;
}

export function mapAnalyzeToBusinessInput(
  parsed: AnalyzeApiResponse,
  url: string,
  pageTitle = ""
): Partial<BusinessProfileInput> {
  return {
    name:
      parsed.name ||
      parsed.companyName ||
      pageTitle.split("|")[0]?.trim() ||
      "",
    industry: parsed.industry || "",
    brandVoice: parsed.brandVoice || parsed.voiceDescription || "",
    targetAudience: parsed.targetAudience || "",
    keyServices: parsed.keyServices || parsed.productsServices || "",
    keyDifferentiators: parsed.keyDifferentiators || "",
    primaryGoals: parsed.primaryGoals || "",
    toneKeywords: parsed.toneKeywords || "",
    contentPillars: parsed.contentPillars || "",
    visualStyle: parsed.visualStyle || "",
    preferredPlatforms:
      parsed.preferredPlatforms ||
      "YouTube Shorts, Instagram, LinkedIn, X, TikTok",
    website: url,
  };
}
