import type { LlmModel } from "@/types/ai";

export interface LlmProviderInfo {
  id: string;
  name: string;
  models: LlmModel[];
}

// 지원하는 LLM 제공자 목록
export const PROVIDERS: LlmProviderInfo[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
      { id: "gpt-4.1", name: "GPT-4.1", provider: "openai" },
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", provider: "openai" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    models: [
      { id: "claude-opus-4-6-20250701", name: "Claude Opus 4.6", provider: "anthropic" },
      { id: "claude-sonnet-4-6-20250514", name: "Claude Sonnet 4.6", provider: "anthropic" },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", provider: "anthropic" },
    ],
  },
];

export function getProvider(id: string): LlmProviderInfo | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function getModelsForProvider(providerId: string): LlmModel[] {
  return getProvider(providerId)?.models ?? [];
}

export function getAllModels(): LlmModel[] {
  return PROVIDERS.flatMap((p) => p.models);
}
