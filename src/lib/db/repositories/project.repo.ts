import { db } from "../database";
import type { Project } from "@/types/project";
import type { Chapter } from "@/types/project";
import { nanoid } from "nanoid";

export const projectRepo = {
  async getAll(): Promise<Project[]> {
    return db.projects.orderBy("updatedAt").reverse().toArray();
  },

  async getById(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  },

  async create(
    data: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = nanoid();
    const now = new Date();
    await db.projects.add({
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },

  async update(id: string, data: Partial<Project>): Promise<void> {
    await db.projects.update(id, { ...data, updatedAt: new Date() });
  },

  async delete(id: string): Promise<void> {
    await db.transaction(
      "rw",
      [
        db.projects,
        db.chapters,
        db.characters,
        db.worldElements,
        db.plotColumns,
        db.plotCards,
        db.chatSessions,
        db.chatMessages,
      ],
      async () => {
        // 관련 데이터 모두 삭제
        const sessions = await db.chatSessions
          .where("projectId")
          .equals(id)
          .toArray();
        for (const session of sessions) {
          await db.chatMessages
            .where("sessionId")
            .equals(session.id)
            .delete();
        }
        await db.chatSessions.where("projectId").equals(id).delete();
        await db.plotCards.where("projectId").equals(id).delete();
        await db.plotColumns.where("projectId").equals(id).delete();
        await db.worldElements.where("projectId").equals(id).delete();
        await db.characters.where("projectId").equals(id).delete();
        await db.chapters.where("projectId").equals(id).delete();
        await db.projects.delete(id);
      }
    );
  },
};

export const chapterRepo = {
  async getByProject(projectId: string): Promise<Chapter[]> {
    return db.chapters
      .where("projectId")
      .equals(projectId)
      .sortBy("order");
  },

  async getById(id: string): Promise<Chapter | undefined> {
    return db.chapters.get(id);
  },

  async create(
    data: Omit<Chapter, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = nanoid();
    const now = new Date();
    await db.chapters.add({
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },

  async update(id: string, data: Partial<Chapter>): Promise<void> {
    await db.chapters.update(id, { ...data, updatedAt: new Date() });
  },

  async updateContent(id: string, content: string): Promise<void> {
    const wordCount = content.replace(/<[^>]*>/g, "").length;
    await db.chapters.update(id, {
      content,
      wordCount,
      updatedAt: new Date(),
    });
  },

  async saveRawDraft(id: string, rawDraft: string): Promise<void> {
    await db.chapters.update(id, { rawDraft, updatedAt: new Date() });
  },

  async delete(id: string): Promise<void> {
    await db.chapters.delete(id);
  },
};
