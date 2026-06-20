import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider } from "@/lib/agent/types";
import { getDefaultModel } from "@/lib/constants/ai-providers";
import { estimateCost, type TokenUsage } from "@/lib/ai/usage";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProviderCallResult {
  content: string;
  model: string;
  provider: AIProvider;
  usage: TokenUsage & { estimatedCostUsd?: number };
}

interface CallProviderParams {
  provider: AIProvider;
  apiKey: string;
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
}

export async function callProvider(
  params: CallProviderParams
): Promise<ProviderCallResult> {
  const {
    provider,
    apiKey,
    messages,
    model = getDefaultModel(provider),
    temperature = 0.4,
    jsonMode = false,
    maxTokens = 4096,
  } = params;

  if (!apiKey?.trim()) {
    throw new Error("API key is required");
  }

  switch (provider) {
    case "openai":
      return callOpenAI({ apiKey, messages, model, temperature, jsonMode, maxTokens });
    case "anthropic":
      return callAnthropic({ apiKey, messages, model, temperature, jsonMode, maxTokens });
    case "xai":
      return callXAI({ apiKey, messages, model, temperature, jsonMode, maxTokens });
    case "google":
      return callGoogle({ apiKey, messages, model, temperature, jsonMode, maxTokens });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function callOpenAI({
  apiKey,
  messages,
  model: modelParam,
  temperature,
  jsonMode,
  maxTokens = 4096,
}: Omit<CallProviderParams, "provider"> & { apiKey: string }): Promise<ProviderCallResult> {
  const model = modelParam ?? getDefaultModel("openai");
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    ...(jsonMode ? { response_format: { type: "json_object" as const } } : {}),
  });

  const content = response.choices[0]?.message?.content ?? "";
  const usage = normalizeUsage(response.usage);

  return {
    content,
    model,
    provider: "openai",
    usage: {
      ...usage,
      estimatedCostUsd: usage.totalTokens
        ? estimateCost(model, usage.totalTokens)
        : undefined,
    },
  };
}

async function callAnthropic({
  apiKey,
  messages,
  model: modelParam,
  temperature,
  jsonMode,
  maxTokens = 4096,
}: Omit<CallProviderParams, "provider"> & { apiKey: string }): Promise<ProviderCallResult> {
  const model = modelParam ?? getDefaultModel("anthropic");
  const client = new Anthropic({ apiKey });

  const systemMessage = messages.find((m) => m.role === "system")?.content;
  const chatMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: jsonMode
      ? `${systemMessage ?? ""}\n\nRespond with valid JSON only.`.trim()
      : systemMessage,
    messages: chatMessages.length > 0 ? chatMessages : [{ role: "user", content: "Hello" }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const content = textBlock && "text" in textBlock ? textBlock.text : "";

  const totalTokens =
    (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0);

  return {
    content,
    model,
    provider: "anthropic",
    usage: {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens,
      estimatedCostUsd: estimateCost(model, totalTokens),
    },
  };
}

async function callXAI({
  apiKey,
  messages,
  model: modelParam,
  temperature,
  jsonMode,
  maxTokens = 4096,
}: Omit<CallProviderParams, "provider"> & { apiKey: string }): Promise<ProviderCallResult> {
  const model = modelParam ?? getDefaultModel("xai");
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`xAI request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const usage = normalizeUsage(data.usage);

  return {
    content,
    model,
    provider: "xai",
    usage: {
      ...usage,
      estimatedCostUsd: usage.totalTokens
        ? estimateCost(model, usage.totalTokens)
        : undefined,
    },
  };
}

async function callGoogle({
  apiKey,
  messages,
  model: modelParam,
  temperature,
  jsonMode,
  maxTokens = 8192,
}: Omit<CallProviderParams, "provider"> & { apiKey: string }): Promise<ProviderCallResult> {
  const model = modelParam ?? getDefaultModel("google");

  const systemMessage = messages.find((m) => m.role === "system")?.content;
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents:
      contents.length > 0
        ? contents
        : [{ role: "user", parts: [{ text: "Hello" }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };

  if (systemMessage) {
    body.systemInstruction = {
      parts: [
        {
          text: jsonMode
            ? `${systemMessage}\n\nRespond with valid JSON only.`
            : systemMessage,
        },
      ],
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google AI request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content =
    data.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("") ?? "";

  const meta = data.usageMetadata;
  const promptTokens = meta?.promptTokenCount;
  const completionTokens = meta?.candidatesTokenCount;
  const totalTokens =
    meta?.totalTokenCount ?? (promptTokens ?? 0) + (completionTokens ?? 0);

  return {
    content,
    model,
    provider: "google",
    usage: {
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd: totalTokens
        ? estimateCost(model, totalTokens)
        : undefined,
    },
  };
}

function normalizeUsage(
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
  } | null
): TokenUsage {
  if (!usage) return {};

  const promptTokens = usage.prompt_tokens ?? usage.input_tokens;
  const completionTokens = usage.completion_tokens ?? usage.output_tokens;
  const totalTokens =
    usage.total_tokens ?? (promptTokens ?? 0) + (completionTokens ?? 0);

  return { promptTokens, completionTokens, totalTokens };
}
