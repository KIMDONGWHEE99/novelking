import { createClient } from "@/lib/supabase/client";
import type { PlotColumn, PlotCard } from "@/types/plot";
import { nanoid } from "nanoid";

function getSupabase() {
  return createClient();
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await getSupabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export const supabasePlotColumnRepo = {
  async getByProject(projectId: string): Promise<PlotColumn[]> {
    const { data, error } = await getSupabase()
      .from("plot_columns")
      .select("*")
      .eq("project_id", projectId)
      .order("order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapPlotColumn);
  },

  async create(data: Omit<PlotColumn, "id">): Promise<string> {
    const userId = await getUserId();
    const id = nanoid();
    const { error } = await getSupabase().from("plot_columns").insert({
      id,
      project_id: data.projectId,
      user_id: userId,
      title: data.title,
      order: data.order,
      color: data.color,
    });
    if (error) throw error;
    return id;
  },

  async update(id: string, data: Partial<PlotColumn>): Promise<void> {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.color !== undefined) updateData.color = data.color;

    const { error } = await getSupabase().from("plot_columns").update(updateData).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    // plot_cards는 ON DELETE CASCADE로 자동 삭제됨
    const { error } = await getSupabase().from("plot_columns").delete().eq("id", id);
    if (error) throw error;
  },

  async initializeDefault(projectId: string): Promise<void> {
    const { count, error: countError } = await getSupabase()
      .from("plot_columns")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);
    if (countError) throw countError;
    if ((count ?? 0) > 0) return;

    const userId = await getUserId();
    const defaults = [
      { title: "발단", color: "#3b82f6", order: 0 },
      { title: "전개", color: "#8b5cf6", order: 1 },
      { title: "위기", color: "#ef4444", order: 2 },
      { title: "절정", color: "#f59e0b", order: 3 },
      { title: "결말", color: "#22c55e", order: 4 },
    ];

    const rows = defaults.map((col) => ({
      id: nanoid(),
      project_id: projectId,
      user_id: userId,
      ...col,
    }));

    const { error } = await getSupabase().from("plot_columns").insert(rows);
    if (error) throw error;
  },
};

export const supabasePlotCardRepo = {
  async getByProject(projectId: string): Promise<PlotCard[]> {
    const { data, error } = await getSupabase()
      .from("plot_cards")
      .select("*")
      .eq("project_id", projectId)
      .order("order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapPlotCard);
  },

  async getByColumn(columnId: string): Promise<PlotCard[]> {
    const { data, error } = await getSupabase()
      .from("plot_cards")
      .select("*")
      .eq("column_id", columnId)
      .order("order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapPlotCard);
  },

  async create(data: Omit<PlotCard, "id">): Promise<string> {
    const userId = await getUserId();
    const id = nanoid();
    const { error } = await getSupabase().from("plot_cards").insert({
      id,
      project_id: data.projectId,
      user_id: userId,
      column_id: data.columnId,
      title: data.title,
      description: data.description,
      chapter_link: data.chapterLink,
      character_links: data.characterLinks ?? [],
      order: data.order,
      color: data.color,
    });
    if (error) throw error;
    return id;
  },

  async update(id: string, data: Partial<PlotCard>): Promise<void> {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.chapterLink !== undefined) updateData.chapter_link = data.chapterLink;
    if (data.characterLinks !== undefined) updateData.character_links = data.characterLinks;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.columnId !== undefined) updateData.column_id = data.columnId;

    const { error } = await getSupabase().from("plot_cards").update(updateData).eq("id", id);
    if (error) throw error;
  },

  async moveToColumn(id: string, columnId: string, order: number): Promise<void> {
    const { error } = await getSupabase()
      .from("plot_cards")
      .update({ column_id: columnId, order })
      .eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await getSupabase().from("plot_cards").delete().eq("id", id);
    if (error) throw error;
  },
};

function mapPlotColumn(row: Record<string, unknown>): PlotColumn {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    title: row.title as string,
    order: (row.order as number) || 0,
    color: (row.color as string) || "#3b82f6",
  };
}

function mapPlotCard(row: Record<string, unknown>): PlotCard {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    columnId: row.column_id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    chapterLink: row.chapter_link as string | undefined,
    characterLinks: (row.character_links as string[]) || [],
    order: (row.order as number) || 0,
    color: row.color as string | undefined,
  };
}
