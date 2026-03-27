import { createServerSupabase } from "@/lib/supabase/server";

const ADMIN_USER_ID = "5276608a-63a6-4b5f-870a-5f5e19274a6c";

/**
 * 관리자 인증을 검사합니다.
 * 관리자가 아니면 Response를 반환하고, 관리자이면 userId를 반환합니다.
 */
export async function validateAdmin(): Promise<
  { userId: string } | Response
> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "로그인이 필요합니다." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (user.id !== ADMIN_USER_ID) {
    return new Response(JSON.stringify({ error: "접근 권한이 없습니다." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return { userId: user.id };
}
