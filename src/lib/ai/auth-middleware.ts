import { createServerSupabase } from "@/lib/supabase/server";

interface AiValidationResult {
  userId: string;
  plan: string;
}

/**
 * AI 라우트용 인증 + 크레딧 검사 미들웨어.
 * 성공 시 { userId, plan } 반환, 실패 시 Response 반환.
 */
export async function validateAiRequest(): Promise<
  AiValidationResult | Response
> {
  const supabase = await createServerSupabase();

  // 1. 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("로그인이 필요합니다.", { status: 401 });
  }

  // 2. 프로필 + 크레딧 조회
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan, ai_credits_used, ai_credits_reset_at")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return new Response("사용자 프로필을 찾을 수 없습니다.", { status: 403 });
  }

  const now = new Date();
  const resetAt = new Date(profile.ai_credits_reset_at);
  let creditsUsed = profile.ai_credits_used ?? 0;

  // 3. 하루가 지났으면 크레딧 리셋
  if (resetAt.toDateString() !== now.toDateString()) {
    creditsUsed = 0;
    await supabase
      .from("profiles")
      .update({
        ai_credits_used: 0,
        ai_credits_reset_at: now.toISOString(),
      })
      .eq("id", user.id);
  }

  // 4. 무료 플랜 일일 한도 검사 (50회)
  const dailyLimit = profile.plan === "free" ? 50 : Infinity;
  if (creditsUsed >= dailyLimit) {
    return new Response(
      `일일 AI 사용 한도(${dailyLimit}회)를 초과했습니다. 내일 다시 시도해주세요.`,
      { status: 429 }
    );
  }

  // 5. 크레딧 사용량 증가
  await supabase
    .from("profiles")
    .update({ ai_credits_used: creditsUsed + 1 })
    .eq("id", user.id);

  return { userId: user.id, plan: profile.plan };
}

/**
 * AI 사용 로그를 ai_logs 테이블에 기록합니다.
 */
export async function logAiUsage(
  userId: string,
  action: string,
  model: string,
  inputSummary?: string
) {
  const supabase = await createServerSupabase();
  await supabase.from("ai_logs").insert({
    user_id: userId,
    action,
    model,
    input_summary: inputSummary?.slice(0, 200),
    tokens_used: 0, // 실제 토큰 추적은 추후 구현
  });
}
