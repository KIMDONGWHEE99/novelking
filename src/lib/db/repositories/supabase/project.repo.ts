import { createClient } from "@/lib/supabase/client";
import type { Project, Chapter } from "@/types/project";
import { nanoid } from "nanoid";

const supabase = createClient();

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export const supabaseProjectRepo = {
  async getAll(): Promise<Project[]> {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProject);
  },

  async getById(id: string): Promise<Project | undefined> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return mapProject(data);
  },

  async create(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const userId = await getUserId();
    const id = nanoid();
    const now = new Date().toISOString();
    const { error } = await supabase.from("projects").insert({
      id,
      user_id: userId,
      title: data.title,
      description: data.description,
      genre: data.genre,
      cover_image: data.coverImage,
      settings: data.settings,
      created_at: now,
      updated_at: now,
    });
    if (error) throw error;
    return id;
  },

  async update(id: string, data: Partial<Project>): Promise<void> {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.genre !== undefined) updateData.genre = data.genre;
    if (data.coverImage !== undefined) updateData.cover_image = data.coverImage;
    if (data.settings !== undefined) updateData.settings = data.settings;

    const { error } = await supabase.from("projects").update(updateData).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  },
};

export const supabaseChapterRepo = {
  async getByProject(projectId: string): Promise<Chapter[]> {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("project_id", projectId)
      .order("order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapChapter);
  },

  async getById(id: string): Promise<Chapter | undefined> {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return mapChapter(data);
  },

  async create(data: Omit<Chapter, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const userId = await getUserId();
    const id = nanoid();
    const now = new Date().toISOString();
    const { error } = await supabase.from("chapters").insert({
      id,
      project_id: data.projectId,
      user_id: userId,
      title: data.title,
      content: data.content,
      raw_draft: data.rawDraft,
      word_count: data.wordCount,
      order: data.order,
      status: data.status,
      created_at: now,
      updated_at: now,
    });
    if (error) throw error;
    return id;
  },

  async update(id: string, data: Partial<Chapter>): Promise<void> {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.rawDraft !== undefined) updateData.raw_draft = data.rawDraft;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.order !== undefined) updateData.order = data.order;

    const { error } = await supabase.from("chapters").update(updateData).eq("id", id);
    if (error) throw error;
  },

  async updateContent(id: string, content: string): Promise<void> {
    const wordCount = content.replace(/<[^>]*>/g, "").length;
    const { error } = await supabase.from("chapters").update({
      content,
      word_count: wordCount,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) throw error;
  },

  async saveRawDraft(id: string, rawDraft: string): Promise<void> {
    const { error } = await supabase.from("chapters").update({
      raw_draft: rawDraft,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("chapters").delete().eq("id", id);
    if (error) throw error;
  },
};

// DB 행 → TypeScript 타입 변환
function mapProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    genre: (row.genre as string) || "",
    coverImage: row.cover_image as string | undefined,
    settings: (row.settings as Project["settings"]) || {
      defaultLlmProvider: "openai",
      defaultLlmModel: "gpt-4o-mini",
      writingStyle: "대중소설",
    },
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function mapChapter(row: Record<string, unknown>): Chapter {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    title: row.title as string,
    content: (row.content as string) || "",
    rawDraft: (row.raw_draft as string) || "",
    wordCount: (row.word_count as number) || 0,
    order: (row.order as number) || 0,
    status: (row.status as Chapter["status"]) || "draft",
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}
