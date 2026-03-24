export interface Project {
  id: string;
  title: string;
  description: string;
  genre: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  defaultLlmProvider: string;
  defaultLlmModel: string;
  writingStyle: string;
}

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  content: string; // Tiptap HTML 문자열
  rawDraft: string; // AI 변환 전 원본
  wordCount: number;
  order: number;
  status: ChapterStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ChapterStatus =
  | "draft"
  | "writing"
  | "ai-transformed"
  | "editing"
  | "complete";
