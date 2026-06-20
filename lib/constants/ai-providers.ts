import type { AIProvider } from "@/lib/agent/types";

export interface AIProviderConfig {
  id: AIProvider;
  label: string;
  description: string;
  defaultModel: string;
  models: string[];
  keyPlaceholder: string;
  keyUrl: string;
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  { id: "openai", label: "OpenAI", description: "GPT-4o and other OpenAI models", defaultModel: "gpt-4o", models: ["gpt-4o", "gpt-4o-mini"], keyPlaceholder: "sk-...", keyUrl: "https://platform.openai.com/api-keys" },
  { id: "anthropic", label: "Anthropic", description: "Claude Sonnet and other Anthropic models", defaultModel: "claude-sonnet-4-20250514", models: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"], keyPlaceholder: "sk-ant-...", keyUrl: "https://console.anthropic.com/settings/keys" },
  { id: "xai", label: "xAI (Grok)", description: "Grok models via xAI API", defaultModel: "grok-3", models: ["grok-3", "grok-3-latest"], keyPlaceholder: "xai-...", keyUrl: "https://console.x.ai/" },
  { id: "google", label: "Google (Gemini)", description: "Gemini models via Google AI Studio", defaultModel: "gemini-2.0-flash", models: ["gemini-2.0-flash", "gemini-2.5-flash-preview-05-20", "gemini-1.5-pro"], keyPlaceholder: "AIza...", keyUrl: "https://aistudio.google.com/apikey" },
];

export const AI_PROVIDER_MAP = Object.fromEntries(AI_PROVIDERS.map((p) => [p.id, p])) as Record<AIProvider, AIProviderConfig>;

export function getDefaultModel(provider: AIProvider): string {
  return AI_PROVIDER_MAP[provider].defaultModel;
}