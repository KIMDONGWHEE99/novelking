import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { buildCharacterGeneratePrompt } from "@/lib/ai/prompts/templates/character";

export async function POST(req: Request) {
  const { type, input, genre, provider, model, apiKey } = await req.json();

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
