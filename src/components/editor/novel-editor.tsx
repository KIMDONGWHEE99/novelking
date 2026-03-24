"use client";

import { useCallback, useRef, useEffect } from "react";
import {
  EditorRoot,
  EditorContent,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  useEditor,
  type JSONContent,
} from "novel";
import type { Editor } from "@tiptap/core";
import { defaultExtensions } from "./extensions";
import { slashCommand, suggestionItems } from "./slash-command";
import { AiBubbleMenu } from "./ai-bubble-menu";

const extensions = [...defaultExtensions, slashCommand];

interface NovelEditorProps {
  initialContent?: string;
  onUpdate?: (html: string) => void;
  onEditorReady?: (editor: Editor) => void;
  className?: string;
}

// 에디터 인스턴스를 외부로 전달하는 브릿지 컴포넌트
function EditorInstanceBridge({
  onReady,
}: {
  onReady: (editor: Editor) => void;
}) {
  const { editor } = useEditor();
  useEffect(() => {
    if (editor) onReady(editor);
  }, [editor, onReady]);
  return null;
}

// HTML 문자열인지 판별
function isHtmlString(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str.trim());
}

export function NovelEditor({
  initialContent,
  onUpdate,
  onEditorReady,
  className,
}: NovelEditorProps) {
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const htmlContentRef = useRef<string | null>(null);

  // 디바운싱된 저장 (500ms)
  const handleUpdate = useCallback(
    ({ editor }: { editor: { getHTML: () => string } }) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const html = editor.getHTML();
        onUpdate?.(html);
      }, 500);
    },
    [onUpdate]
  );

  // 초기 콘텐츠 처리
  let parsedContent: JSONContent | undefined;
  if (initialContent) {
    try {
      // JSON 형식이면 그대로 사용
      parsedContent = JSON.parse(initialContent);
    } catch {
      if (isHtmlString(initialContent)) {
        // HTML 문자열이면 onCreate에서 setContent로 로드
        htmlContentRef.current = initialContent;
        parsedContent = undefined;
      } else {
        // 순수 텍스트면 단락으로 변환
        parsedContent = {
          type: "doc",
          content: initialContent.split("\n").map((line) => ({
            type: "paragraph",
            content: line ? [{ type: "text", text: line }] : [],
          })),
        };
      }
    }
  }

  // 에디터 생성 시 HTML 콘텐츠 로드
  const handleCreate = useCallback(
    ({ editor }: { editor: Editor }) => {
      if (htmlContentRef.current) {
        editor.commands.setContent(htmlContentRef.current);
        htmlContentRef.current = null;
      }
    },
    []
  );

  return (
    <EditorRoot>
      <EditorContent
        className={className}
        extensions={extensions}
        initialContent={parsedContent}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        immediatelyRender={false}
      >
        {/* 에디터 인스턴스를 부모 컴포넌트로 전달 */}
        {onEditorReady && <EditorInstanceBridge onReady={onEditorReady} />}

        {/* 슬래시 명령어 */}
        <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border bg-background p-2 shadow-xl transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground text-sm">
            명령어를 찾을 수 없어요
          </EditorCommandEmpty>
          {suggestionItems.map((item) => (
            <EditorCommandItem
              key={item.title}
              value={item.title}
              onCommand={(val) => item.command?.(val)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
                {item.icon}
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </EditorCommandItem>
          ))}
        </EditorCommand>

        {/* AI 버블 메뉴 */}
        <AiBubbleMenu />
      </EditorContent>
    </EditorRoot>
  );
}
