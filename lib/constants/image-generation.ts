import type { AIProvider } from "@/lib/agent/types";
import { getApiKey } from "@/lib/settings/api-key";

export type ImageAspectRatio = "square" | "landscape" | "portrait";

export interface ImageProviderConfig { provider: AIProvider; model: string; label: string; }

export const IMAGE_CAPABLE_PROVIDERS: AIProvider[] = ["openai", "google", "xai"];

export const IMAGE_PROVIDER_CONFIG = {
  openai: { provider: "openai", model: "dall-e-3", label: "DALL·E 3" },
  google: { provider: "google", model: "gemini-2.0-flash-preview-image-generation", label: "Gemini Image" },
  xai: { provider: "xai", model: "grok-imagine-image-quality", label: "Grok Imagine" },
} as const;

export const DALLE3_SIZES = { square: "1024x1024", landscape: "1792x1024", portrait: "1024x1792" } as const;
export const GROK_ASPECT_RATIOS = { square: "1:1", landscape: "16:9", portrait: "9:16" } as const;
export const IMAGE_COST_ESTIMATES = { "dall-e-3": 0.04, "gemini-2.0-flash-preview-image-generation": 0.03, "grok-imagine-image-quality": 0.05, "grok-imagine-image": 0.02 };

export function getImageCostEstimate(model: string, fallback = 0.04): number {
  return model in IMAGE_COST_ESTIMATES
    ? IMAGE_COST_ESTIMATES[model as keyof typeof IMAGE_COST_ESTIMATES]
    : fallback;
}

export function getImageProviderLabel(provider: AIProvider): string | null {
  if (!supportsImageGeneration(provider)) return null;
  return IMAGE_PROVIDER_CONFIG[provider as keyof typeof IMAGE_PROVIDER_CONFIG].label;
}

export function supportsImageGeneration(provider: AIProvider): boolean {
  return IMAGE_CAPABLE_PROVIDERS.includes(provider);
}

type ImageProvider = Extract<AIProvider, "openai" | "google" | "xai">;

export async function resolveImageProvider(preferred: AIProvider): Promise<ImageProvider | null> {
  const candidates: AIProvider[] = [preferred, "xai", "openai", "google"];
  const seen = new Set<AIProvider>();
  for (const provider of candidates) {
    if (seen.has(provider) || !supportsImageGeneration(provider)) continue;
    seen.add(provider);
    const apiKey = await getApiKey(provider);
    if (apiKey) return provider as ImageProvider;
  }
  return null;
}