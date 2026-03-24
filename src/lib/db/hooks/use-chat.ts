"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseChatSessionRepo, supabaseChatMessageRepo } from "../repositories/supabase/chat.repo";
import type { ChatSession, ChatMessage } from "@/types/ai";

export function useChatSessions(projectId: string) {
  const [sessions, setSessions] = useState<ChatSession[]>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setSessions(undefined);
    supabaseChatSessionRepo.getByProject(projectId).then(setSessions).catch(console.error);
  }, [projectId, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { sessions, isLoading: sessions === undefined, refetch };
}

export function useChatMessages(sessionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setMessages(undefined);
    supabaseChatMessageRepo.getBySession(sessionId).then(setMessages).catch(console.error);
  }, [sessionId, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { messages, isLoading: messages === undefined, refetch };
}
