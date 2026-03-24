import { generateText } from "ai";
import { createLlmModel } from "@/lib/ai/create-model";
import { validateAiRequest, logAiUsage } from "@/lib/ai/auth-middleware";
import { buildCharacterGeneratePrompt } from "@/lib/ai/prompts/templates/character";

export async function POST(req: Request) {
  // 인증 + 크레딧 검사
  const auth = await validateAiRequest();
  if (auth instanceof Response) return auth;

  const { type, input, genre, provider, model } = await req.json();

  let llmModel;
  try {
    llmModel = createLlmModel(provider, model);
  } catch (e: unknown) {
    return new Response(e instanceof Error ? e.message : "모델 생성 실패", { status: 400 });
  }

  await logAiUsage(auth.userId, `template-${type}`, model, input?.slice(0, 200));

  let systemPrompt: string;
  if (type === "character") {
    systemPrompt = buildCharacterGeneratePrompt(genre);
  } else {
    return new Response("지원하지 않는 템플릿 유형입니다.", { status: 400 });
  }

  const result = await generateText({
    model: llmModel,
    system: systemPrompt,
    prompt: input,
  });

  return Response.json({ content: result.text });
}
