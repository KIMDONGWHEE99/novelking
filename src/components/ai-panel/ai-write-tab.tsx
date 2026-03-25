"use client";

import { useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getStylePrompt } from "@/lib/ai/prompts/styles";
import {
  Send,
  Loader2,
  Bot,
  User,
  Trash2,
  TextCursorInput,
  ArrowDownToLine,
  Replace,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { buildContext } from "@/lib/ai/context-builder";
import type { ContextSelection } from "@/types/ai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiWriteTabProps {
  projectId: string;
  chapterId: string;
  editor: Editor | null;
  contextSelection: ContextSelection;
}

export function AiWriteTab({
  projectId,
  chapterId,
  editor,
  contextSelection,
}: AiWriteTabProps) {
  const { activeProvider, activeModel, customWritePrompt, writingStyle, stylePrompts, targetWordCount, setTargetWordCount } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastAssistantContent, setLastAssistantContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setLastAssistantContent("");

    try {
      const contextBlock = await buildContext(
        projectId,
        chapterId,
        contextSelection
      );

      const res = await fetch("/api/ai/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          contextBlock,
          provider: activeProvider,
          model: activeModel,
          customPrompt: customWritePrompt,
          writingStyle,
          stylePrompt: getStylePrompt(writingStyle, stylePrompts),
          targetWordCount,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert(`오류: ${errorText}`);
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantContent,
          };
          return updated;
        });
      }

      setLastAssistantContent(assistantContent);
    } catch (error) {
      console.error("AI 작성 오류:", error);
      alert("AI 응답 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  function insertAtCursor() {
    if (!editor || !lastAssistantContent) return;
    const pos = editor.state.selection.anchor;
    editor.chain().focus().insertContentAt(pos, lastAssistantContent).run();
  }

  function appendToEnd() {
    if (!editor || !lastAssistantContent) return;
    const endPos = editor.state.doc.content.size;
    editor
      .chain()
      .focus()
      .insertContentAt(endPos, "\n\n" + lastAssistantContent)
      .run();
  }

  function replaceAll() {
    if (!editor || !lastAssistantContent) return;
    editor.chain().focus().clearContent().insertContent(lastAssistantContent).run();
  }

  return (
    <div className="flex flex-col h-full">
      {/* 메시지 영역 */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs">
                원하는 장면을 설명하면 AI가 소설을 작성합니다
              </p>
              <div className="flex flex-col gap-1.5 mt-3">
                {[
                  "주인공이 폐허가 된 마을에 도착하는 장면을 써줘",
                  "두 캐릭터가 처음 만나는 긴장감 있는 대화를 써줘",
                  "비 오는 밤, 주인공의 내면 독백을 써줘",
                ].map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-auto py-1.5 whitespace-normal text-left"
                    onClick={() => setInput(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              <div
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[85%] text-xs ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* 마지막 AI 응답에 삽입 버튼 표시 */}
              {msg.role === "assistant" &&
                i === messages.length - 1 &&
                !isLoading &&
                lastAssistantContent && (
                  <div className="flex gap-1 mt-2 ml-8">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1"
                      onClick={insertAtCursor}
                    >
                      <TextCursorInput className="h-3 w-3" />
                      커서에 삽입
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1"
                      onClick={appendToEnd}
                    >
                      <ArrowDownToLine className="h-3 w-3" />
                      맨 아래 추가
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1"
                      onClick={replaceAll}
                    >
                      <Replace className="h-3 w-3" />
                      전체 교체
                    </Button>
                  </div>
                )}
            </div>
          ))}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* 하단 액션 바 */}
      {messages.length > 0 && (
        <div className="px-3 pb-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] text-muted-foreground"
            onClick={() => {
              setMessages([]);
              setLastAssistantContent("");
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            대화 초기화
          </Button>
        </div>
      )}

      {/* 글자수 설정 */}
      <div className="border-t px-3 py-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground shrink-0">목표 글자수:</span>
          {[
            { label: "3.5K", value: 3500, desc: "노벨피아" },
            { label: "5K", value: 5000, desc: "문피아" },
            { label: "5.5K", value: 5500, desc: "카카오" },
            { label: "6K", value: 6000, desc: "네이버" },
          ].map((preset) => (
            <button
              key={preset.value}
              onClick={() => setTargetWordCount(preset.value)}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                targetWordCount === preset.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 hover:bg-muted border-transparent"
              }`}
              title={preset.desc}
            >
              {preset.label}
            </button>
          ))}
          <input
            type="number"
            value={targetWordCount}
            onChange={(e) => setTargetWordCount(Math.max(500, Math.min(20000, Number(e.target.value) || 5000)))}
            className="w-14 text-[10px] px-1.5 py-0.5 rounded border bg-background text-center"
            min={500}
            max={20000}
          />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="border-t p-3">
        <div className="flex gap-1.5">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="어떤 장면을 써볼까요?"
            className="resize-none text-xs min-h-[40px] max-h-24"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0 h-10 w-10"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
