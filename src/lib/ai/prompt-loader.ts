import { createServerSupabase } from "@/lib/supabase/server";

/**
 * DB에서 프롬프트를 로드합니다.
 * DB에 해당 프롬프트가 없으면 null을 반환하고, 코드의 기본값을 사용합니다.
 */
export async function loadPrompt(
  category: string,
  subcategory: string
): Promise<string | null> {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("prompt_templates")
      .select("content")
      .eq("category", category)
      .eq("subcategory", subcategory)
      .eq("is_active", true)
      .single();

    return data?.content ?? null;
  } catch {
    return null;
  }
}

/**
 * DB에서 장르별 가이드라인을 로드합니다.
 * DB에 없으면 null을 반환하고 코드의 기본 가이드라인을 사용합니다.
 */
export async function loadGenreGuideline(
  genre: string,
  step: string
): Promise<string | null> {
  return loadPrompt("genre", `${genre}-${step}`);
}
