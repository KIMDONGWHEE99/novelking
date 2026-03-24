import { db } from "../database";
import type { WorldElement } from "@/types/world";
import { nanoid } from "nanoid";

export const worldRepo = {
  async getByProject(projectId: string): Promise<WorldElement[]> {
    return db.worldElements.where("projectId").equals(projectId).toArray();
  },

  async getById(id: string): Promise<WorldElement | undefined> {
    return db.worldElements.get(id);
  },

  async create(
    data: Omit<WorldElement, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = nanoid();
    const now = new Date();
    await db.worldElements.add({ ...data, id, createdAt: now, updatedAt: now });
    return id;
  },

  async update(id: string, data: Partial<WorldElement>): Promise<void> {
    await db.worldElements.update(id, { ...data, updatedAt: new Date() });
  },

  async delete(id: string): Promise<void> {
    await db.worldElements.delete(id);
  },
};
