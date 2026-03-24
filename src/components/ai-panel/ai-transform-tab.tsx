"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Check, X, RotateCcw } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { buildContext } from "@/lib/ai/context-builder";
import { getStylePrompt } from "@/lib/ai/prompts/styles";
import { supabaseChapterRepo } from "@/lib/db/repositories/supabase/project.repo";
import type { ContextSelection } from "@/types/ai";

interface AiTransformTabProps {
  projectId: string;
  chapterId: string;
  editor: Editor | null;
  contextSelection: ContextSelection;
}

export function AiTransformTab({
  projectId,
  chapterId,
  editor,
  contextSelection,
}: AiTransformTabProps) {
  const { activeProvider, activeModel, customTransformPrompt, writingStyle, stylePrompts } = useAppStore();
  const [isTransforming, setIsTransforming] = useState(false);
  const [preview, setPreview] = useState("");
  const [isDone, setIsDone] = useState(false);

  function getEditorPlainText(): string {
    if (!editor) return "";
    return editor.state.doc.textContent;
  }

  function getEditorHtml(): string {
    if (!editor) return "";
    return editor.getHTML();
  }

  const wordCount = getEditorPlainText().length;

  async function handleTransform() {
    if (!editor || isTransforming) return;

    const plainText = getEditorPlainText();
    if (!plainText.trim()) {
      alert("에디터에 변환할 내용이 없습니다.");
      return;
    }

    // 원본 백업
    const currentHtml = getEditorHtml();
    await supabaseChapterRepo.saveRawDraft(chapterId, currentHtml);

    setIsTransforming(true);
    setPreview("");
    setIsDone(false);

    try {
      const contextBlock = await buildContext(
        projectId,
        chapterId,
        contextSelection
      );

      const res = await fetch("/api/ai/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: plainText,
          mode: "fullChapter",
          contextBlock,
          provider: activeProvider,
          model: activeModel,
          customPrompt: customTransformPrompt,
          writingStyle,
          stylePrompt: getStylePrompt(writingStyle, stylePrompts),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert(`변환 실패: ${errorText}`);
        setIsTransforming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setPreview(fullText);
      }

      setIsDone(true);
    } catch (error) {
      console.error("전체 변환 오류:", error);
      alert("변환 중 오류가 발생했습니다.");
    } finally {
      setIsTransforming(false);
    }
  }

  function handleApply() {
    if (!editor || !preview) return;
    editor.chain().focus().clearContent().insertContent(preview).run();
    supabaseChapterRepo.update(chapterId, { status: "ai-transformed" });
    setPreview("");
    setIsDone(false);
  }

  function handleCancel() {
    setPreview("");
    setIsDone(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* 상태 정보 */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">현재 원고</span>
          <span className="text-xs font-medium">
            {wordCount.toLocaleString()}자
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          현재 에디터의 전체 내용을 상업 소설 수준으로 변환합니다. 원본은
          자동으로 백업되며, 상단의 &quot;원본 복원&quot; 버튼으로 되돌릴 수
          있습니다.
        </p>
      </div>

      {/* 미리보기 영역 */}
      {(isTransforming || preview) && (
        <ScrollArea className="flex-1 p-3">
          <div className="text-xs">
            <div className="flex items-center gap-1.5 mb-2">
              {isTransforming ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span className="text-primary font-medium">변환 중...</span>
                </>
              ) : (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">
                    변환 완료 ({preview.length.toLocaleString()}자)
                  </span>
                </>
              )}
            </div>
            <div className="bg-muted/50 rounded-lg p-3 whitespace-pre-wrap text-[11px] leading-relaxed">
              {preview}
            </div>
          </div>
        </ScrollArea>
      )}

      {/* 빈 상태 */}
      {!isTransforming && !preview && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              {wordCount === 0
                ? "에디터에 초안을 먼저 작성해주세요"
                : "아래 버튼을 눌러 변환을 시작하세요"}
            </p>
          </div>
        </div>
      )}

      {/* 하단 액션 */}
      <div className="border-t p-3">
        {isDone && preview ? (
          <div className="flex gap-2">
            <Button onClick={handleApply} className="flex-1 gap-1.5" size="sm">
              <Check className="h-3.5 w-3.5" />
              에디터에 적용
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-1.5"
              size="sm"
            >
              <X className="h-3.5 w-3.5" />
              취소
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleTransform}
            disabled={isTransforming || wordCount === 0}
            className="w-full gap-1.5"
            size="sm"
          >
            {isTransforming ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                변환 중...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                전체 변환 시작
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
