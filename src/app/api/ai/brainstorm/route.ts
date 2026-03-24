import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

export async function POST(req: Request) {
  const { messages, context, provider, model, apiKey } = await req.json();

  if (!apiKey) {
    return new Response("API 키가 설정되지 않았습니다.", { status: 400 });
  }

  let llmModel;
  if (provider === "openai") {
    const openai = createOpenAI({ apiKey });
    llmModel = openai(model || "gpt-4o-mini");
  } else if (provider === "anthropic") {
    const anthropic = createAnthropic({ apiKey });
    llmModel = anthropic(model || "claude-sonnet-4-5-20250514");
  } else {
    return new Response("지원하지 않는 AI 제공자입니다.", { status: 400 });
  }

  let systemPrompt = `당신은 소설 창작을 돕는 브레인스토밍 파트너입니다.
사용자와 함께 소설의 아이디어를 발전시키고, 줄거리를 구상하고, 캐릭터를 개발하는 것을 도와주세요.

역할:
- 창의적인 아이디어를 제안하세요
- 사용자의 아이디어에 건설적인 피드백을 주세요
- 플롯의 허점이나 개선점을 지적하세요
- 캐릭터의 동기와 성격에 대해 깊이 있는 질문을 하세요
- 장르의 관습과 독자 기대를 고려한 조언을 해주세요

한국어로 대화해주세요.`;

  if (context) {
    if (context.genre) systemPrompt += `\n\n현재 프로젝트 장르: ${context.genre}`;
    if (context.title) systemPrompt += `\n소설 제목: ${context.title}`;
    if (context.description)
      systemPrompt += `\n소설 개요: ${context.description}`;
  }

  const result = streamText({
    model: llmModel,
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
