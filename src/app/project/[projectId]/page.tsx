"use client";

import { use } from "react";
import { useProject } from "@/lib/db/hooks/use-projects";
import { useChapters } from "@/lib/db/hooks/use-chapters";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { chapterRepo } from "@/lib/db/repositories/project.repo";
import { PenTool, FileText, MessageSquare, Users, Download } from "lucide-react";
import { exportProject, downloadFile } from "@/lib/export/exporter";
import Link from "next/link";

export default function ProjectDashboard({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { project } = useProject(projectId);
  const { chapters } = useChapters(projectId);

  async function handleAddChapter() {
    const order = (chapters?.length ?? 0) + 1;
    const id = await chapterRepo.create({
      projectId,
      title: `${order}장`,
      content: "",
      rawDraft: "",
      wordCount: 0,
      order,
      status: "draft",
    });
    window.location.href = `/project/${projectId}/write/${id}`;
  }

  const totalWords = chapters?.reduce((sum, c) => sum + c.wordCount, 0) ?? 0;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project?.title}</h1>
          {project?.description && (
            <p className="text-muted-foreground mt-2">{project.description}</p>
          )}
        </div>
        {chapters && chapters.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={async () => {
                const result = await exportProject(projectId, "txt");
                downloadFile(result);
              }}
            >
              <Download className="h-3.5 w-3.5" />
              TXT
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={async () => {
                const result = await exportProject(projectId, "html");
                downloadFile(result);
              }}
            >
              <Download className="h-3.5 w-3.5" />
              HTML
            </Button>
          </div>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>총 챕터</CardDescription>
            <CardTitle className="text-2xl">{chapters?.length ?? 0}개</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>총 글자 수</CardDescription>
            <CardTitle className="text-2xl">
              {totalWords.toLocaleString()}자
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>장르</CardDescription>
            <CardTitle className="text-2xl">{project?.genre ?? "-"}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 챕터별 진행률 */}
      {chapters && chapters.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">챕터 진행률</h2>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>
                  전체 {chapters.length}개 챕터 중{" "}
                  {chapters.filter((c) => c.status === "complete").length}개 완료
                </CardDescription>
                <span className="text-xs text-muted-foreground">
                  {Math.round(
                    (chapters.filter((c) => c.status === "complete").length /
                      chapters.length) *
                      100
                  )}
                  % 달성
                </span>
              </div>
              {/* 전체 진행바 */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${(chapters.filter((c) => c.status === "complete").length / chapters.length) * 100}%`,
                  }}
                />
              </div>
            </CardHeader>
            <div className="px-6 pb-4 space-y-1.5 max-h-64 overflow-y-auto">
              {chapters.map((ch) => {
                const statusConfig: Record<string, { label: string; color: string }> = {
                  draft: { label: "초안", color: "bg-muted-foreground/20 text-muted-foreground" },
                  writing: { label: "작성 중", color: "bg-blue-500/20 text-blue-400" },
                  "ai-transformed": { label: "AI 변환됨", color: "bg-purple-500/20 text-purple-400" },
                  editing: { label: "편집 중", color: "bg-yellow-500/20 text-yellow-400" },
                  complete: { label: "완료", color: "bg-green-500/20 text-green-400" },
                };
                const status = statusConfig[ch.status] || statusConfig.draft;
                return (
                  <Link
                    key={ch.id}
                    href={`/project/${projectId}/write/${ch.id}`}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {ch.title}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {ch.wordCount.toLocaleString()}자
                    </span>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* 빠른 시작 */}
      <h2 className="text-lg font-semibold mb-4">빠른 시작</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={handleAddChapter}
        >
          <CardHeader className="flex flex-row items-center gap-3">
            <PenTool className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-base">새 챕터 쓰기</CardTitle>
              <CardDescription>
                새로운 챕터를 추가하고 글을 작성하세요
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Link href={`/project/${projectId}/brainstorm`}>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-base">브레인스토밍</CardTitle>
                <CardDescription>
                  AI와 함께 아이디어를 구상하세요
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href={`/project/${projectId}/characters`}>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-base">캐릭터 관리</CardTitle>
                <CardDescription>
                  등장인물을 만들고 관리하세요
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        {chapters && chapters.length > 0 && (
          <Link href={`/project/${projectId}/write/${chapters[chapters.length - 1].id}`}>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-base">이어서 쓰기</CardTitle>
                  <CardDescription>
                    마지막 챕터에서 이어서 작성하세요
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
