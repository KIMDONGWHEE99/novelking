import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { buildWriteSystemPrompt } from "@/lib/ai/prompts/write";

export async function POST(req: Request) {
  const { messages, contextBlock, provider, model, apiKey, customPrompt, writingStyle, stylePrompt } = await req.json();

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

  const styleNote = stylePrompt
    ? `\n\n=== 문체 스타일: ${writingStyle} ===\n${stylePrompt}`
    : writingStyle
      ? `\n\n문체 스타일: ${writingStyle}`
      : "";
  const customNote = customPrompt ? `\n\n사용자 추가 지시: ${customPrompt}` : "";
  const systemPrompt = buildWriteSystemPrompt(contextBlock || undefined) + styleNote + customNote;

  const result = streamText({
    model: llmModel,
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
