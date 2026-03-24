import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import {
  buildTransformSystemPrompt,
  buildFullTransformSystemPrompt,
  TRANSFORM_INSTRUCTIONS,
} from "@/lib/ai/prompts/transform";

export async function POST(req: Request) {
  const {
    text,
    instruction,
    transformType,
    context,
    provider,
    model,
    apiKey,
    mode,
    contextBlock,
    customPrompt,
    writingStyle,
    stylePrompt,
  } = await req.json();

  if (!apiKey) {
    return new Response("API 키가 설정되지 않았습니다.", { status: 400 });
  }

  if (!text) {
    return new Response("변환할 텍스트가 없습니다.", { status: 400 });
  }

  // LLM 클라이언트 생성
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
