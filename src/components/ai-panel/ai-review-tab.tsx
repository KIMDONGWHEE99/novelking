"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/core";
import { useAppStore } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardCheck, Loader2 } from "lucide-react";

interface AiReviewTabProps {
  editor: Editor | null;
}

export function AiReviewTab({ editor }: AiReviewTabProps) {
  const { activeProvider, activeModel } = useAppStore();
  const [isReviewing, setIsReviewing] = useState(false);
  const [review, setReview] = useState("");

  async function handleReview() {
    if (!editor) return;
    const text = editor.getText();
    if (!text.trim()) {
      alert("교정할 내용이 없습니다. 먼저 글을 작성해주세요.");
      return;
    }

    setIsReviewing(true);
    setReview("");

    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          provider: activeProvider,
          model: activeModel,
        }),
      });

      if (!res.ok || !res.body) {
        alert("AI 교정에 실패했습니다.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Vercel AI SDK data stream에서 텍스트 추출
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              accumulated += text;
              setReview(accumulated);
            } catch {
              // 파싱 실패 무시
            }
          }
        }
      }
    } finally {
      setIsReviewing(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {review ? (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
              {review}
            </div>
          </ScrollArea>
          <div className="p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={handleReview}
              disabled={isReviewing}
            >
              {isReviewing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ClipboardCheck className="h-3.5 w-3.5" />
              )}
              다시 교정하기
            </Button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            AI 편집자가 원고를 검토합니다
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            문장력, 몰입도, 캐릭터, 구성, 상업성을<br />
            10점 만점으로 평가하고 개선점을 알려드려요
          </p>
          <Button
            onClick={handleReview}
            disabled={isReviewing}
            className="gap-2"
          >
            {isReviewing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ClipboardCheck className="h-4 w-4" />
            )}
            {isReviewing ? "원고를 검토하고 있어요..." : "AI 교정 시작"}
          </Button>
        </div>
      )}
    </div>
  );
}
