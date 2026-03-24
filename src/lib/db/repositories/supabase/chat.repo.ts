import { createClient } from "@/lib/supabase/client";
import type { ChatSession, ChatMessage } from "@/types/ai";
import { nanoid } from "nanoid";

const supabase = createClient();

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export const supabaseChatSessionRepo = {
  async getByProject(projectId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapChatSession);
  },

  async getById(id: string): Promise<ChatSession | undefined> {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return mapChatSession(data);
  },

  async create(data: Omit<ChatSession, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const userId = await getUserId();
    const id = nanoid();
    const now = new Date().toISOString();
    const { error } = await supabase.from("chat_sessions").insert({
      id,
      project_id: data.projectId,
      user_id: userId,
      title: data.title,
      created_at: now,
      updated_at: now,
    });
    if (error) throw error;
    return id;
  },

  async update(id: string, data: Partial<ChatSession>): Promise<void> {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined) updateData.title = data.title;

    const { error } = await supabase.from("chat_sessions").update(updateData).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    // chat_messages는 ON DELETE CASCADE로 자동 삭제됨
    const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
    if (error) throw error;
  },
};

export const supabaseChatMessageRepo = {
  async getBySession(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapChatMessage);
  },

  async create(data: Omit<ChatMessage, "id" | "createdAt">): Promise<string> {
    const userId = await getUserId();
    const id = nanoid();
    const now = new Date().toISOString();
    const { error } = await supabase.from("chat_messages").insert({
      id,
      session_id: data.sessionId,
      user_id: userId,
      role: data.role,
      content: data.content,
      created_at: now,
    });
    if (error) throw error;
    return id;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("chat_messages").delete().eq("id", id);
    if (error) throw error;
  },
};

function mapChatSession(row: Record<string, unknown>): ChatSession {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    title: (row.title as string) || "새 대화",
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function mapChatMessage(row: Record<string, unknown>): ChatMessage {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    role: row.role as ChatMessage["role"],
    content: row.content as string,
    createdAt: new Date(row.created_at as string),
  };
}
