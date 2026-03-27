import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { validateAdmin } from "@/lib/ai/admin-auth";

// 프롬프트 목록 조회
export async function GET() {
  const auth = await validateAdmin();
  if (auth instanceof Response) return auth;

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("*")
    .order("category")
    .order("subcategory");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ prompts: data });
}

// 프롬프트 생성 또는 업데이트
export async function POST(req: NextRequest) {
  const auth = await validateAdmin();
  if (auth instanceof Response) return auth;

  const { id, category, subcategory, name, content } = await req.json();

  if (!category || !subcategory || !name || !content) {
    return NextResponse.json({ error: "필수 필드가 누락되었습니다." }, { status: 400 });
  }

  const supabase = await createServerSupabase();

  if (id) {
    // 업데이트
    const { data, error } = await supabase
      .from("prompt_templates")
      .update({
        content,
        name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ prompt: data });
  } else {
    // 새로 생성
    const { data, error } = await supabase
      .from("prompt_templates")
      .insert({ category, subcategory, name, content })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ prompt: data });
  }
}

// 프롬프트 삭제
export async function DELETE(req: NextRequest) {
  const auth = await validateAdmin();
  if (auth instanceof Response) return auth;

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID가 필요합니다." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("prompt_templates")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
