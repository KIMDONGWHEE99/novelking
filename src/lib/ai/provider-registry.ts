import type { LlmModel } from "@/types/ai";

export interface LlmProviderInfo {
  id: string;
  name: string;
  models: LlmModel[];
}

// 지원하는 LLM 제공자 목록 (현재 Anthropic만 서버 키 지원)
export const PROVIDERS: LlmProviderInfo[] = [
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
