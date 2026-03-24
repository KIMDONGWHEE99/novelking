import { createClient } from "@supabase/supabase-js";
import { PenTool, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

// Supabase anon 클라이언트 (서버 사이드, RLS 공개 정책 사용)
function getPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getSharedChapter(shareToken: string) {
  const supabase = getPublicSupabase();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("id, title, content, word_count, project_id, updated_at")
    .eq("share_token", shareToken)
    .single();

  if (!chapter) return null;

  // 프로젝트 정보도 가져오기
  const { data: project } = await supabase
    .from("projects")
    .select("title, genre")
    .eq("id", chapter.project_id)
    .single();

  return { chapter, project };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}): Promise<Metadata> {
  const { shareToken } = await params;
  const data = await getSharedChapter(shareToken);

  if (!data) {
    return { title: "찾을 수 없는 페이지 | NovelKing" };
  }

  const { chapter, project } = data;
  // 본문에서 미리보기 텍스트 추출 (HTML 태그 제거, 150자)
  const plainText = chapter.content
    .replace(/<[^>]*>/g, "")
    .slice(0, 150)
    .trim();

  return {
    title: `${chapter.title} | ${project?.title || "NovelKing"}`,
    description: plainText || "NovelKing으로 작성된 소설입니다.",
    openGraph: {
      title: `${chapter.title} - ${project?.title || "소설"}`,
      description: plainText || "NovelKing으로 작성된 소설입니다.",
      type: "article",
    },
  };
}

export default async function SharedReadPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const data = await getSharedChapter(shareToken);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <PenTool className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-xl font-semibold mb-2">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-muted-foreground mb-6">
            이 공유 링크는 만료되었거나 존재하지 않습니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            NovelKing 홈으로 가기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { chapter, project } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* 읽기 헤더 */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <PenTool className="h-4 w-4" />
            <span className="text-sm font-medium">NovelKing</span>
          </Link>
          <Link
            href="/login"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            나도 소설 쓰기
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* 챕터 헤더 */}
        <div className="mb-10 text-center">
          {project && (
            <p className="text-sm text-muted-foreground mb-2">
              {project.title}
              {project.genre && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full border">
                  {project.genre}
                </span>
              )}
            </p>
          )}
          <h1 className="text-3xl font-bold">{chapter.title}</h1>
          {chapter.word_count > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              {chapter.word_count.toLocaleString()}자
            </p>
          )}
        </div>

        {/* 소설 본문 */}
        <article
          className="prose prose-lg dark:prose-invert max-w-none leading-loose"
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />
      </main>

      {/* CTA 푸터 */}
      <footer className="border-t mt-16">
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <PenTool className="h-8 w-8 mx-auto text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            나도 AI로 소설을 써볼까?
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            아이디어 한 줄이면 AI가 소설을 만들어줍니다. 무료로 시작하세요.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            무료로 시작하기
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-8">
            이 소설은{" "}
            <Link href="/" className="underline hover:text-foreground">
              NovelKing
            </Link>
            으로 작성되었습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
