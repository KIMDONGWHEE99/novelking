import { streamText } from "ai";
import { createLlmModel } from "@/lib/ai/create-model";
import { validateAiRequest, logAiUsage } from "@/lib/ai/auth-middleware";
import { buildWriteSystemPrompt } from "@/lib/ai/prompts/write";

export async function POST(req: Request) {
  // 인증 + 크레딧 검사
  const auth = await validateAiRequest();
  if (auth instanceof Response) return auth;

  const { messages, contextBlock, provider, model, customPrompt, writingStyle, stylePrompt, targetWordCount } = await req.json();

  let llmModel;
  try {
    llmModel = createLlmModel(provider, model);
  } catch (e: unknown) {
    return new Response(e instanceof Error ? e.message : "모델 생성 실패", { status: 400 });
  }

  await logAiUsage(auth.userId, "write", model);

  const styleNote = stylePrompt
    ? `\n\n=== 문체 스타일: ${writingStyle} ===\n${stylePrompt}`
    : writingStyle
      ? `\n\n문체 스타일: ${writingStyle}`
      : "";
  const customNote = customPrompt ? `\n\n사용자 추가 지시: ${customPrompt}` : "";
  const systemPrompt = buildWriteSystemPrompt(contextBlock || undefined, targetWordCount) + styleNote + customNote;

  const result = streamText({
    model: llmModel,
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
