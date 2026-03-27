import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createLlmModel } from "@/lib/ai/create-model";
import { validateAdmin } from "@/lib/ai/admin-auth";

export const maxDuration = 60;

// 프롬프트 테스트 API
export async function POST(req: NextRequest) {
  const auth = await validateAdmin();
  if (auth instanceof Response) return auth;

  const { systemPrompt, userPrompt, model } = await req.json();

  if (!systemPrompt) {
    return new Response(JSON.stringify({ error: "시스템 프롬프트가 필요합니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let llm;
  try {
    llm = createLlmModel("anthropic", model || "claude-haiku-4-5-20251001");
  } catch (e: unknown) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "모델 생성 실패" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const result = streamText({
      model: llm,
      system: systemPrompt,
      prompt: userPrompt || "테스트 입력입니다.",
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
