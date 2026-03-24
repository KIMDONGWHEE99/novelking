import { streamText } from "ai";
import { createLlmModel } from "@/lib/ai/create-model";
import { validateAiRequest, logAiUsage } from "@/lib/ai/auth-middleware";
import {
  buildTransformSystemPrompt,
  buildFullTransformSystemPrompt,
  TRANSFORM_INSTRUCTIONS,
} from "@/lib/ai/prompts/transform";

export async function POST(req: Request) {
  // 인증 + 크레딧 검사
  const auth = await validateAiRequest();
  if (auth instanceof Response) return auth;

  const {
    text,
    instruction,
    transformType,
    context,
    provider,
    model,
    mode,
    contextBlock,
    customPrompt,
    writingStyle,
    stylePrompt,
  } = await req.json();

  if (!text) {
    return new Response("변환할 텍스트가 없습니다.", { status: 400 });
  }

  let llmModel;
  try {
    llmModel = createLlmModel(provider, model);
  } catch (e: unknown) {
    return new Response(e instanceof Error ? e.message : "모델 생성 실패", { status: 400 });
  }

  // 사용 로그 기록
  await logAiUsage(auth.userId, "transform", model, text.slice(0, 200));

  // 커스텀 프롬프트 접미사
  const styleNote = stylePrompt
    ? `\n\n=== 문체 스타일: ${writingStyle} ===\n${stylePrompt}`
    : writingStyle
      ? `\n\n문체 스타일: ${writingStyle}`
      : "";
  const customNote = customPrompt ? `\n\n사용자 추가 지시: ${customPrompt}` : "";

  // 전체 챕터 변환 모드
  if (mode === "fullChapter") {
    const systemPrompt = buildFullTransformSystemPrompt(contextBlock || undefined) + styleNote + customNote;
    const result = streamText({
      model: llmModel,
      system: systemPrompt,
      prompt: `다음 초안 전체를 상업적 수준의 소설로 변환해주세요:\n\n${text}`,
    });
    return result.toTextStreamResponse();
  }

  // 기존 선택 텍스트 변환 모드
  const systemPrompt = buildTransformSystemPrompt(context) + styleNote + customNote;
  const userInstruction =
    instruction || TRANSFORM_INSTRUCTIONS[transformType] || TRANSFORM_INSTRUCTIONS.novel;

  const result = streamText({
    model: llmModel,
    system: systemPrompt,
    prompt: `원문:\n${text}\n\n지시사항: ${userInstruction}`,
  });

  return result.toTextStreamResponse();
}
