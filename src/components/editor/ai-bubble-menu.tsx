"use client";

import { useState } from "react";
import { EditorBubble, EditorBubbleItem, useEditor } from "novel";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Eye,
  MessageCircle,
  Zap,
  Heart,
  Scissors,
  Sparkles,
  Loader2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { Separator } from "@/components/ui/separator";

const AI_ACTIONS = [
  {
    id: "novel",
    label: "소설체 변환",
    icon: BookOpen,
    description: "대중적인 소설 문체로 변환",
  },
  {
    id: "descriptive",
    label: "묘사 강화",
    icon: Eye,
    description: "오감을 활용한 생생한 묘사 추가",
  },
  {
    id: "dialogue",
    label: "대화 다듬기",
    icon: MessageCircle,
    description: "자연스러운 대화체로 다듬기",
  },
  {
    id: "tension",
    label: "긴장감 높이기",
    icon: Zap,
    description: "서스펜스와 긴장감 추가",
  },
  {
    id: "emotion",
    label: "감정 깊게",
    icon: Heart,
    description: "캐릭터의 내면 심리 강화",
  },
  {
    id: "concise",
    label: "간결하게",
    icon: Scissors,
    description: "불필요한 부분 제거",
  },
];

export function AiBubbleMenu() {
  const { editor } = useEditor();
  const [isTransforming, setIsTransforming] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const { activeProvider, activeModel } = useAppStore();

  async function handleTransform(transformType: string) {
    if (!editor || isTransforming) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, "\n");
    if (!selectedText.trim()) return;

    setIsTransforming(true);
    try {
      const res = await fetch("/api/ai/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedText,
          transformType,
          provider: activeProvider,
          model: activeModel,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert(`변환 실패: ${errorText}`);
        return;
      }

      // 스트리밍 응답을 텍스트로 읽기
      const fullText = await res.text();

      // 선택 영역을 변환된 텍스트로 대체
      if (fullText) {
        editor.chain().focus().deleteRange({ from, to }).run();
        editor.chain().focus().insertContentAt(from, fullText).run();
      }
    } catch (error) {
      console.error("AI 변환 오류:", error);
      alert("AI 변환 중 오류가 발생했습니다.");
    } finally {
      setIsTransforming(false);
      setShowAiMenu(false);
    }
  }

  if (!editor) return null;

  return (
    <EditorBubble
      tippyOptions={{ placement: "top", maxWidth: "none" }}
      className="flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-xl"
    >
      {/* 기본 서식 버튼 */}
      <EditorBubbleItem
        onSelect={(editor) => editor.chain().focus().toggleBold().run()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          data-active={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" />
        </Button>
      </EditorBubbleItem>
      <EditorBubbleItem
        onSelect={(editor) => editor.chain().focus().toggleItalic().run()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          data-active={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" />
        </Button>
      </EditorBubbleItem>
      <EditorBubbleItem
        onSelect={(editor) => editor.chain().focus().toggleUnderline().run()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          data-active={editor.isActive("underline")}
        >
          <Underline className="h-4 w-4" />
        </Button>
      </EditorBubbleItem>
      <EditorBubbleItem
        onSelect={(editor) => editor.chain().focus().toggleStrike().run()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          data-active={editor.isActive("strike")}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </EditorBubbleItem>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* AI 변환 토글 */}
      {!showAiMenu ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-primary"
          onClick={() => setShowAiMenu(true)}
          disabled={isTransforming}
        >
          {isTransforming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isTransforming ? "변환 중..." : "AI 변환"}
        </Button>
      ) : (
        <div className="flex items-center gap-0.5">
          {AI_ACTIONS.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => handleTransform(action.id)}
              disabled={isTransforming}
              title={action.description}
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => setShowAiMenu(false)}
          >
            닫기
          </Button>
        </div>
      )}
    </EditorBubble>
  );
}
