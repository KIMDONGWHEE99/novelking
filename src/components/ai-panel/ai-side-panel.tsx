"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PanelRightClose } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { ContextSelector } from "./context-selector";
import { AiWriteTab } from "./ai-write-tab";
import { AiTransformTab } from "./ai-transform-tab";
import { AiReviewTab } from "./ai-review-tab";
import type { ContextSelection } from "@/types/ai";

interface AiSidePanelProps {
  projectId: string;
  chapterId: string;
  editor: Editor | null;
}

export function AiSidePanel({
  projectId,
  chapterId,
  editor,
}: AiSidePanelProps) {
  const { toggleAiPanel } = useAppStore();
  const [contextSelection, setContextSelection] = useState<ContextSelection>({
    projectInfo: true,
    characters: false,
    worldSettings: false,
    previousChapters: false,
    customInstruction: "",
  });

  return (
    <div className="w-full border-l flex flex-col h-full bg-card">
      <Tabs defaultValue="write" className="flex flex-col h-full">
        {/* 헤더 */}
        <div className="border-b px-3 py-2 flex items-center justify-between shrink-0">
          <TabsList className="h-8">
            <TabsTrigger value="write" className="text-xs px-3 h-7">
              AI 작성
            </TabsTrigger>
            <TabsTrigger value="transform" className="text-xs px-3 h-7">
              변환
            </TabsTrigger>
            <TabsTrigger value="review" className="text-xs px-3 h-7">
              교정
            </TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleAiPanel}
            title="패널 닫기"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>

        {/* 컨텍스트 선택 */}
        <ContextSelector
          selection={contextSelection}
          onChange={setContextSelection}
        />

        {/* 탭 내용 */}
        <TabsContent value="write" className="flex-1 m-0 overflow-hidden">
          <AiWriteTab
            projectId={projectId}
            chapterId={chapterId}
            editor={editor}
            contextSelection={contextSelection}
          />
        </TabsContent>
        <TabsContent value="transform" className="flex-1 m-0 overflow-hidden">
          <AiTransformTab
            projectId={projectId}
            chapterId={chapterId}
            editor={editor}
            contextSelection={contextSelection}
          />
        </TabsContent>
        <TabsContent value="review" className="flex-1 m-0 overflow-hidden">
          <AiReviewTab editor={editor} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
