import type { BusinessProfile } from "@/lib/agent/types";

/**
 * Builds a context block for AI prompts (ported from TekMarketing buildContextSummary).
 */
export function buildBusinessContextBlock(business: BusinessProfile): string {
  return `
BRAND:
- Company: ${business.name}
- Industry: ${business.industry}
- Voice: ${business.brandVoice}
- Audience: ${business.targetAudience}
- Services: ${business.keyServices}
- Differentiators: ${business.keyDifferentiators || "Not specified"}
- Goals: ${business.primaryGoals}
- Tone: ${business.toneKeywords || "Not specified"}
- Avoid: ${business.doNotSay || "None specified"}
- Content Pillars: ${business.contentPillars || "Not specified"}
- Preferred Platforms: ${business.preferredPlatforms || "Not specified"}
- Visual Style: ${business.visualStyle || "Clean, professional"}
- Website: ${business.website || "N/A"}
- Additional: ${business.additionalContext || "None"}
`.trim();
}
