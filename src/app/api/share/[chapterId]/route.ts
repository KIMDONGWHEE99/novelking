import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

// POST: 공유 토큰 생성 (인증 필요)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  // 챕터 소유자 확인
  const { data: chapter } = await supabase
    .from("chapters")
    .select("id, share_token, user_id")
    .eq("id", chapterId)
    .eq("user_id", user.id)
    .single();

  if (!chapter) {
    return NextResponse.json(
      { error: "챕터를 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  // 이미 공유 토큰이 있으면 반환
  if (chapter.share_token) {
    return NextResponse.json({ shareToken: chapter.share_token });
  }

  // 새 공유 토큰 생성
  const shareToken = nanoid(12);
  const { error } = await supabase
    .from("chapters")
    .update({ share_token: shareToken })
    .eq("id", chapterId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "공유 토큰 생성 실패" },
      { status: 500 }
    );
  }

  return NextResponse.json({ shareToken });
}

// DELETE: 공유 해제 (인증 필요)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  await supabase
    .from("chapters")
    .update({ share_token: null })
    .eq("id", chapterId)
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
