import Dexie, { type Table } from "dexie";
import type { Project, Chapter } from "@/types/project";
import type { Character } from "@/types/character";
import type { WorldElement } from "@/types/world";
import type { PlotColumn, PlotCard } from "@/types/plot";
import type { AiSettings, ChatSession, ChatMessage } from "@/types/ai";

export class NovelKingDB extends Dexie {
  projects!: Table<Project>;
  chapters!: Table<Chapter>;
  characters!: Table<Character>;
  worldElements!: Table<WorldElement>;
  plotColumns!: Table<PlotColumn>;
  plotCards!: Table<PlotCard>;
  chatSessions!: Table<ChatSession>;
  chatMessages!: Table<ChatMessage>;
  aiSettings!: Table<AiSettings>;

  constructor() {
    super("NovelKingDB");
    this.version(1).stores({
      projects: "&id, title, updatedAt",
      chapters: "&id, projectId, order, updatedAt",
      characters: "&id, projectId, *tags",
      worldElements: "&id, projectId, type",
      plotColumns: "&id, projectId, order",
      plotCards: "&id, projectId, columnId, order",
      chatSessions: "&id, projectId, updatedAt",
      chatMessages: "&id, sessionId, createdAt",
      aiSettings: "&id",
    });
  }
}

export const db = new NovelKingDB();
