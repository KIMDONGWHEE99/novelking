"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ContextSelection } from "@/types/ai";

interface ContextSelectorProps {
  selection: ContextSelection;
  onChange: (selection: ContextSelection) => void;
}

const CONTEXT_OPTIONS = [
  { key: "projectInfo" as const, label: "프로젝트 정보", desc: "제목, 장르, 개요" },
  { key: "characters" as const, label: "캐릭터", desc: "등록된 등장인물" },
  { key: "worldSettings" as const, label: "세계관", desc: "세계관 설정" },
  { key: "previousChapters" as const, label: "이전 챕터", desc: "앞 챕터 내용" },
];

export function ContextSelector({ selection, onChange }: ContextSelectorProps) {
  const [expanded, setExpanded] = useState(false);

  function toggle(key: keyof Omit<ContextSelection, "customInstruction">) {
    onChange({ ...selection, [key]: !selection[key] });
  }

  const activeCount = CONTEXT_OPTIONS.filter((o) => selection[o.key]).length;

  return (
    <div className="border-b px-3 py-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground w-full"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        컨텍스트
        {activeCount > 0 && (
          <span className="ml-1 bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px]">
            {activeCount}개 선택
          </span>
        )}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5">
          {CONTEXT_OPTIONS.map((option) => (
            <label
              key={option.key}
              className="flex items-center gap-2 text-xs cursor-pointer hover:bg-accent/50 rounded px-1 py-1"
            >
              <input
                type="checkbox"
                checked={selection[option.key]}
                onChange={() => toggle(option.key)}
                className="rounded border-muted-foreground"
              />
              <span>{option.label}</span>
              <span className="text-muted-foreground">({option.desc})</span>
            </label>
          ))}
          <div className="pt-1">
            <Label className="text-xs text-muted-foreground">추가 지시사항</Label>
            <Textarea
              value={selection.customInstruction}
              onChange={(e) =>
                onChange({ ...selection, customInstruction: e.target.value })
              }
              placeholder="예: 1인칭 시점으로 써줘, 반말체 사용..."
              className="mt-1 text-xs min-h-[48px] resize-none"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}
