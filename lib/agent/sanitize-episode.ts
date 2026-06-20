import type {
  ContentEpisodePayload,
  PlatformContent,
  SocialPlatform,
} from "@/lib/agent/types";

function ensureScenePrompts(
  arr: unknown,
  min: number,
  max: number,
  fallbackPrefix: string
) {
  const items = Array.isArray(arr) ? arr : [];
  const mapped = items.slice(0, max).map((item: unknown, i: number) => {
    const o = item as Record<string, unknown>;
    return {
      sceneNumber: typeof o.sceneNumber === "number" ? o.sceneNumber : i + 1,
      description: String(o.description || `Scene ${i + 1}`),
      prompt: String(o.prompt || `${fallbackPrefix} scene ${i + 1}`),
    };
  });
  while (mapped.length < min) {
    mapped.push({
      sceneNumber: mapped.length + 1,
      description: `Scene ${mapped.length + 1}`,
      prompt: `${fallbackPrefix} scene ${mapped.length + 1}`,
    });
  }
  return mapped;
}

function ensureScript(raw: unknown) {
  const o = (raw as Record<string, unknown>) || {};
  return {
    hook: String(o.hook || "Here's what you need to know."),
    body: String(o.body || "Content generated for this topic."),
    cta: String(o.cta || "Learn more in the link below."),
    estimatedDurationSec:
      typeof o.estimatedDurationSec === "number"
        ? Math.min(600, Math.max(30, o.estimatedDurationSec))
        : 75,
  };
}

function ensureYouTube(raw: unknown) {
  const o = (raw as Record<string, unknown>) || {};
  const titles = Array.isArray(o.titleOptions)
    ? o.titleOptions.map(String).filter(Boolean)
    : [];
  const tags = Array.isArray(o.tags) ? o.tags.map(String).filter(Boolean) : [];
  return {
    titleOptions:
      titles.length >= 3
        ? titles.slice(0, 5)
        : [
            ...titles,
            "Generated Title Option",
            "Another Title Option",
            "Third Title Option",
          ].slice(0, 3),
    description: String(
      o.description || "0:00 Hook\n\nFull description with CTA."
    ),
    tags:
      tags.length >= 5
        ? tags
        : [...tags, "content", "business", "tips", "news", "update"].slice(
            0,
            5
          ),
  };
}

function ensureSocialPost(raw: unknown) {
  const o = (raw as Record<string, unknown>) || {};

  // Legacy seed / simplified AI shape: { thread: string[] }
  if (Array.isArray(o.thread) && !o.body) {
    const lines = o.thread.map(String).filter(Boolean);
    const hashtags = Array.isArray(o.hashtags)
      ? o.hashtags.map(String).filter(Boolean)
      : ["content", "business", "tips"];
    return {
      format: "THREAD" as const,
      hook: String(o.hook || lines[0] || "Thread:"),
      body: lines.join("\n\n"),
      hashtags:
        hashtags.length >= 3
          ? hashtags.slice(0, 10)
          : [...hashtags, "news", "tips"].slice(0, 3),
      suggestedMedia: o.suggestedMedia ? String(o.suggestedMedia) : undefined,
      imagePrompt: o.imagePrompt ? String(o.imagePrompt) : undefined,
      cta: o.cta ? String(o.cta) : undefined,
    };
  }

  // Legacy seed shape: { post: string }
  if (typeof o.post === "string" && !o.body) {
    const hashtags = Array.isArray(o.hashtags)
      ? o.hashtags.map(String).filter(Boolean)
      : ["content", "business", "tips"];
    return {
      format: "POST" as const,
      hook: String(o.hook || o.post.split(/[.\n]/)[0]?.slice(0, 120) || "Insight:"),
      body: String(o.post),
      hashtags:
        hashtags.length >= 3
          ? hashtags.slice(0, 10)
          : [...hashtags, "news", "tips"].slice(0, 3),
      suggestedMedia: o.suggestedMedia ? String(o.suggestedMedia) : undefined,
      imagePrompt: o.imagePrompt ? String(o.imagePrompt) : undefined,
      cta: o.cta ? String(o.cta) : undefined,
    };
  }

  const format = ["POST", "THREAD", "CAROUSEL"].includes(String(o.format))
    ? (String(o.format) as "POST" | "THREAD" | "CAROUSEL")
    : "POST";
  const hashtags = Array.isArray(o.hashtags)
    ? o.hashtags.map(String).filter(Boolean)
    : ["content", "business", "tips"];
  return {
    format,
    hook: String(o.hook || "Quick insight:"),
    body: String(o.body || o.content || "Generated social post."),
    hashtags: hashtags.length >= 3 ? hashtags.slice(0, 10) : [...hashtags, "news", "tips"].slice(0, 3),
    suggestedMedia: o.suggestedMedia ? String(o.suggestedMedia) : undefined,
    imagePrompt: o.imagePrompt ? String(o.imagePrompt) : undefined,
    cta: o.cta ? String(o.cta) : undefined,
  };
}

function resolveVideoScriptRaw(raw: Record<string, unknown>): unknown {
  if (typeof raw.script === "string") {
    return {
      hook: String(raw.hook || "Here's what you need to know."),
      body: raw.script,
      cta: String(raw.cta || "Learn more in the description."),
    };
  }
  if (raw.script && typeof raw.script === "object") {
    return raw.script;
  }
  if (typeof raw.hook === "string" || typeof raw.body === "string") {
    return {
      hook: String(raw.hook || "Here's what you need to know."),
      body: String(raw.body || raw.script || "Content for this topic."),
      cta: String(raw.cta || "Learn more in the description."),
    };
  }
  return raw.script;
}

