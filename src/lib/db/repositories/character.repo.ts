import { db } from "../database";
import type { Character } from "@/types/character";
import { nanoid } from "nanoid";

export const characterRepo = {
  async getByProject(projectId: string): Promise<Character[]> {
    return db.characters
      .where("projectId")
      .equals(projectId)
      .toArray();
  },

  async getById(id: string): Promise<Character | undefined> {
    return db.characters.get(id);
  },

  async create(
    data: Omit<Character, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = nanoid();
    const now = new Date();
    await db.characters.add({
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },

  async update(id: string, data: Partial<Character>): Promise<void> {
    await db.characters.update(id, { ...data, updatedAt: new Date() });
  },

  async delete(id: string): Promise<void> {
    await db.characters.delete(id);
  },
};
