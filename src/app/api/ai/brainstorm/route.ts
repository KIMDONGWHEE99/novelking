import { streamText } from "ai";
import { createLlmModel } from "@/lib/ai/create-model";
import { validateAiRequest, logAiUsage } from "@/lib/ai/auth-middleware";

export async function POST(req: Request) {
  // 인증 + 크레딧 검사
  const auth = await validateAiRequest();
  if (auth instanceof Response) return auth;

  const { messages, context, provider, model } = await req.json();

  let llmModel;
  try {
    llmModel = createLlmModel(provider, model);
  } catch (e: unknown) {
    return new Response(e instanceof Error ? e.message : "모델 생성 실패", { status: 400 });
  }

  await logAiUsage(auth.userId, "brainstorm", model, messages?.[messages.length - 1]?.content?.slice(0, 500));

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
