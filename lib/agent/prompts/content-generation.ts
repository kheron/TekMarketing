import type { SocialPlatform } from "@/lib/agent/types";
import { getPlatformLabel } from "@/lib/constants/platforms";

const PLATFORM_SCHEMA_HINTS: Record<SocialPlatform, string> = {
  youtube_short: `"youtube_short": {
    "script": { "hook": "...", "body": "full narration 60-90s", "cta": "...", "estimatedDurationSec": 75 },
    "imagePrompts": [{ "sceneNumber": 1, "description": "...", "prompt": "detailed image gen prompt with brand visual style" }],
    "thumbnail": { "concept": "...", "prompt": "..." },
    "youtube": { "titleOptions": ["title1","title2","title3"], "description": "with 0:00 timestamps and CTA", "tags": ["tag1","tag2"] }
  }`,
  youtube_long: `"youtube_long": {
    "outline": [{ "section": "Intro", "durationSec": 60, "talkingPoints": ["..."] }],
    "script": "full long-form narration",
    "brollPrompts": [{ "sceneNumber": 1, "description": "...", "prompt": "..." }],
    "thumbnail": { "concept": "...", "prompt": "..." },
    "youtube": { "titleOptions": ["..."], "description": "SEO description with chapters", "tags": ["..."] }
  }`,
  tiktok: `"tiktok": {
    "script": { "hook": "...", "body": "...", "cta": "...", "estimatedDurationSec": 60 },
    "onScreenText": ["text overlay 1", "text overlay 2"],
    "hashtags": ["tag1", "tag2"],
    "scenePrompts": [{ "sceneNumber": 1, "description": "...", "prompt": "..." }],
    "musicMood": "upbeat electronic",
    "caption": "full TikTok caption"
  }`,
  instagram: `"instagram": {
    "format": "REEL",
    "caption": "full caption",
    "hook": "opening hook",
    "hashtags": ["tag1", "tag2"],
    "reelScript": { "hook": "...", "body": "...", "cta": "...", "estimatedDurationSec": 45 },
    "imagePrompt": "optional for POST format"
  }`,
  x: `"x": {
    "format": "POST",
    "hook": "opening line",
    "body": "full post text under 280 chars if POST",
    "hashtags": ["tag1"],
    "imagePrompt": "optional image gen prompt",
    "cta": "optional"
  }`,
  linkedin: `"linkedin": {
    "format": "POST",
    "hook": "professional hook",
    "body": "full post with line breaks",
    "hashtags": ["tag1"],
    "imagePrompt": "optional",
    "cta": "clear professional CTA"
  }`,
  facebook: `"facebook": {
    "format": "POST",
    "hook": "engaging opener",
    "body": "full post",
    "hashtags": ["tag1"],
    "imagePrompt": "optional",
    "cta": "optional"
  }`,
};

export function buildContentGenerationSystemPrompt(
  companyName: string
): string {
  return `You are a senior content strategist and multi-platform creator for ${companyName}.

You create high-quality, on-brand content packages optimized for each platform's format and audience.

You MUST return valid JSON only. No markdown fences.

Be strategic, specific, and actionable. Every piece of content must feel native to its platform.`;
}

export function buildContentGenerationUserPrompt(
  contextBlock: string,
  topic: string,
  platforms: SocialPlatform[]
): string {
  const platformSchemas = platforms
    .map((p) => PLATFORM_SCHEMA_HINTS[p])
    .join(",\n    ");

  const platformList = platforms.map((p) => getPlatformLabel(p)).join(", ");

  return `BRAND CONTEXT:
${contextBlock}

TOPIC / NEWS / IDEA:
${topic}

PLATFORMS TO GENERATE (only include these keys in content object):
${platformList}

Return a JSON object with EXACTLY this structure:
{
  "strategyNote": "2-4 sentences explaining your content angle for this topic",
  "agentReasoning": "Why this approach will work for this brand and topic right now",
  "content": {
    ${platformSchemas}
  }
}

CRITICAL RULES:
- Only include platform keys listed above inside "content"
- youtube_short script must be 60-90 seconds when read aloud (~150-225 words in body)
- youtube description must include timestamp markers (0:00 Hook, etc.) and a CTA with website if available
- image/thumbnail prompts MUST name the company, specify exact brand colors from Visual Style, and describe how the logo/wordmark appears
- image prompts must visually support the post/script content — not generic stock imagery
- x posts should stay under 280 characters for POST format
- linkedin should be professional but not corporate-boring
- All hashtags without # symbol in the array
- Return ONLY the JSON object`;
}
