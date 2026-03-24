import { createClient } from "@/lib/supabase/client";
import type { WorldElement } from "@/types/world";
import { nanoid } from "nanoid";

const supabase = createClient();

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export const supabaseWorldRepo = {
  async getByProject(projectId: string): Promise<WorldElement[]> {
    const { data, error } = await supabase
      .from("world_elements")
      .select("*")
      .eq("project_id", projectId);
    if (error) throw error;
    return (data ?? []).map(mapWorldElement);
  },

  async getById(id: string): Promise<WorldElement | undefined> {
    const { data, error } = await supabase
      .from("world_elements")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return mapWorldElement(data);
  },

  async create(data: Omit<WorldElement, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const userId = await getUserId();
    const id = nanoid();
    const now = new Date().toISOString();
    const { error } = await supabase.from("world_elements").insert({
      id,
      project_id: data.projectId,
      user_id: userId,
      type: data.type,
      title: data.title,
      content: data.content,
      fields: data.fields ?? [],
      generated_content: data.generatedContent,
      created_at: now,
      updated_at: now,
    });
    if (error) throw error;
    return id;
  },

  async update(id: string, data: Partial<WorldElement>): Promise<void> {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.type !== undefined) updateData.type = data.type;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.fields !== undefined) updateData.fields = data.fields;
    if (data.generatedContent !== undefined) updateData.generated_content = data.generatedContent;

    const { error } = await supabase.from("world_elements").update(updateData).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("world_elements").delete().eq("id", id);
    if (error) throw error;
  },
};

function mapWorldElement(row: Record<string, unknown>): WorldElement {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    type: row.type as WorldElement["type"],
    title: row.title as string,
    content: (row.content as string) || "",
    fields: (row.fields as WorldElement["fields"]) || [],
    generatedContent: row.generated_content as string | undefined,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}
