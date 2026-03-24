"use client";

import { use, useState, useCallback } from "react";
import { useCharacter } from "@/lib/db/hooks/use-characters";
import { characterRepo } from "@/lib/db/repositories/character.repo";
import { useAppStore } from "@/lib/store/app-store";
import { useProject } from "@/lib/db/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Plus,
  X,
  Sparkles,
  Loader2,
  Save,
} from "lucide-react";
import Link from "next/link";

export default function CharacterDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; charId: string }>;
}) {
  const { projectId, charId } = use(params);
  const { character, isLoading } = useCharacter(charId);
  const { project } = useProject(projectId);
  const { activeProvider, activeModel, getApiKey } = useAppStore();

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [saved, setSaved] = useState(false);

  const save = useCallback(
    async (data: Record<string, unknown>) => {
      await characterRepo.update(charId, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    [charId]
  );

  async function handleRegenerate() {
    if (!character) return;
    const apiKey = getApiKey(activeProvider);
    if (!apiKey) {
      alert("설정에서 API 키를 먼저 입력해주세요.");
      return;
    }

    setIsRegenerating(true);
    try {
      const res = await fetch("/api/ai/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "character",
          input: `이름: ${character.name}\n역할: ${character.role}\n기존 설명: ${character.description}`,
          genre: project?.genre,
          provider: activeProvider,
          model: activeModel,
          apiKey,
        }),
      });

      if (!res.ok) {
        alert("AI 생성에 실패했습니다.");
        return;
      }

      const { content } = await res.json();
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch?.[0] ?? content);
        await save({
          description: parsed.description || character.description,
          backstory: parsed.backstory || character.backstory,
          traits: parsed.traits || character.traits,
          generatedContent: content,
        });
      } catch {
        // 파싱 실패 시 무시
      }
    } finally {
      setIsRegenerating(false);
    }
  }

  function handleAddTag() {
    if (!newTag.trim() || !character) return;
    const tags = [...character.tags, newTag.trim()];
    save({ tags });
    setNewTag("");
  }

  function handleRemoveTag(tag: string) {
    if (!character) return;
    save({ tags: character.tags.filter((t) => t !== tag) });
  }

  function handleTraitChange(index: number, field: "key" | "value", val: string) {
    if (!character) return;
    const traits = [...character.traits];
    traits[index] = { ...traits[index], [field]: val };
    save({ traits });
  }

  function handleAddTrait() {
    if (!character) return;
    save({ traits: [...character.traits, { key: "", value: "" }] });
  }

  function handleRemoveTrait(index: number) {
    if (!character) return;
    save({ traits: character.traits.filter((_, i) => i !== index) });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        캐릭터를 찾을 수 없습니다
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* 헤더 */}
      <Link
        href={`/project/${projectId}/characters`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        캐릭터 목록
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
            {character.name[0]}
          </div>
          <div>
            <Input
              value={character.name}
              onChange={(e) => save({ name: e.target.value })}
              className="text-2xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0"
            />
            <div className="flex items-center gap-2 mt-1">
              {character.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="태그 추가"
                  className="h-6 w-20 text-xs border-dashed"
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-green-500">저장됨</span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            AI 재생성
          </Button>
        </div>
      </div>

      {/* 설명 */}
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium">설명</Label>
          <Textarea
            value={character.description}
            onChange={(e) => save({ description: e.target.value })}
            placeholder="캐릭터에 대한 간단한 설명"
            className="mt-1"
            rows={2}
          />
        </div>

        <Separator />

        {/* 특성 카드 */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">캐릭터 특성</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  캐릭터의 외모, 성격, 능력 등을 정리하세요. 입력하면 자동 저장됩니다.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* 빠른 추가 버튼 */}
            <div className="flex flex-wrap gap-1.5">
              {["외모", "성격", "능력", "약점", "말투", "습관", "목표", "두려움"].map((preset) => {
                const exists = character.traits.some((t) => t.key === preset);
                return (
                  <Badge
                    key={preset}
                    variant={exists ? "secondary" : "outline"}
                    className={`cursor-pointer text-xs ${exists ? "opacity-50" : "hover:bg-primary/10"}`}
                    onClick={() => {
                      if (!exists) {
                        save({ traits: [...character.traits, { key: preset, value: "" }] });
                      }
                    }}
                  >
                    <Plus className="h-2.5 w-2.5 mr-0.5" />
                    {preset}
                  </Badge>
                );
              })}
            </div>

            <Separator />

            {/* 특성 목록 */}
            <div className="space-y-2">
              {character.traits.map((trait, i) => (
                <div key={i} className="flex gap-2 group">
                  <Input
                    value={trait.key}
                    onChange={(e) => handleTraitChange(i, "key", e.target.value)}
                    placeholder="특성 이름"
                    className="w-24 text-sm font-medium h-9 shrink-0"
                  />
                  <Textarea
                    value={trait.value}
                    onChange={(e) => handleTraitChange(i, "value", e.target.value)}
                    placeholder={
                      trait.key === "외모" ? "키, 체형, 머리색, 눈 색 등" :
                      trait.key === "성격" ? "내향적/외향적, 장단점 등" :
                      trait.key === "능력" ? "특기, 재능, 마법 등" :
                      trait.key === "약점" ? "두려움, 트라우마, 한계 등" :
                      trait.key === "말투" ? "존댓말, 사투리, 특유의 표현 등" :
                      trait.key === "습관" ? "무의식적 행동, 버릇 등" :
                      trait.key === "목표" ? "캐릭터가 이루고 싶은 것" :
                      trait.key === "두려움" ? "캐릭터가 가장 두려워하는 것" :
                      "이 특성에 대해 자유롭게 적어주세요"
                    }
                    className="flex-1 text-sm min-h-9 resize-none"
                    rows={1}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveTrait(i)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {character.traits.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  위 버튼을 클릭하여 캐릭터 특성을 추가하세요
                </p>
              )}
            </div>

            {/* 직접 추가 버튼 */}
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs gap-1 border-dashed"
              onClick={handleAddTrait}
            >
              <Plus className="h-3 w-3" />
              직접 입력으로 추가
            </Button>
          </CardContent>
        </Card>

        {/* 배경 스토리 */}
        <div>
          <Label className="text-sm font-medium">배경 스토리</Label>
          <Textarea
            value={character.backstory}
            onChange={(e) => save({ backstory: e.target.value })}
            placeholder="캐릭터의 과거와 배경 이야기"
            className="mt-1"
            rows={6}
          />
        </div>
      </div>
    </div>
  );
}
