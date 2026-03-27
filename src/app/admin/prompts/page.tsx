"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import {
  Loader2,
  Save,
  Play,
  ChevronRight,
  Trash2,
  Plus,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

// 카테고리 트리 구조
const PROMPT_TREE = [
  {
    label: "마법사 프롬프트",
    category: "wizard",
    items: [
      { subcategory: "synopsis", name: "시놉시스 생성" },
      { subcategory: "characters", name: "캐릭터 설계" },
      { subcategory: "world", name: "세계관 구축" },
      { subcategory: "plot", name: "챕터 구성" },
    ],
  },
  {
    label: "장르별 가이드라인",
    category: "genre",
    items: [
      { subcategory: "역사소설-synopsis", name: "역사소설 - 시놉시스" },
      { subcategory: "역사소설-characters", name: "역사소설 - 캐릭터" },
      { subcategory: "역사소설-world", name: "역사소설 - 세계관" },
      { subcategory: "역사소설-plot", name: "역사소설 - 플롯" },
      { subcategory: "판타지-synopsis", name: "판타지 - 시놉시스" },
      { subcategory: "판타지-characters", name: "판타지 - 캐릭터" },
      { subcategory: "판타지-world", name: "판타지 - 세계관" },
      { subcategory: "판타지-plot", name: "판타지 - 플롯" },
      { subcategory: "무협-synopsis", name: "무협 - 시놉시스" },
      { subcategory: "무협-characters", name: "무협 - 캐릭터" },
      { subcategory: "무협-world", name: "무협 - 세계관" },
      { subcategory: "무협-plot", name: "무협 - 플롯" },
      { subcategory: "SF-synopsis", name: "SF - 시놉시스" },
      { subcategory: "SF-characters", name: "SF - 캐릭터" },
      { subcategory: "SF-world", name: "SF - 세계관" },
      { subcategory: "SF-plot", name: "SF - 플롯" },
      { subcategory: "로맨스-synopsis", name: "로맨스 - 시놉시스" },
      { subcategory: "로맨스-characters", name: "로맨스 - 캐릭터" },
      { subcategory: "로맨스-world", name: "로맨스 - 세계관" },
      { subcategory: "로맨스-plot", name: "로맨스 - 플롯" },
      { subcategory: "미스터리/추리-synopsis", name: "미스터리 - 시놉시스" },
      { subcategory: "미스터리/추리-characters", name: "미스터리 - 캐릭터" },
      { subcategory: "미스터리/추리-world", name: "미스터리 - 세계관" },
      { subcategory: "미스터리/추리-plot", name: "미스터리 - 플롯" },
      { subcategory: "스릴러/호러-synopsis", name: "스릴러 - 시놉시스" },
      { subcategory: "스릴러/호러-characters", name: "스릴러 - 캐릭터" },
      { subcategory: "현대소설-synopsis", name: "현대소설 - 시놉시스" },
      { subcategory: "현대소설-characters", name: "현대소설 - 캐릭터" },
      { subcategory: "라이트노벨-synopsis", name: "라이트노벨 - 시놉시스" },
      { subcategory: "라이트노벨-characters", name: "라이트노벨 - 캐릭터" },
    ],
  },
  {
    label: "AI 작성",
    category: "write",
    items: [
      { subcategory: "system", name: "기본 작성 프롬프트" },
      { subcategory: "length", name: "분량 지침" },
    ],
  },
  {
    label: "텍스트 변환",
    category: "transform",
    items: [
      { subcategory: "system", name: "기본 변환 프롬프트" },
      { subcategory: "novel", name: "소설 문체" },
      { subcategory: "descriptive", name: "묘사 강화" },
      { subcategory: "dialogue", name: "대화체" },
      { subcategory: "tension", name: "긴장감" },
      { subcategory: "emotion", name: "감정 표현" },
      { subcategory: "concise", name: "간결체" },
    ],
  },
  {
    label: "브레인스토밍",
    category: "brainstorm",
    items: [{ subcategory: "system", name: "시스템 프롬프트" }],
  },
  {
    label: "원고 검토",
    category: "review",
    items: [{ subcategory: "system", name: "시스템 프롬프트" }],
  },
];

interface PromptTemplate {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  content: string;
  is_active: boolean;
  version: number;
  updated_at: string;
}

