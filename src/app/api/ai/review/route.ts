import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export async function POST(req: NextRequest) {
  const { content, provider, model, apiKey } = await req.json();

  if (!apiKey || !content) {
    return new Response("Missing required fields", { status: 400 });
  }

  const llm =
    provider === "anthropic"
      ? createAnthropic({ apiKey })(model)
      : createOpenAI({ apiKey })(model);

  const result = streamText({
    model: llm,
    system: `당신은 한국 출판 업계에서 20년 경력의 베테랑 편집자입니다.
소설 원고를 검토하고 상업 출판 수준에 맞는 피드백을 제공합니다.

아래 5가지 항목을 각각 평가하고, 구체적인 개선 제안을 해주세요:

1. **문장력** (맞춤법, 문법, 어색한 표현, 불필요한 반복)
2. **몰입도** (독자가 계속 읽고 싶어지는지, 장면의 생동감)
3. **캐릭터** (대화가 자연스러운지, 캐릭터 목소리가 구분되는지)
4. **구성** (장면 전환, 템포, 정보 전달 타이밍)
5. **상업성** (대중 독자에게 매력적인지, 장르 관습 충족)

각 항목은 10점 만점으로 점수를 매기고, 가장 중요한 수정 사항 3가지를 제시하세요.
마지막에 총평을 2-3문장으로 작성하세요.`,
    prompt: `아래 소설 원고를 검토해주세요:\n\n${content}`,
  });

  return result.toTextStreamResponse();
}
