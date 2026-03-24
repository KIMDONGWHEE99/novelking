"use client";

import { useAppStore, DEFAULT_WRITING_STYLES } from "@/lib/store/app-store";
import { PROVIDERS, getModelsForProvider } from "@/lib/ai/provider-registry";
import { DEFAULT_TRANSFORM_PROMPT } from "@/lib/ai/prompts/transform";
import { DEFAULT_WRITE_PROMPT } from "@/lib/ai/prompts/write";
import { DEFAULT_STYLE_PROMPTS } from "@/lib/ai/prompts/styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  ChevronLeft,
  RotateCcw,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Pencil,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  const {
    activeProvider,
    activeModel,
    setActiveProvider,
    setActiveModel,
    customTransformPrompt,
    customWritePrompt,
    writingStyle,
    customStyles,
    stylePrompts,
    setCustomTransformPrompt,
    setCustomWritePrompt,
    setWritingStyle,
    addCustomStyle,
    removeCustomStyle,
    setStylePrompt,
    resetStylePrompt,
  } = useAppStore();

  const [newStyle, setNewStyle] = useState("");
  const [showDefaultTransform, setShowDefaultTransform] = useState(false);
  const [showDefaultWrite, setShowDefaultWrite] = useState(false);
  const [editingStyle, setEditingStyle] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState("");

  const models = getModelsForProvider(activeProvider);
  const allStyles = [...DEFAULT_WRITING_STYLES, ...customStyles];

  function handleProviderChange(provider: string | null) {
    if (!provider) return;
    setActiveProvider(provider);
    const providerModels = getModelsForProvider(provider);
    if (providerModels.length > 0) {
      setActiveModel(providerModels[0].id);
    }
  }

  function handleAddStyle() {
    const trimmed = newStyle.trim();
    if (!trimmed || allStyles.includes(trimmed)) return;
    addCustomStyle(trimmed);
    setNewStyle("");
  }

  function startEditStyle(style: string) {
    setEditingStyle(style);
    // 커스텀 프롬프트가 있으면 그것을, 없으면 기본 프롬프트를 편집 시작값으로
    setEditingPrompt(
      stylePrompts[style] ?? DEFAULT_STYLE_PROMPTS[style] ?? ""
    );
  }

  function saveStylePrompt(style: string) {
    const defaultPrompt = DEFAULT_STYLE_PROMPTS[style] ?? "";
    if (editingPrompt.trim() === defaultPrompt.trim()) {
      // 기본값과 같으면 커스텀 제거
      resetStylePrompt(style);
    } else {
      setStylePrompt(style, editingPrompt);
    }
    setEditingStyle(null);
  }

  function getDisplayPrompt(style: string): string {
    return stylePrompts[style] ?? DEFAULT_STYLE_PROMPTS[style] ?? `문체 스타일: ${style}`;
  }

  function isModified(style: string): boolean {
    return !!stylePrompts[style];
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            돌아가기
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold">설정</h1>

        {/* AI 제공자 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>AI 설정</CardTitle>
            <CardDescription>
              소설 변환과 브레인스토밍에 사용할 AI를 설정하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>AI 제공자</Label>
              <Select value={activeProvider} onValueChange={handleProviderChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>모델</Label>
              <Select value={activeModel} onValueChange={(v) => v && setActiveModel(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 문체 스타일 */}
        <Card>
          <CardHeader>
            <CardTitle>문체 스타일</CardTitle>
            <CardDescription>
              각 문체의 프롬프트를 확인하고 수정할 수 있습니다. 클릭하여 선택,
              연필 아이콘으로 프롬프트를 편집하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 스타일 목록 */}
            <div className="space-y-2">
              {allStyles.map((style) => {
                const isActive = writingStyle === style;
                const isCustomStyle = customStyles.includes(style);
                const modified = isModified(style);
                const isEditing = editingStyle === style;

                return (
                  <div
                    key={style}
                    className={`rounded-lg border p-3 transition-colors ${
                      isActive ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    {/* 스타일 헤더 */}
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-2 cursor-pointer flex-1"
                        onClick={() => setWritingStyle(style)}
                      >
                        <div
                          className={`w-3 h-3 rounded-full border-2 ${
                            isActive
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        />
                        <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {style}
                        </span>
                        {modified && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            수정됨
                          </Badge>
                        )}
                        {isCustomStyle && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                            커스텀
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!isEditing ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => startEditStyle(style)}
                            title="프롬프트 편집"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-green-500"
                              onClick={() => saveStylePrompt(style)}
                              title="저장"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setEditingStyle(null)}
                              title="취소"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {modified && !isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => resetStylePrompt(style)}
                            title="기본값으로 복원"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {isCustomStyle && !isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeCustomStyle(style)}
                            title="삭제"
                          >
                            <X className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 프롬프트 편집/표시 */}
                    {isEditing ? (
                      <div className="mt-2">
                        <Textarea
                          value={editingPrompt}
                          onChange={(e) => setEditingPrompt(e.target.value)}
                          rows={8}
                          className="text-xs"
                          placeholder="이 문체가 적용될 때 AI에게 전달할 지시사항을 작성하세요"
                        />
                        {DEFAULT_STYLE_PROMPTS[style] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-6 text-[10px] gap-1"
                            onClick={() => setEditingPrompt(DEFAULT_STYLE_PROMPTS[style])}
                          >
                            <RotateCcw className="h-3 w-3" />
                            기본값 불러오기
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                        {getDisplayPrompt(style).split("\n").slice(0, 2).join(" / ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 새 문체 추가 */}
            <Separator />
            <div className="flex gap-2">
              <Input
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
                placeholder="새 문체 추가 (예: 하드보일드, 고전체, 구어체...)"
                className="text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleAddStyle()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddStyle}
                disabled={!newStyle.trim()}
                className="shrink-0 gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                추가
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 프롬프트 커스터마이징 */}
        <Card>
          <CardHeader>
            <CardTitle>시스템 프롬프트</CardTitle>
            <CardDescription>
              AI에게 전달되는 기본 시스템 프롬프트입니다. 비워두면 기본
              프롬프트만 사용됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 변환 프롬프트 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">변환 프롬프트 (추가 지시)</Label>
                {customTransformPrompt && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs gap-1"
                    onClick={() => setCustomTransformPrompt("")}>
                    <RotateCcw className="h-3 w-3" /> 초기화
                  </Button>
                )}
              </div>
              <button
                onClick={() => setShowDefaultTransform(!showDefaultTransform)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {showDefaultTransform ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                기본 프롬프트 확인
              </button>
              {showDefaultTransform && (
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground whitespace-pre-wrap border">
                  {DEFAULT_TRANSFORM_PROMPT}
                </div>
              )}
              <Textarea
                value={customTransformPrompt}
                onChange={(e) => setCustomTransformPrompt(e.target.value)}
                placeholder="기본 프롬프트 + 문체 프롬프트 뒤에 추가됩니다. 예: '1인칭 시점, 대화는 반말로'"
                rows={3}
                className="text-sm"
              />
            </div>

            <Separator />

            {/* AI 작성 프롬프트 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">AI 작성 프롬프트 (추가 지시)</Label>
                {customWritePrompt && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs gap-1"
                    onClick={() => setCustomWritePrompt("")}>
                    <RotateCcw className="h-3 w-3" /> 초기화
                  </Button>
                )}
              </div>
              <button
                onClick={() => setShowDefaultWrite(!showDefaultWrite)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {showDefaultWrite ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                기본 프롬프트 확인
              </button>
              {showDefaultWrite && (
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground whitespace-pre-wrap border">
                  {DEFAULT_WRITE_PROMPT}
                </div>
              )}
              <Textarea
                value={customWritePrompt}
                onChange={(e) => setCustomWritePrompt(e.target.value)}
                placeholder="기본 프롬프트 + 문체 프롬프트 뒤에 추가됩니다."
                rows={3}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* 테마 설정 */}
        <Card>
          <CardHeader><CardTitle>화면 설정</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>다크 모드</Label>
                <p className="text-sm text-muted-foreground">화면 테마를 전환합니다</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
