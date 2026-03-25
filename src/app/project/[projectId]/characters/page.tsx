"use client";

import { use, useState, useRef } from "react";
import { useCharacters } from "@/lib/db/hooks/use-characters";
import { useProject } from "@/lib/db/hooks/use-projects";
import { useWorldElements } from "@/lib/db/hooks/use-world";
import { supabaseCharacterRepo } from "@/lib/db/repositories/supabase/character.repo";
import { useAppStore } from "@/lib/store/app-store";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Users,
  Sparkles,
  Loader2,
  Trash2,
  ImagePlus,
  Globe,
} from "lucide-react";
import Link from "next/link";

const ROLE_OPTIONS = ["주인공", "조력자", "적대자", "연인", "멘토", "조연", "기타"];
const TAG_COLORS: Record<string, string> = {
  주인공: "bg-green-500/20 text-green-400",
  남성: "bg-blue-500/20 text-blue-400",
  여성: "bg-pink-500/20 text-pink-400",
  적대자: "bg-red-500/20 text-red-400",
  조력자: "bg-yellow-500/20 text-yellow-400",
  소설: "bg-orange-500/20 text-orange-400",
};
const WORLD_TAG_COLOR = "bg-purple-500/20 text-purple-400";

// 이미지 파일을 base64로 변환
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CharactersPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { characters, isLoading, refetch } = useCharacters(projectId);
  const { project } = useProject(projectId);
  const { elements: worldElements } = useWorldElements(projectId);
  const { activeProvider, activeModel } = useAppStore();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("주인공");
  const [briefDesc, setBriefDesc] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [illustrationPreview, setIllustrationPreview] = useState<string | null>(null);
  const [selectedWorldElements, setSelectedWorldElements] = useState<string[]>([]);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const illustrationInputRef = useRef<HTMLInputElement>(null);

  // 모든 태그 수집 (일반 태그 + 세계관 요소 이름)
  const allTags = Array.from(
    new Set(characters?.flatMap((c) => c.tags) ?? [])
  );

  // 태그 필터 적용
  const filtered = filterTag
    ? characters?.filter((c) => c.tags.includes(filterTag))
    : characters;

  async function handleImageSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "illustration"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    if (type === "profile") setProfilePreview(base64);
    else setIllustrationPreview(base64);
  }

  function toggleWorldElement(id: string) {
    setSelectedWorldElements((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleCreate(withAi: boolean) {
    if (!name.trim()) return;

    if (withAi) {
      setIsGenerating(true);
      try {
        const res = await fetch("/api/ai/template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "character",
            input: `이름: ${name}\n역할: ${role}${briefDesc ? `\n추가 정보: ${briefDesc}` : ""}`,
            genre: project?.genre,
            provider: activeProvider,
            model: activeModel,
          }),
        });

        if (!res.ok) {
          alert("AI 생성에 실패했습니다.");
          setIsGenerating(false);
          return;
        }

        const { content } = await res.json();
        let parsed;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          parsed = JSON.parse(jsonMatch?.[0] ?? content);
        } catch {
          parsed = { description: briefDesc, backstory: "", traits: [] };
        }

        await supabaseCharacterRepo.create({
          projectId,
          name: name.trim(),
          role,
          profileImage: profilePreview ?? undefined,
          illustrationImage: illustrationPreview ?? undefined,
          tags: [role],
          worldElementIds: selectedWorldElements.length > 0 ? selectedWorldElements : undefined,
          description: parsed.description || briefDesc,
          backstory: parsed.backstory || "",
          traits: parsed.traits || [],
          relationships: [],
          generatedContent: content,
        });
      } finally {
        setIsGenerating(false);
      }
    } else {
      await supabaseCharacterRepo.create({
        projectId,
        name: name.trim(),
        role,
        profileImage: profilePreview ?? undefined,
        illustrationImage: illustrationPreview ?? undefined,
        tags: [role],
        worldElementIds: selectedWorldElements.length > 0 ? selectedWorldElements : undefined,
        description: briefDesc,
        backstory: "",
        traits: [],
        relationships: [],
      });
    }

    refetch();
    setOpen(false);
    resetForm();
  }

  function resetForm() {
    setName("");
    setRole("주인공");
    setBriefDesc("");
    setProfilePreview(null);
    setIllustrationPreview(null);
    setSelectedWorldElements([]);
  }

  async function handleDelete(id: string, charName: string) {
    if (confirm(`'${charName}' 캐릭터를 삭제하시겠습니까?`)) {
      await supabaseCharacterRepo.delete(id);
      refetch();
    }
  }

  // 캐릭터에 연결된 세계관 요소 이름 가져오기
  function getWorldElementNames(ids?: string[]): string[] {
    if (!ids || !worldElements) return [];
    return ids
      .map((id) => worldElements.find((w) => w.id === id)?.title)
      .filter(Boolean) as string[];
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">캐릭터</h1>
          <p className="text-sm text-muted-foreground">
            {characters?.length ?? 0}명의 등장인물
          </p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer">
            <Plus className="h-4 w-4" />
            새 캐릭터
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 캐릭터 만들기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* 이미지 업로드 */}
              <div className="flex gap-4">
                {/* 프로필 이미지 */}
                <div className="space-y-1">
                  <Label className="text-xs">프로필</Label>
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageSelect(e, "profile")}
                  />
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className="h-20 w-20 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex items-center justify-center overflow-hidden transition-colors cursor-pointer"
                  >
                    {profilePreview ? (
                      <img src={profilePreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-muted-foreground/50" />
                    )}
                  </button>
                </div>
                {/* 일러스트 이미지 */}
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">일러스트</Label>
                  <input
                    ref={illustrationInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageSelect(e, "illustration")}
                  />
                  <button
                    type="button"
                    onClick={() => illustrationInputRef.current?.click()}
                    className="w-full h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex items-center justify-center overflow-hidden transition-colors cursor-pointer"
                  >
                    {illustrationPreview ? (
                      <img src={illustrationPreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground/50 text-xs">
                        <ImagePlus className="h-4 w-4" />
                        메인 일러스트
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>이름</Label>
                <Input
                  placeholder="캐릭터 이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>역할</Label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((r) => (
                    <Badge
                      key={r}
                      variant={role === r ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setRole(r)}
                    >
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 세계관 요소 연결 */}
              {worldElements && worldElements.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    세계관 연결
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {worldElements.map((we) => (
                      <Badge
                        key={we.id}
                        variant={selectedWorldElements.includes(we.id) ? "default" : "outline"}
                        className={`cursor-pointer text-xs ${selectedWorldElements.includes(we.id) ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                        onClick={() => toggleWorldElement(we.id)}
                      >
                        {we.title}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    캐릭터와 관련된 세계관 설정을 선택하세요
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>간단한 설명 (AI 생성 시 참고)</Label>
                <Textarea
                  placeholder="예: 30대 남성, 전직 군인, 과묵하지만 따뜻한 성격"
                  value={briefDesc}
                  onChange={(e) => setBriefDesc(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCreate(true)}
                  disabled={!name.trim() || isGenerating}
                  className="flex-1 gap-1.5"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGenerating ? "AI 생성 중..." : "AI로 자동완성"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCreate(false)}
                  disabled={!name.trim() || isGenerating}
                >
                  직접 작성
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 태그 필터 */}
      {allTags.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <Badge
            variant={filterTag === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterTag(null)}
          >
            전체
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={filterTag === tag ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterTag(tag === filterTag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* 캐릭터 목록 */}
      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">
          로딩 중...
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((char) => (
            <Link
              key={char.id}
              href={`/project/${projectId}/characters/${char.id}`}
            >
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full group overflow-hidden">
                {/* 일러스트 이미지 (있을 경우) */}
                {char.illustrationImage && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={char.illustrationImage}
                      alt={char.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* 프로필 이미지 */}
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold overflow-hidden shrink-0">
                        {char.profileImage ? (
                          <img src={char.profileImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          char.name[0]
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {char.name}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-1">
                          {char.description || char.role}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(char.id, char.name);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {char.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] px-2 py-0.5 rounded-full ${TAG_COLORS[tag] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {tag}
                      </span>
                    ))}
                    {/* 세계관 요소 태그 */}
                    {getWorldElementNames(char.worldElementIds).map((weName) => (
                      <span
                        key={weName}
                        className={`text-[10px] px-2 py-0.5 rounded-full ${WORLD_TAG_COLOR}`}
                      >
                        {weName}
                      </span>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            아직 캐릭터가 없어요
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            이름만 입력하면 AI가 상세 프로필을 자동으로 만들어줍니다
          </p>
        </div>
      )}
    </div>
  );
}
