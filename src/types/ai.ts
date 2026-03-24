export interface AiSettings {
  id: string; // 'global'
  providers: ProviderConfig[];
  defaultProvider: string;
  defaultModel: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
  enabled: boolean;
}

export interface LlmModel {
  id: string;
  name: string;
  provider: string;
}

export interface TransformRequest {
  text: string;
  instruction: string;
  context?: TransformContext;
  provider: string;
  model: string;
}

export interface TransformContext {
  genre: string;
  characters: string[];
  previousChapter?: string;
  writingStyle?: string;
}

export interface ChatSession {
  id: string;
  projectId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

// AI 대리창작 컨텍스트 선택
export interface ContextSelection {
  projectInfo: boolean;
  characters: boolean;
  worldSettings: boolean;
  previousChapters: boolean;
  customInstruction: string;
}
