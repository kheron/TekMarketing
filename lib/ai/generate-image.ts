import OpenAI from "openai";
import type { AIProvider } from "@/lib/agent/types";
import {
  DALLE3_SIZES,
  GROK_ASPECT_RATIOS,
  IMAGE_COST_ESTIMATES,
  IMAGE_PROVIDER_CONFIG,
  type ImageAspectRatio,
} from "@/lib/constants/image-generation";

export interface GeneratedImage {
  base64: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  revisedPrompt?: string;
}

export interface GenerateImageResult {
  image: GeneratedImage;
  provider: AIProvider;
  model: string;
  estimatedCostUsd: number;
}

interface GenerateImageParams {
  provider: Extract<AIProvider, "openai" | "google" | "xai">;
  apiKey: string;
  prompt: string;
  aspectRatio?: ImageAspectRatio;
}

export async function generateImage(
  params: GenerateImageParams
): Promise<GenerateImageResult> {
  const { provider, apiKey, prompt, aspectRatio = "landscape" } = params;

  if (!apiKey?.trim()) {
    throw new Error("API key is required");
  }
  if (!prompt?.trim()) {
    throw new Error("Image prompt is required");
  }

  const config = IMAGE_PROVIDER_CONFIG[provider];

  switch (provider) {
    case "openai":
      return generateOpenAIImage({
        apiKey,
        prompt: prompt.trim(),
        model: config.model,
        aspectRatio,
      });
    case "google":
      return generateGoogleImage({
        apiKey,
        prompt: prompt.trim(),
        model: config.model,
      });
    case "xai":
      return generateXAIImage({
        apiKey,
        prompt: prompt.trim(),
        model: config.model,
        aspectRatio,
      });
    default:
      throw new Error(`Image generation is not supported for ${provider}`);
  }
}

async function generateOpenAIImage({
  apiKey,
  prompt,
  model,
  aspectRatio,
}: {
  apiKey: string;
  prompt: string;
  model: string;
  aspectRatio: ImageAspectRatio;
}): Promise<GenerateImageResult> {
  const client = new OpenAI({ apiKey });
  const size = DALLE3_SIZES[aspectRatio];

  const response = await client.images.generate({
    model,
    prompt,
    n: 1,
    size,
    response_format: "b64_json",
    quality: "standard",
  });

  const item = response.data?.[0];
  if (!item?.b64_json) {
    throw new Error("OpenAI returned no image data");
  }

  return {
    image: {
      base64: item.b64_json,
      mimeType: "image/png",
      revisedPrompt: item.revised_prompt ?? undefined,
    },
    provider: "openai",
    model,
    estimatedCostUsd: IMAGE_COST_ESTIMATES[model] ?? 0.04,
  };
}

async function generateGoogleImage({
  apiKey,
  prompt,
  model,
}: {
  apiKey: string;
  prompt: string;
  model: string;
}): Promise<GenerateImageResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google image generation failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];

  for (const part of parts) {
    const inline = part.inlineData ?? part.inline_data;
    if (!inline?.data) continue;

    const mimeType = (inline.mimeType ?? inline.mime_type ?? "image/png") as
      | "image/png"
      | "image/jpeg"
      | "image/webp";

    return {
      image: { base64: inline.data, mimeType },
      provider: "google",
      model,
      estimatedCostUsd: IMAGE_COST_ESTIMATES[model] ?? 0.03,
    };
  }

  throw new Error("Google returned no image data. Try OpenAI (DALL·E 3) if this persists.");
}

async function generateXAIImage({
  apiKey,
  prompt,
  model,
  aspectRatio,
}: {
  apiKey: string;
  prompt: string;
  model: string;
  aspectRatio: ImageAspectRatio;
}): Promise<GenerateImageResult> {
  const response = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      aspect_ratio: GROK_ASPECT_RATIOS[aspectRatio],
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`xAI image generation failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const item = data.data?.[0];

  if (item?.b64_json) {
    return {
      image: {
        base64: item.b64_json,
        mimeType: "image/png",
        revisedPrompt: item.revised_prompt ?? undefined,
      },
      provider: "xai",
      model,
      estimatedCostUsd: IMAGE_COST_ESTIMATES[model] ?? 0.05,
    };
  }

  if (item?.url) {
    const imageResponse = await fetch(item.url);
    if (!imageResponse.ok) {
      throw new Error("Failed to download image from xAI URL");
    }
    const buffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType =
      imageResponse.headers.get("content-type")?.split(";")[0] ?? "image/png";

    return {
      image: {
        base64,
        mimeType: mimeType as GeneratedImage["mimeType"],
        revisedPrompt: item.revised_prompt ?? undefined,
      },
      provider: "xai",
      model,
      estimatedCostUsd: IMAGE_COST_ESTIMATES[model] ?? 0.05,
    };
  }

  throw new Error("xAI returned no image data");
}
