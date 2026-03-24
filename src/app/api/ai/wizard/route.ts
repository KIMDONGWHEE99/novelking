import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createLlmModel } from "@/lib/ai/create-model";
import { validateAiRequest, logAiUsage } from "@/lib/ai/auth-middleware";

export async function POST(req: NextRequest) {
  // 인증 + 크레딧 검사
  const auth = await validateAiRequest();
  if (auth instanceof Response) return auth;

  const { step, idea, genre, previousResults, provider, model } =
    await req.json();

  if (!idea) {
    return NextResponse.json({ error: "아이디어를 입력해주세요." }, { status: 400 });
  }

  let llm;
  try {
    llm = createLlmModel(provider, model);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "모델 생성 실패" },
      { status: 400 }
    );
  }

  await logAiUsage(auth.userId, `wizard-${step}`, model, idea.slice(0, 200));

  const prompts: Record<string, string> = {
    synopsis: `당신은 베스트셀러 소설 기획 전문가입니다.

사용자의 아이디어: "${idea}"
장르: ${genre || "미정"}

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

  const systemPrompt = prompts[step];
  if (!systemPrompt) {
    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  }

  try {
    const result = await generateText({
      model: llm,
      system: "당신은 소설 기획 AI 어시스턴트입니다. 반드시 유효한 JSON으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만 출력하세요.",
      prompt: systemPrompt,
    });

    return NextResponse.json({ content: result.text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
