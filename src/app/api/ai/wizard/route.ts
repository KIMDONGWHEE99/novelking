import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createLlmModel } from "@/lib/ai/create-model";
import { validateAiRequest, logAiUsage } from "@/lib/ai/auth-middleware";
import { getGenreGuideline } from "@/lib/ai/prompts/genre-guidelines";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // 인증 + 크레딧 검사
  const auth = await validateAiRequest();
  if (auth instanceof Response) return auth;

  const { step, idea, genre, previousResults, provider, model, feedback, currentResult, characterIndex } =
    await req.json();

  if (!idea) {
    return new Response(JSON.stringify({ error: "아이디어를 입력해주세요." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let llm;
  try {
    llm = createLlmModel(provider, model);
  } catch (e: unknown) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "모델 생성 실패" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // revise 모드 감지 (예: "synopsis-revise" → baseStep="synopsis")
  const isRevise = step.endsWith("-revise");
  const isSingleCharacter = step === "characters-single";
  const baseStep = isRevise ? step.replace("-revise", "") : (isSingleCharacter ? "characters" : step);

  // 장르별 전문 가이드라인
  const genreGuide = getGenreGuideline(genre, baseStep as "synopsis" | "characters" | "world" | "plot");

  const prompts: Record<string, string> = {
    synopsis: `당신은 베스트셀러 소설 기획 전문가입니다.

사용자의 아이디어: "${idea}"
장르: ${genre || "미정"}
${genreGuide}

이 아이디어를 바탕으로 상업적으로 성공할 수 있는 소설 시놉시스를 작성하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "소설 제목",
  "logline": "한 줄 요약 (1-2문장)",
  "synopsis": "3-5문단의 전체 줄거리 요약",
  "themes": ["테마1", "테마2", "테마3"],
  "targetAudience": "목표 독자층",
  "estimatedChapters": 10
}`,

    characters: `당신은 소설 캐릭터 설계 전문가입니다.

소설 정보:
- 제목: ${previousResults?.title || "미정"}
- 시놉시스: ${previousResults?.synopsis || idea}
- 장르: ${genre || "미정"}
${genreGuide}

이 소설에 필요한 주요 등장인물 3-5명을 설계하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "characters": [
    {
      "name": "캐릭터 이름",
      "role": "주인공/조력자/적대자/연인/멘토 중 하나",
      "description": "2-3문장의 캐릭터 설명",
      "traits": [
        { "key": "외모", "value": "외모 설명" },
        { "key": "성격", "value": "성격 설명" },
        { "key": "목표", "value": "캐릭터의 목표" }
      ]
    }
  ]
}`,

    world: `당신은 소설 세계관 설계 전문가입니다.

소설 정보:
- 제목: ${previousResults?.title || "미정"}
- 시놉시스: ${previousResults?.synopsis || idea}
- 장르: ${genre || "미정"}
${genreGuide}

이 소설의 세계관 설정을 만들어주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "worldElements": [
    {
      "type": "setting",
      "title": "배경 설정 이름",
      "content": "상세 설명"
    }
  ]
}

type은 setting(배경), location(장소), magic-system(마법/능력), culture(문화), history(역사) 중 선택하세요. 2-4개 생성하세요.`,

    plot: `당신은 소설 플롯 구성 전문가입니다.

소설 정보:
- 제목: ${previousResults?.title || "미정"}
- 시놉시스: ${previousResults?.synopsis || idea}
- 장르: ${genre || "미정"}
- 예상 챕터 수: ${previousResults?.estimatedChapters || 10}
${genreGuide}

이 소설의 챕터별 플롯을 구성하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "chapters": [
    {
      "number": 1,
      "title": "챕터 제목",
      "act": "발단/전개/위기/절정/결말 중 하나",
      "summary": "2-3문장의 챕터 줄거리",
      "characters": ["등장 캐릭터 이름들"]
    }
  ]
}`,
  };

  let systemPrompt: string;

  if (isSingleCharacter && typeof characterIndex === "number" && currentResult) {
    // 개별 캐릭터 재생성
    const chars = currentResult.characters || [];
    const targetChar = chars[characterIndex];
    systemPrompt = `당신은 소설 캐릭터 설계 전문가입니다.

소설 정보:
- 제목: ${previousResults?.title || "미정"}
- 시놉시스: ${previousResults?.synopsis || idea}
- 장르: ${genre || "미정"}
${genreGuide}

기존 캐릭터 "${targetChar?.name || "미정"}" (역할: ${targetChar?.role || "미정"})를 완전히 새롭게 재설계하세요.
기존과 다른 새로운 캐릭터를 만들되, 같은 역할(${targetChar?.role || "주인공"})을 유지하세요.

반드시 아래 JSON 형식으로 캐릭터 1명만 응답하세요:
{
  "name": "캐릭터 이름",
  "role": "${targetChar?.role || "주인공"}",
  "description": "2-3문장의 캐릭터 설명",
  "traits": [
    { "key": "외모", "value": "외모 설명" },
    { "key": "성격", "value": "성격 설명" },
    { "key": "목표", "value": "캐릭터의 목표" }
  ]
}`;
  } else if (isRevise && feedback && currentResult) {
    // 수정 모드: 피드백으로 수정 요청
    const basePrompt = prompts[baseStep];
    if (!basePrompt) {
      return new Response(JSON.stringify({ error: "Invalid step" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // 이전 결과를 축약하여 전달 (타임아웃 방지)
    const resultSummary = typeof currentResult === "string"
      ? currentResult.slice(0, 2000)
      : JSON.stringify(currentResult).slice(0, 2000);

    systemPrompt = `${basePrompt}

=== 수정 요청 ===
이전 결과 (요약): ${resultSummary}

사용자 피드백: "${feedback}"

위 피드백을 반영하여 수정된 버전을 같은 JSON 형식으로 작성하세요.
피드백과 관련 없는 부분은 기존 내용을 유지하세요.`;
  } else {
    systemPrompt = prompts[baseStep];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: "Invalid step" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  try {
    const result = streamText({
      model: llm,
      system: "당신은 소설 기획 AI 어시스턴트입니다. 반드시 유효한 JSON으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만 출력하세요.",
      prompt: systemPrompt,
      async onFinish({ text }) {
        await logAiUsage(auth.userId, `wizard-${step}`, model, idea.slice(0, 500), text);
      },
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
