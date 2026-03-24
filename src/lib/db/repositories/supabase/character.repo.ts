import { createClient } from "@/lib/supabase/client";
import type { Character } from "@/types/character";
import { nanoid } from "nanoid";

const supabase = createClient();

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export const supabaseCharacterRepo = {
  async getByProject(projectId: string): Promise<Character[]> {
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("project_id", projectId);
    if (error) throw error;
    return (data ?? []).map(mapCharacter);
  },

  async getById(id: string): Promise<Character | undefined> {
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return mapCharacter(data);
  },

  async create(data: Omit<Character, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const userId = await getUserId();
    const id = nanoid();
    const now = new Date().toISOString();
    const { error } = await supabase.from("characters").insert({
      id,
      project_id: data.projectId,
      user_id: userId,
      name: data.name,
      role: data.role,
      profile_image: data.profileImage,
      illustration_image: data.illustrationImage,
      tags: data.tags ?? [],
      world_element_ids: data.worldElementIds ?? [],
      description: data.description,
      traits: data.traits ?? [],
      backstory: data.backstory,
      relationships: data.relationships ?? [],
      generated_content: data.generatedContent,
      created_at: now,
      updated_at: now,
    });
    if (error) throw error;
    return id;
  },

  async update(id: string, data: Partial<Character>): Promise<void> {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.profileImage !== undefined) updateData.profile_image = data.profileImage;
    if (data.illustrationImage !== undefined) updateData.illustration_image = data.illustrationImage;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.worldElementIds !== undefined) updateData.world_element_ids = data.worldElementIds;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.traits !== undefined) updateData.traits = data.traits;
    if (data.backstory !== undefined) updateData.backstory = data.backstory;
    if (data.relationships !== undefined) updateData.relationships = data.relationships;
    if (data.generatedContent !== undefined) updateData.generated_content = data.generatedContent;

    const { error } = await supabase.from("characters").update(updateData).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("characters").delete().eq("id", id);
    if (error) throw error;
  },
};

function mapCharacter(row: Record<string, unknown>): Character {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    name: row.name as string,
    role: (row.role as string) || "",
    profileImage: row.profile_image as string | undefined,
    illustrationImage: row.illustration_image as string | undefined,
    tags: (row.tags as string[]) || [],
    worldElementIds: (row.world_element_ids as string[]) || [],
    description: (row.description as string) || "",
    traits: (row.traits as Character["traits"]) || [],
    backstory: (row.backstory as string) || "",
    relationships: (row.relationships as Character["relationships"]) || [],
    generatedContent: row.generated_content as string | undefined,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}
