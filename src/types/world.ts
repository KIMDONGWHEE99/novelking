export interface WorldElement {
  id: string;
  projectId: string;
  type: WorldElementType;
  title: string;
  content: string;
  fields: WorldField[];
  generatedContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WorldElementType =
  | "setting"
  | "location"
  | "magic-system"
  | "culture"
  | "history"
  | "custom";

export interface WorldField {
  key: string;
  value: string;
}
