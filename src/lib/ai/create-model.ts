import { createAnthropic } from "@ai-sdk/anthropic";

/**
 * 서버 환경변수에서 API 키를 읽어 LLM 모델 인스턴스를 생성합니다.
 * 현재 Anthropic만 지원합니다.
 */
export function createLlmModel(provider: string, model: string) {
  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다.");
    }
    const anthropic = createAnthropic({ apiKey });
    return anthropic(model || "claude-sonnet-4-6-20250514");
  }

  throw new Error(
    `'${provider}'는 현재 지원하지 않는 AI 제공자입니다. Anthropic만 사용 가능합니다.`
  );
}