const MODEL_OPTIONS = [
  { value: "claude-haiku-4-5-20251001", label: "Haiku 4.5 (빠름)" },
  { value: "claude-sonnet-4-5-20250929", label: "Sonnet 4.5 (균형)" },
];

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState("");
  const [testModel, setTestModel] = useState("claude-haiku-4-5-20251001");
  const [error, setError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["wizard", "genre"])
  );

  const loadPrompts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/prompts");
      if (!res.ok) {
        setError("접근 권한이 없습니다.");
        return;
      }
      const { prompts: data } = await res.json();
      setPrompts(data || []);
    } catch {
      setError("프롬프트 로드 실패");
    }
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // 선택된 카테고리+서브카테고리의 프롬프트 찾기
  function getPromptByKey(key: string): PromptTemplate | undefined {
    const [category, subcategory] = key.split("::");
    return prompts.find(
      (p) => p.category === category && p.subcategory === subcategory
    );
  }

  function handleSelect(category: string, subcategory: string, name: string) {
    const key = `${category}::${subcategory}`;
    setSelectedKey(key);
    const existing = getPromptByKey(key);
    setEditContent(existing?.content || "");
    setEditName(existing?.name || name);
    setTestResult("");
  }

  async function handleSave() {
    if (!selectedKey || !editContent.trim()) return;
    setIsSaving(true);

    const [category, subcategory] = selectedKey.split("::");
    const existing = getPromptByKey(selectedKey);

    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: existing?.id,
          category,
          subcategory,
          name: editName,
          content: editContent,
        }),
      });

      if (!res.ok) {
        alert("저장 실패");
        return;
      }

      await loadPrompts();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedKey) return;
    const existing = getPromptByKey(selectedKey);
    if (!existing) return;

    if (!confirm("이 프롬프트를 삭제하시겠습니까? (코드 기본값으로 돌아갑니다)")) return;

    try {
      await fetch("/api/admin/prompts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: existing.id }),
      });

      await loadPrompts();
      setEditContent("");
    } catch {
      alert("삭제 실패");
    }
  }

  async function handleTest() {
    if (!editContent.trim()) return;
    setIsTesting(true);
    setTestResult("");

    try {
      const res = await fetch("/api/admin/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: editContent,
          userPrompt: testInput || '아이디어: "사천당가의 가주가 21세기 대한민국 과학수사대 감식반으로 타임슬립"\n장르: 무협',
          model: testModel,
        }),
      });

      if (!res.ok) {
        setTestResult("테스트 실패: " + (await res.text()));
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setTestResult(text);
      }
    } catch (e) {
      setTestResult("에러: " + String(e));
    } finally {
      setIsTesting(false);
    }
  }

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <Link href="/">
              <Button variant="outline" className="mt-4">홈으로</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 헤더 */}
      <div className="border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-bold text-lg">프롬프트 관리</h1>
          <Badge variant="destructive" className="text-[10px]">Admin</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadPrompts} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 본문: 3단 레이아웃 */}
      <div className="flex flex-1 min-h-0">
        {/* 왼쪽: 카테고리 트리 */}
        <div className="w-64 border-r overflow-y-auto shrink-0 p-2">
          {PROMPT_TREE.map((group) => (
            <div key={group.category} className="mb-1">
              <button
                className="flex items-center gap-1 w-full px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded"
                onClick={() => toggleCategory(group.category)}
              >
                <ChevronRight
                  className={`h-3 w-3 transition-transform ${
                    expandedCategories.has(group.category) ? "rotate-90" : ""
                  }`}
                />
                {group.label}
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  {prompts.filter((p) => p.category === group.category).length}
                </Badge>
              </button>

              {expandedCategories.has(group.category) && (
                <div className="ml-4">
                  {group.items.map((item) => {
                    const key = `${group.category}::${item.subcategory}`;
                    const isActive = selectedKey === key;
                    const hasCustom = prompts.some(
                      (p) =>
                        p.category === group.category &&
                        p.subcategory === item.subcategory
                    );
                    return (
                      <button
                        key={key}
                        className={`flex items-center gap-1.5 w-full px-2 py-1 text-xs rounded transition-colors ${
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent/50"
                        }`}
                        onClick={() =>
                          handleSelect(group.category, item.subcategory, item.name)
                        }
                      >
                        <span className="truncate">{item.name}</span>
                        {hasCustom && (
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 가운데: 프롬프트 편집기 */}
        <div className="flex-1 flex flex-col min-w-0 border-r">
          {selectedKey ? (
            <>
              <div className="border-b px-4 py-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 text-sm font-medium w-48"
                  />
                  {getPromptByKey(selectedKey) && (
                    <Badge variant="outline" className="text-[10px] text-green-500">
                      DB 저장됨
                    </Badge>
                  )}
                  {!getPromptByKey(selectedKey) && (
                    <Badge variant="outline" className="text-[10px]">
                      기본값 (코드)
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {getPromptByKey(selectedKey) && (
                    <Button variant="ghost" size="sm" onClick={handleDelete} className="gap-1 text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    저장
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-2 min-h-0">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="h-full resize-none font-mono text-xs leading-relaxed"
                  placeholder="프롬프트를 입력하세요..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">왼쪽에서 프롬프트를 선택하세요</p>
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 테스트 패널 */}
        <div className="w-96 flex flex-col shrink-0">
          <div className="border-b px-4 py-2 shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">테스트</p>
              <select
                value={testModel}
                onChange={(e) => setTestModel(e.target.value)}
                className="text-xs bg-transparent border rounded px-2 py-1"
              >
                {MODEL_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-2 border-b shrink-0">
            <Textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder={'테스트 입력 (비워두면 기본값 사용)\n예: 아이디어: "사천당가 가주가..." \n장르: 무협'}
              rows={3}
              className="text-xs"
            />
            <Button
              size="sm"
              className="w-full mt-2 gap-1.5"
              onClick={handleTest}
              disabled={isTesting || !editContent.trim()}
            >
              {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {isTesting ? "생성 중..." : "테스트 실행"}
            </Button>
          </div>

          <Card className="flex-1 m-2 overflow-hidden">
            <CardHeader className="py-2 px-3">
              <CardDescription className="text-xs">AI 응답 결과</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3 overflow-y-auto">
              {testResult ? (
                <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
                  {testResult}
                </pre>
              ) : (
                <p className="text-xs text-muted-foreground">
                  테스트를 실행하면 여기에 결과가 표시됩니다
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
