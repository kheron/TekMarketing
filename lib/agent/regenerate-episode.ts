import type {
  AIProvider,
  BusinessProfile,
  ContentEpisodePayload,
  PlatformContent,
  SocialPlatform,
} from "@/lib/agent/types";
import { buildBusinessContextBlock } from "@/lib/agent/context";
import { sanitizeEpisodePayload } from "@/lib/agent/sanitize-episode";
import { getPlatformLabel } from "@/lib/constants/platforms";
import { callAI } from "@/lib/ai/call-ai";
import { safeParseJsonResponse } from "@/lib/ai/parse-response";

export interface RegenerateEpisodeParams {
  provider: AIProvider;
  business: BusinessProfile;
  topic: string;
  platform: SocialPlatform;
  currentPayload: ContentEpisodePayload;
  feedback: string;
}

export interface RegenerateEpisodeResult {
  payload: ContentEpisodePayload;
  model: string;
  usage: Awaited<ReturnType<typeof callAI>>["usage"];
}

export async function regenerateEpisodeSection(
  params: RegenerateEpisodeParams
): Promise<RegenerateEpisodeResult> {
  const {
    provider,
    business,
    topic,
    platform,
    currentPayload,
    feedback,
  } = params;

  const contextBlock = buildBusinessContextBlock(business);
  const platformLabel = getPlatformLabel(platform);
  const currentContent = currentPayload.content[platform];

  const systemPrompt = `You are a senior content strategist for ${business.name}.
You are regenerating content for ${platformLabel} based on human feedback.
Return valid JSON only.`;

  const userPrompt = `BRAND CONTEXT:
${contextBlock}

TOPIC: ${topic}

CURRENT ${platformLabel.toUpperCase()} CONTENT:
${JSON.stringify(currentContent, null, 2)}

HUMAN FEEDBACK:
"${feedback}"

Return a JSON object with EXACTLY this structure:
{
  "agentReasoning": "Explain what you changed and why based on the feedback",
  "content": {
    "${platform}": { ... regenerated content for this platform only ... }
  }
}

Only include the "${platform}" key inside content. Improve the content based on feedback while staying on-brand.`;

  const result = await callAI({
    provider,
    purpose: "regenerate_episode",
    temperature: 0.7,
    jsonMode: true,
    maxTokens: 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const parsed = safeParseJsonResponse<{
    agentReasoning?: string;
    content?: PlatformContent;
  }>(result.content);

  if (!parsed?.content?.[platform]) {
    throw new Error("Failed to parse regeneration response");
  }

  const mergedContent: PlatformContent = {
    ...currentPayload.content,
    [platform]: parsed.content[platform],
  };

  const sanitized = sanitizeEpisodePayload(
    {
      strategyNote: currentPayload.strategyNote,
      agentReasoning:
        parsed.agentReasoning ||
        `Regenerated ${platformLabel} based on feedback: ${feedback}`,
      content: mergedContent,
    },
    currentPayload.platforms,
    business.visualStyle || "clean, professional"
  );

  return {
    payload: sanitized,
    model: result.model,
    usage: result.usage,
  };
}
