"use client";

import { use, useState, useCallback, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/core";
import { useChapter } from "@/lib/db/hooks/use-chapters";
import { useProject } from "@/lib/db/hooks/use-projects";
import { chapterRepo } from "@/lib/db/repositories/project.repo";
import { NovelEditor } from "@/components/editor/novel-editor";
import { AiSidePanel } from "@/components/ai-panel/ai-side-panel";
import { useAppStore } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Undo2, Sparkles, PanelRight, Download } from "lucide-react";
import { exportChapter, downloadFile } from "@/lib/export/exporter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 드래그로 크기 조절 가능한 레이아웃
function DraggableLayout({
  aiPanelOpen,
  children,
}: {
  aiPanelOpen: boolean;
  children: React.ReactNode;
}) {
  const [panelWidth, setPanelWidth] = useState(380);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const childArray = Array.isArray(children) ? children : [children];

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = rect.right - e.clientX;
      setPanelWidth(Math.min(Math.max(newWidth, 280), rect.width * 0.5));
    };
    const onUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!aiPanelOpen) {
    return <div className="flex-1 overflow-hidden">{childArray[0]}</div>;
  }

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-hidden">{childArray[0]}</div>
      {/* 드래그 핸들 */}
      <div
        className="w-1.5 hover:w-2 bg-border hover:bg-primary/40 cursor-col-resize transition-all shrink-0 flex items-center justify-center"
        onMouseDown={handleMouseDown}
      >
        <div className="w-0.5 h-8 rounded-full bg-muted-foreground/30" />
      </div>
      <div style={{ width: panelWidth }} className="shrink-0 overflow-hidden">
        {childArray[1]}
      </div>
    </div>
  );
}

export default function WritePage({
  params,
}: {
  params: Promise<{ projectId: string; chapterId: string }>;
}) {
  const { projectId, chapterId } = use(params);
  const { chapter, isLoading } = useChapter(chapterId);
  const { project } = useProject(projectId);
  const { aiPanelOpen, toggleAiPanel } = useAppStore();
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState<string | null>(null);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  const displayTitle = title ?? chapter?.title ?? "";

  const handleContentUpdate = useCallback(
    async (html: string) => {
      await chapterRepo.updateContent(chapterId, html);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    [chapterId]
  );

  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      setTitle(newTitle);
      await chapterRepo.update(chapterId, { title: newTitle });
    },
    [chapterId]
  );

  const handleRestoreDraft = useCallback(async () => {
    if (!chapter?.rawDraft) return;
    if (confirm("원본 초안으로 되돌리시겠습니까? 현재 내용이 사라집니다.")) {
      await chapterRepo.updateContent(chapterId, chapter.rawDraft);
      window.location.reload();
    }
  }, [chapter, chapterId]);

  const handleEditorReady = useCallback((editor: Editor) => {
    setEditorInstance(editor);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        챕터를 찾을 수 없습니다
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 상단 도구바 */}
      <div className="border-b px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Input
            value={displayTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 w-48"
            placeholder="챕터 제목"
          />
          <Badge variant="secondary" className="text-xs">
            {chapter.wordCount.toLocaleString()}자
          </Badge>
          {/* 챕터 상태 변경 */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium cursor-pointer ${
                chapter.status === "complete"
                  ? "bg-green-500/20 text-green-400"
                  : chapter.status === "editing"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : chapter.status === "ai-transformed"
                  ? "bg-purple-500/20 text-purple-400"
                  : chapter.status === "writing"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {chapter.status === "complete" ? "완료" :
               chapter.status === "editing" ? "편집 중" :
               chapter.status === "ai-transformed" ? "AI 변환됨" :
               chapter.status === "writing" ? "작성 중" : "초안"}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[
                { value: "draft", label: "초안" },
                { value: "writing", label: "작성 중" },
                { value: "ai-transformed", label: "AI 변환됨" },
                { value: "editing", label: "편집 중" },
                { value: "complete", label: "완료" },
              ].map((s) => (
                <DropdownMenuItem
                  key={s.value}
                  onClick={() => chapterRepo.update(chapterId, { status: s.value as "draft" | "writing" | "ai-transformed" | "editing" | "complete" })}
                >
                  {s.label}
                  {chapter.status === s.value && " ✓"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {saved && (
            <span className="text-xs text-green-500 animate-in fade-in">
              저장됨
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {chapter.rawDraft && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleRestoreDraft}
            >
              <Undo2 className="h-3.5 w-3.5" />
              원본 복원
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              내보내기
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={async () => {
                  const result = await exportChapter(chapterId, "txt");
                  downloadFile(result);
                }}
              >
                텍스트 파일 (.txt)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  const result = await exportChapter(chapterId, "html");
                  downloadFile(result);
                }}
              >
                HTML 파일 (.html)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant={aiPanelOpen ? "secondary" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={toggleAiPanel}
          >
            {aiPanelOpen ? (
              <PanelRight className="h-3.5 w-3.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            AI 대리창작
          </Button>
        </div>
      </div>

      {/* 에디터 + AI 사이드 패널 (드래그 리사이즈) */}
      <DraggableLayout aiPanelOpen={aiPanelOpen}>
        <div className="h-full overflow-auto">
          <div className="mx-auto py-8 px-6 max-w-3xl">
            <NovelEditor
              initialContent={chapter.content}
              onUpdate={handleContentUpdate}
              onEditorReady={handleEditorReady}
              className="prose prose-lg dark:prose-invert max-w-none min-h-[60vh] focus:outline-none"
            />
          </div>
        </div>
        {aiPanelOpen && (
          <AiSidePanel
            projectId={projectId}
            chapterId={chapterId}
            editor={editorInstance}
          />
        )}
      </DraggableLayout>
    </div>
  );
}
