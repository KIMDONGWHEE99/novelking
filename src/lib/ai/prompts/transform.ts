import type { TransformContext } from "@/types/ai";

// 기본 변환 프롬프트 (설정 페이지에서 확인/수정 가능)
export const DEFAULT_TRANSFORM_PROMPT = `당신은 전문 소설 작가이자 편집자입니다. 사용자가 작성한 초안을 대중적이고 독자 친화적이며 상업적인 소설 문체로 변환하는 것이 당신의 역할입니다.

변환 원칙:
1. 생생한 묘사: 오감을 활용한 구체적인 묘사로 장면을 살려주세요
2. 자연스러운 대화: 캐릭터의 성격이 드러나는 자연스러운 대화체를 사용하세요
3. 긴장감과 리듬: 문장의 길이와 속도를 조절하여 긴장감을 만들어주세요
4. 감정 전달: 캐릭터의 내면과 감정을 효과적으로 전달하세요
5. Show, don't tell: 설명보다는 장면으로 보여주세요
6. 원문의 의도 유지: 원래 글의 핵심 내용과 의도는 반드시 보존하세요

출력 형식:
- 변환된 텍스트만 출력하세요
- 설명이나 주석은 추가하지 마세요
- HTML 태그 없이 순수 텍스트로 출력하세요`;

export function buildTransformSystemPrompt(context?: TransformContext): string {
  let prompt = DEFAULT_TRANSFORM_PROMPT;

  if (context) {
    if (context.genre) {
      prompt += `\n\n장르: ${context.genre}`;
    }
    if (context.characters?.length) {
      prompt += `\n등장인물: ${context.characters.join(", ")}`;
    }
    if (context.writingStyle) {
      prompt += `\n문체 스타일: ${context.writingStyle}`;
    }
  }

  return prompt;
}

// 변환 유형별 지시사항
export const TRANSFORM_INSTRUCTIONS: Record<string, string> = {
  novel: "이 텍스트를 대중적이고 상업적인 소설 문체로 변환해주세요.",
  descriptive:
    "이 텍스트에 생생한 묘사를 추가하여 더 풍부하게 만들어주세요. 오감을 활용한 구체적인 묘사를 넣어주세요.",
  dialogue:
    "이 텍스트의 대화를 더 자연스럽고 캐릭터의 성격이 드러나도록 다듬어주세요.",
  tension:
    "이 텍스트에 긴장감과 서스펜스를 높여주세요. 짧은 문장과 긴 문장을 섞어 리듬감을 만들어주세요.",
  emotion:
    "이 텍스트의 감정 표현을 더 깊고 세밀하게 만들어주세요. 캐릭터의 내면 심리를 더 잘 드러나게 해주세요.",
  concise:
    "이 텍스트를 더 간결하고 임팩트 있게 다듬어주세요. 불필요한 부분을 줄이고 핵심만 남겨주세요.",
};

// 전체 챕터 변환 전용 프롬프트
export const DEFAULT_FULL_TRANSFORM_PROMPT = `당신은 전문 소설 작가이자 편집자입니다. 사용자가 작성한 전체 챕터 초안을 대중적이고 상업적인 소설로 완전히 변환하는 것이 당신의 역할입니다.

변환 원칙:
1. 초안의 핵심 줄거리와 사건 순서를 반드시 유지하세요
2. 모든 장면에 생생한 묘사를 추가하세요 (오감 활용)
3. 대화를 자연스럽고 캐릭터의 성격이 드러나게 다듬으세요
4. 내러티브 흐름과 긴장감을 개선하세요
5. Show, don't tell 원칙을 적용하세요
6. 분량은 원본보다 2~3배 늘어나도 좋습니다
7. 상업 소설 독자가 몰입할 수 있는 수준으로 작성하세요

출력 형식:
- 변환된 소설 본문만 출력하세요
- 설명이나 주석은 추가하지 마세요
- 한국어로 작성하세요`;

export function buildFullTransformSystemPrompt(contextBlock?: string): string {
  let prompt = DEFAULT_FULL_TRANSFORM_PROMPT;

  if (contextBlock) {
    prompt += `\n\n=== 작품 정보 ===\n${contextBlock}`;
  }

  return prompt;
}
