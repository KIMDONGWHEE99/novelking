"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const DEFAULT_WRITING_STYLES = [
  "대중소설",
  "순문학",
  "라이트노벨",
  "웹소설",
  "시나리오",
  "동화",
];

interface AppState {
  // AI 설정
  activeProvider: string;
  activeModel: string;

  // 프롬프트 커스터마이징
  customTransformPrompt: string;
  customWritePrompt: string;
  writingStyle: string;
  customStyles: string[];
  stylePrompts: Record<string, string>; // 문체별 커스텀 프롬프트

  // UI 상태
  sidebarOpen: boolean;
  aiPanelOpen: boolean;

  // Actions
  setActiveProvider: (provider: string) => void;
  setActiveModel: (model: string) => void;
  setCustomTransformPrompt: (prompt: string) => void;
  setCustomWritePrompt: (prompt: string) => void;
  setWritingStyle: (style: string) => void;
  addCustomStyle: (style: string) => void;
  removeCustomStyle: (style: string) => void;
  setStylePrompt: (style: string, prompt: string) => void;
  resetStylePrompt: (style: string) => void;
  toggleSidebar: () => void;
  toggleAiPanel: () => void;
  setAiPanelOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeProvider: "anthropic",
      activeModel: "claude-sonnet-4-6-20250514",
      customTransformPrompt: "",
      customWritePrompt: "",
      writingStyle: "대중소설",
      customStyles: [],
      stylePrompts: {},
      sidebarOpen: true,
      aiPanelOpen: false,

      setActiveProvider: (provider) => set({ activeProvider: provider }),
      setActiveModel: (model) => set({ activeModel: model }),
      setCustomTransformPrompt: (prompt) =>
        set({ customTransformPrompt: prompt }),
      setCustomWritePrompt: (prompt) => set({ customWritePrompt: prompt }),
      setWritingStyle: (style) => set({ writingStyle: style }),
      addCustomStyle: (style) =>
        set((state) => ({
          customStyles: [...state.customStyles, style],
        })),
      removeCustomStyle: (style) =>
        set((state) => {
          const { [style]: _, ...restPrompts } = state.stylePrompts;
          return {
            customStyles: state.customStyles.filter((s) => s !== style),
            stylePrompts: restPrompts,
            writingStyle:
              state.writingStyle === style ? "대중소설" : state.writingStyle,
          };
        }),
      setStylePrompt: (style, prompt) =>
        set((state) => ({
          stylePrompts: { ...state.stylePrompts, [style]: prompt },
        })),
      resetStylePrompt: (style) =>
        set((state) => {
          const { [style]: _, ...rest } = state.stylePrompts;
          return { stylePrompts: rest };
        }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleAiPanel: () =>
        set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
      setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
    }),
    {
      name: "novelking-settings",
    }
  )
);
