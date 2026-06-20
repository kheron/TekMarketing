import type { AIProvider, BusinessProfile, SocialPlatform } from "@/lib/agent/types";
import { ContentEpisodePayloadSchema } from "@/lib/agent/types";
import { buildBusinessContextBlock } from "@/lib/agent/context";
import {
  buildContentGenerationSystemPrompt,
  buildContentGenerationUserPrompt,
} from "@/lib/agent/prompts/content-generation";
import { sanitizeEpisodePayload } from "@/lib/agent/sanitize-episode";
import { callAI } from "@/lib/ai/call-ai";
import { safeParseJsonResponse } from "@/lib/ai/parse-response";

export interface GenerateEpisodeParams {
  provider: AIProvider;
  business: BusinessProfile;
  topic: string;
  platforms: SocialPlatform[];
}

export interface GenerateEpisodeResult {
  payload: ReturnType<typeof sanitizeEpisodePayload>;
  model: string;
  usage: Awaited<ReturnType<typeof callAI>>["usage"];
}

export async function generateEpisode(
  params: GenerateEpisodeParams
): Promise<GenerateEpisodeResult> {
  const { provider, business, topic, platforms } = params;

  if (!topic.trim()) {
    throw new Error("Topic is required");
  }
  if (platforms.length === 0) {
    throw new Error("At least one platform must be selected");
  }

  const contextBlock = buildBusinessContextBlock(business);
  const systemPrompt = buildContentGenerationSystemPrompt(business.name);
  const userPrompt = buildContentGenerationUserPrompt(
    contextBlock,
    topic.trim(),
    platforms
  );

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await callAI({
        provider,
        purpose: "generate_episode",
        temperature: 0.7,
        jsonMode: true,
        maxTokens: 8192,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              attempt > 0
                ? `${userPrompt}\n\nIMPORTANT: Your previous response was invalid JSON. Return ONLY valid JSON matching the schema.`
                : userPrompt,
          },
        ],
      });

      const parsed = safeParseJsonResponse<Record<string, unknown>>(
        result.content
      );

      if (!parsed) {
        throw new Error("Failed to parse JSON from AI response");
      }

      const sanitized = sanitizeEpisodePayload(
        parsed,
        platforms,
        business.visualStyle || "clean, professional"
      );

      const validated = ContentEpisodePayloadSchema.safeParse(sanitized);

      if (!validated.success) {
        console.error("Validation failed after sanitization:", validated.error);
        if (attempt === 0) continue;
        return {
          payload: sanitized,
          model: result.model,
          usage: result.usage,
        };
      }

      return {
        payload: validated.data,
        model: result.model,
        usage: result.usage,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === 0) continue;
    }
  }

  throw lastError ?? new Error("Content generation failed");
}
