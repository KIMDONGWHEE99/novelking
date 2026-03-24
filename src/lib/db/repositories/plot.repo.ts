import { db } from "../database";
import type { PlotColumn, PlotCard } from "@/types/plot";
import { nanoid } from "nanoid";

export const plotColumnRepo = {
  async getByProject(projectId: string): Promise<PlotColumn[]> {
    return db.plotColumns.where("projectId").equals(projectId).sortBy("order");
  },

  async create(
    data: Omit<PlotColumn, "id">
  ): Promise<string> {
    const id = nanoid();
    await db.plotColumns.add({ ...data, id });
    return id;
  },

  async update(id: string, data: Partial<PlotColumn>): Promise<void> {
    await db.plotColumns.update(id, data);
  },

  async delete(id: string): Promise<void> {
    await db.plotCards.where("columnId").equals(id).delete();
    await db.plotColumns.delete(id);
  },

  async initializeDefault(projectId: string): Promise<void> {
    const existing = await db.plotColumns
      .where("projectId")
      .equals(projectId)
      .count();
    if (existing > 0) return;

    const defaults = [
      { title: "발단", color: "#3b82f6", order: 0 },
      { title: "전개", color: "#8b5cf6", order: 1 },
      { title: "위기", color: "#ef4444", order: 2 },
      { title: "절정", color: "#f59e0b", order: 3 },
      { title: "결말", color: "#22c55e", order: 4 },
    ];

    for (const col of defaults) {
      await db.plotColumns.add({
        id: nanoid(),
        projectId,
        ...col,
      });
    }
  },
};

export const plotCardRepo = {
  async getByProject(projectId: string): Promise<PlotCard[]> {
    return db.plotCards.where("projectId").equals(projectId).sortBy("order");
  },

  async getByColumn(columnId: string): Promise<PlotCard[]> {
    return db.plotCards.where("columnId").equals(columnId).sortBy("order");
  },

  async create(
    data: Omit<PlotCard, "id">
  ): Promise<string> {
    const id = nanoid();
    await db.plotCards.add({ ...data, id });
    return id;
  },

  async update(id: string, data: Partial<PlotCard>): Promise<void> {
    await db.plotCards.update(id, data);
  },

  async moveToColumn(id: string, columnId: string, order: number): Promise<void> {
    await db.plotCards.update(id, { columnId, order });
  },

  async delete(id: string): Promise<void> {
    await db.plotCards.delete(id);
  },
};
