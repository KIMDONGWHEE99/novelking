"use client";

import { use, useState, useRef, useEffect, useCallback } from "react";
import { useProject } from "@/lib/db/hooks/use-projects";
import { useAppStore } from "@/lib/store/app-store";
import { supabaseChatSessionRepo, supabaseChatMessageRepo } from "@/lib/db/repositories/supabase/chat.repo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User, Trash2, Plus, MessageSquare } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SessionInfo {
  id: string;
  title: string;
}

export default function BrainstormPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { project } = useProject(projectId);
  const { activeProvider, activeModel } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 세션 관리
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [showSessions, setShowSessions] = useState(false);

  // 세션 목록 로드
  const loadSessions = useCallback(async () => {
    try {
      const data = await supabaseChatSessionRepo.getByProject(projectId);
      setSessions(data.map((s) => ({ id: s.id, title: s.title })));
      return data;
    } catch (e) {
      console.error("세션 목록 로드 실패:", e);
      return [];
    }
  }, [projectId]);

  // 특정 세션의 메시지 로드
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const data = await supabaseChatMessageRepo.getBySession(sessionId);
      setMessages(
        data
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
      );
    } catch (e) {
      console.error("메시지 로드 실패:", e);
      setMessages([]);
    }
  }, []);

  // 초기화: 기존 세션 로드 또는 새 세션 생성
  useEffect(() => {
    async function init() {
      setIsInitializing(true);
      const existingSessions = await loadSessions();

      if (existingSessions.length > 0) {
        // 가장 최근 세션 로드
        const latest = existingSessions[0];
        setCurrentSessionId(latest.id);
        await loadMessages(latest.id);
      }
      // 세션이 없으면 첫 메시지 전송 시 자동 생성
      setIsInitializing(false);
    }
    init();
  }, [projectId, loadSessions, loadMessages]);

  // 새 세션 생성
  async function createNewSession(): Promise<string> {
    const sessionId = await supabaseChatSessionRepo.create({
      projectId,
      title: "새 대화",
    });
    setCurrentSessionId(sessionId);
    await loadSessions();
    return sessionId;
  }

  // 새 대화 시작
  async function handleNewChat() {
    const sessionId = await createNewSession();
    setMessages([]);
    setCurrentSessionId(sessionId);
    setShowSessions(false);
  }

  // 세션 전환
  async function handleSwitchSession(sessionId: string) {
    setCurrentSessionId(sessionId);
    await loadMessages(sessionId);
    setShowSessions(false);
  }

  // 세션 삭제
  async function handleDeleteSession(sessionId: string) {
    if (!confirm("이 대화를 삭제하시겠습니까?")) return;
    await supabaseChatSessionRepo.delete(sessionId);

    if (currentSessionId === sessionId) {
      setMessages([]);
      setCurrentSessionId(null);
    }

    const updated = await loadSessions();
    if (updated.length > 0 && currentSessionId === sessionId) {
      setCurrentSessionId(updated[0].id);
      await loadMessages(updated[0].id);
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    // 세션이 없으면 자동 생성
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createNewSession();
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // 사용자 메시지 즉시 DB 저장
    try {
      await supabaseChatMessageRepo.create({
        sessionId,
        role: "user",
        content: userMessage.content,
      });
    } catch (e) {
      console.error("메시지 저장 실패:", e);
    }

    // 첫 메시지면 세션 제목 업데이트
    if (messages.length === 0) {
      const title = userMessage.content.slice(0, 30) + (userMessage.content.length > 30 ? "..." : "");
      supabaseChatSessionRepo.update(sessionId, { title }).catch(console.error);
      loadSessions();
    }

    try {
      const res = await fetch("/api/ai/brainstorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: project
            ? {
                genre: project.genre,
                title: project.title,
                description: project.description,
              }
            : undefined,
          provider: activeProvider,
          model: activeModel,
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

      // AI 응답 완료 후 DB 저장
      if (assistantContent && sessionId) {
        await supabaseChatMessageRepo.create({
          sessionId,
          role: "assistant",
          content: assistantContent,
        });
        // 세션 updated_at 갱신
        await supabaseChatSessionRepo.update(sessionId, {});
      }
    } catch (error) {
      console.error("브레인스토밍 오류:", error);
      alert("AI 응답 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold">브레인스토밍</h1>
          <p className="text-xs text-muted-foreground">
            AI와 함께 소설 아이디어를 구상하세요
          </p>
        </div>
        <div className="flex gap-1.5">
          {sessions.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => setShowSessions(!showSessions)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              대화 목록 ({sessions.length})
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={handleNewChat}
          >
            <Plus className="h-3.5 w-3.5" />
            새 대화
          </Button>
          {currentSessionId && messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => handleDeleteSession(currentSessionId)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* 세션 목록 드롭다운 */}
      {showSessions && (
        <div className="border-b px-6 py-2 bg-muted/50 space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between group hover:bg-muted ${
                s.id === currentSessionId ? "bg-muted font-medium" : ""
              }`}
              onClick={() => handleSwitchSession(s.id)}
            >
              <span className="truncate">{s.title}</span>
              {s.id !== currentSessionId && (
                <button
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(s.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 채팅 영역 */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Bot className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">
                AI 브레인스토밍 파트너
              </h3>
              <p className="text-sm mb-4">
                소설의 아이디어, 줄거리, 캐릭터에 대해 자유롭게 대화하세요
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "이 소설의 주인공은 어떤 성격이 좋을까?",
                  "반전 요소를 넣고 싶어",
                  "첫 장면을 어떻게 시작하면 좋을까?",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setInput(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`rounded-lg px-4 py-3 max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-3">
                <p className="text-sm text-muted-foreground">생각하는 중...</p>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* 입력 영역 */}
      <div className="border-t p-4 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="아이디어를 입력하세요..."
            className="resize-none min-h-[48px] max-h-32"
            rows={1}
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
            className="shrink-0 h-12 w-12"
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
