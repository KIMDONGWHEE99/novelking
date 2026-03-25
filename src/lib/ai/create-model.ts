import { createAnthropic } from "@ai-sdk/anthropic";

const DEFAULT_MODEL = "claude-sonnet-4-6-20250514";

// 유효한 Anthropic 모델인지 확인
function isValidAnthropicModel(model: string): boolean {
  return model.startsWith("claude-");
}

/**
 * 서버 환경변수에서 API 키를 읽어 LLM 모델 인스턴스를 생성합니다.
 * 현재 Anthropic만 지원합니다.
 * provider가 anthropic이 아니어도 Anthropic으로 강제 전환합니다.
 */
export function createLlmModel(provider: string, model: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다.");
  }
  const anthropic = createAnthropic({ apiKey });

  // 유효한 Claude 모델이 아니면 기본값 사용 (gpt-4o-mini 등 구 데이터 방어)
  const safeModel = model && isValidAnthropicModel(model) ? model : DEFAULT_MODEL;
  return anthropic(safeModel);
}