function sanitizePlatformContent(
  content: Record<string, unknown>,
  platforms: SocialPlatform[],
  visualStyle: string
): PlatformContent {
  const result: PlatformContent = {};
  const style = visualStyle || "clean, professional";

  for (const platform of platforms) {
    const raw = (content[platform] as Record<string, unknown> | undefined) ?? {};

    switch (platform) {
      case "youtube_short":
        result.youtube_short = {
          script: ensureScript(resolveVideoScriptRaw(raw)),
          imagePrompts: ensureScenePrompts(
            raw?.imagePrompts,
            4,
            6,
            style
          ),
          thumbnail: {
            concept: String(
              (raw?.thumbnail as Record<string, unknown>)?.concept ||
                "Bold thumbnail concept"
            ),
            prompt: String(
              (raw?.thumbnail as Record<string, unknown>)?.prompt ||
                `${style} YouTube thumbnail`
            ),
          },
          youtube: ensureYouTube(raw?.youtube),
        };
        break;
      case "youtube_long":
        result.youtube_long = {
          outline: Array.isArray(raw?.outline)
            ? (raw.outline as unknown[]).map((s: unknown) => {
                const sec = s as Record<string, unknown>;
                return {
                  section: String(sec.section || "Section"),
                  durationSec:
                    typeof sec.durationSec === "number" ? sec.durationSec : 120,
                  talkingPoints: Array.isArray(sec.talkingPoints)
                    ? sec.talkingPoints.map(String)
                    : ["Key point"],
                };
              })
            : [{ section: "Intro", durationSec: 60, talkingPoints: ["Hook"] }],
          script: String(raw?.script || "Long-form script generated."),
          brollPrompts: ensureScenePrompts(raw?.brollPrompts, 6, 12, style),
          thumbnail: {
            concept: String(
              (raw?.thumbnail as Record<string, unknown>)?.concept || "Concept"
            ),
            prompt: String(
              (raw?.thumbnail as Record<string, unknown>)?.prompt ||
                `${style} thumbnail`
            ),
          },
          youtube: ensureYouTube(raw?.youtube),
        };
        break;
      case "tiktok":
        result.tiktok = {
          script: ensureScript(raw?.script),
          onScreenText: Array.isArray(raw?.onScreenText)
            ? raw.onScreenText.map(String).slice(0, 8)
            : ["Hook text", "Key point", "CTA"],
          hashtags: Array.isArray(raw?.hashtags)
            ? raw.hashtags.map(String).slice(0, 15)
            : ["fyp", "business", "tips", "news", "content"],
          scenePrompts: ensureScenePrompts(raw?.scenePrompts, 4, 6, style),
          musicMood: raw?.musicMood ? String(raw.musicMood) : undefined,
          caption: String(raw?.caption || "Generated TikTok caption."),
        };
        break;
      case "instagram": {
        const fmt = ["REEL", "POST", "CAROUSEL", "STORY"].includes(
          String(raw?.format)
        )
          ? (String(raw?.format) as "REEL" | "POST" | "CAROUSEL" | "STORY")
          : "REEL";
        result.instagram = {
          format: fmt,
          caption: String(raw?.caption || "Generated Instagram caption."),
          hook: String(raw?.hook || "Stop scrolling."),
          hashtags: Array.isArray(raw?.hashtags)
            ? raw.hashtags.map(String).slice(0, 30)
            : ["instagram", "reels", "business", "content", "tips"],
          reelScript: raw?.reelScript
            ? ensureScript(raw.reelScript)
            : ensureScript(null),
          imagePrompt: raw?.imagePrompt ? String(raw.imagePrompt) : undefined,
        };
        break;
      }
      case "x":
        result.x = ensureSocialPost(raw);
        break;
      case "linkedin":
        result.linkedin = ensureSocialPost(raw);
        break;
      case "facebook":
        result.facebook = ensureSocialPost(raw);
        break;
    }
  }

  return result;
}

/** Normalize content loaded from DB (including legacy seed shapes) for UI and regeneration. */
export function normalizeStoredPackage(
  pkg: {
    platforms: SocialPlatform[] | string[];
    strategyNote: string;
    agentReasoning: string;
    content: unknown;
  },
  visualStyle = "clean, professional"
): ContentEpisodePayload {
  return sanitizeEpisodePayload(
    {
      strategyNote: pkg.strategyNote,
      agentReasoning: pkg.agentReasoning,
      content: pkg.content,
    },
    pkg.platforms as SocialPlatform[],
    visualStyle
  );
}

export function sanitizeEpisodePayload(
  parsed: Record<string, unknown>,
  platforms: SocialPlatform[],
  visualStyle: string
): ContentEpisodePayload {
  const content = sanitizePlatformContent(
    (parsed.content as Record<string, unknown>) || {},
    platforms,
    visualStyle
  );

  return {
    platforms,
    strategyNote: String(
      parsed.strategyNote ||
        "Content package generated based on brand context and topic."
    ),
    agentReasoning: String(
      parsed.agentReasoning ||
        parsed.reasoning ||
        "Strategic multi-platform content tailored to the brand voice."
    ),
    content,
  };
}
