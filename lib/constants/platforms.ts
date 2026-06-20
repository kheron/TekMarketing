import type { SocialPlatform } from "@/lib/agent/types";

export interface PlatformConfig { id: SocialPlatform; label: string; shortLabel: string; description: string; category: "video" | "social"; defaultSelected: boolean; charLimit?: number; }

export const PLATFORMS: PlatformConfig[] = [
  { id: "youtube_short", label: "YouTube Shorts", shortLabel: "YT Shorts", description: "60–90s faceless script, scene prompts, thumbnail, upload package", category: "video", defaultSelected: true },
  { id: "youtube_long", label: "YouTube Long-form", shortLabel: "YT Long", description: "Outline, full script, B-roll prompts, thumbnail, SEO metadata", category: "video", defaultSelected: false },
  { id: "tiktok", label: "TikTok", shortLabel: "TikTok", description: "Short script, on-screen text, scene prompts, hashtags", category: "video", defaultSelected: false },
  { id: "instagram", label: "Instagram", shortLabel: "IG", description: "Reel script, carousel prompts, caption, hashtags", category: "social", defaultSelected: false },
  { id: "x", label: "X (Twitter)", shortLabel: "X", description: "Post or thread with hook, body, hashtags, media prompt", category: "social", defaultSelected: false, charLimit: 280 },
  { id: "linkedin", label: "LinkedIn", shortLabel: "LinkedIn", description: "Professional post or thread with hook and CTA", category: "social", defaultSelected: false, charLimit: 3000 },
  { id: "facebook", label: "Facebook", shortLabel: "Facebook", description: "Engaging post with hook, body, and image prompt", category: "social", defaultSelected: false, charLimit: 63206 },
];

export const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.id, p])) as Record<SocialPlatform, PlatformConfig>;
export const DEFAULT_PLATFORMS: SocialPlatform[] = PLATFORMS.filter((p) => p.defaultSelected).map((p) => p.id);
export const VIDEO_PLATFORMS = PLATFORMS.filter((p) => p.category === "video");
export const SOCIAL_PLATFORMS = PLATFORMS.filter((p) => p.category === "social");

export function getPlatformLabel(id: SocialPlatform): string { return PLATFORM_MAP[id]?.label ?? id; }

export function getEpisodePlatformIds(content: Partial<Record<SocialPlatform, unknown>>): SocialPlatform[] {
  return (Object.keys(content) as SocialPlatform[]).filter((key) => content[key] != null);
}