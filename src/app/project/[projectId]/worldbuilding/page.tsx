"use client";

import { use, useState } from "react";
import { useWorldElements } from "@/lib/db/hooks/use-world";
import { useProject } from "@/lib/db/hooks/use-projects";
import { supabaseWorldRepo } from "@/lib/db/repositories/supabase/world.repo";
import { useAppStore } from "@/lib/store/app-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
  Globe,
  MapPin,
  Wand2,
  BookOpen,
  Clock,
  Sparkles,
  Loader2,
  Trash2,
  Edit,
  X,
} from "lucide-react";
import type { WorldElementType } from "@/types/world";

const TYPE_CONFIG: Record<WorldElementType, { label: string; icon: typeof Globe; color: string }> = {
  setting: { label: "배경 설정", icon: Globe, color: "bg-blue-500/20 text-blue-400" },
  location: { label: "장소", icon: MapPin, color: "bg-green-500/20 text-green-400" },
  "magic-system": { label: "마법/능력 체계", icon: Wand2, color: "bg-purple-500/20 text-purple-400" },
  culture: { label: "문화/사회", icon: BookOpen, color: "bg-orange-500/20 text-orange-400" },
  history: { label: "역사/사건", icon: Clock, color: "bg-yellow-500/20 text-yellow-400" },
  custom: { label: "기타", icon: Globe, color: "bg-muted text-muted-foreground" },
};

export default function WorldbuildingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { elements, isLoading } = useWorldElements(projectId);
  const { project } = useProject(projectId);
  const { activeProvider, activeModel } = useAppStore();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<WorldElementType>("setting");
  const [briefDesc, setBriefDesc] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // 편집 모드
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  async function handleCreate(withAi: boolean) {
    if (!title.trim()) return;

    let content = briefDesc;
    let generatedContent: string | undefined;

    if (withAi) {
      setIsGenerating(true);
      try {
        const res = await fetch("/api/ai/write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{
              role: "user",
              content: `소설의 세계관 요소를 상세하게 작성해주세요.\n\n유형: ${TYPE_CONFIG[type].label}\n이름: ${title}\n${briefDesc ? `참고 정보: ${briefDesc}` : ""}\n\n마크다운 형식으로 제목, 설명, 특징, 규칙 등을 포함해주세요. 소설에서 활용할 수 있도록 구체적으로 써주세요.`,
            }],
            contextBlock: project ? `장르: ${project.genre}\n소설 제목: ${project.title}` : "",
            provider: activeProvider,
            model: activeModel,
          }),
        });

        if (res.ok) {
          content = await res.text();
          generatedContent = content;
        }
      } finally {
        setIsGenerating(false);
      }
    }

    await supabaseWorldRepo.create({
      projectId,
      type,
      title: title.trim(),
      content,
      fields: [],
      generatedContent,
    });

    setOpen(false);
    setTitle("");
    setBriefDesc("");
  }

  async function handleSaveEdit(id: string) {
    await supabaseWorldRepo.update(id, { content: editContent });
    setEditId(null);
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">세계관</h1>
          <p className="text-sm text-muted-foreground">
            {elements?.length ?? 0}개의 설정
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer">
            <Plus className="h-4 w-4" />
            새 설정
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>세계관 설정 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>유형</Label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(TYPE_CONFIG) as [WorldElementType, typeof TYPE_CONFIG[WorldElementType]][]).map(
                    ([key, config]) => (
                      <Badge
                        key={key}
                        variant={type === key ? "default" : "outline"}
                        className="cursor-pointer gap-1"
                        onClick={() => setType(key)}
                      >
                        <config.icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>이름</Label>
                <Input
                  placeholder="예: 에르시아 대륙, 마법 학원"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>간단한 설명 (AI 생성 시 참고)</Label>
                <Textarea
                  placeholder="예: 마법이 존재하는 중세 유럽풍 세계, 4개의 왕국이 대립 중"
                  value={briefDesc}
                  onChange={(e) => setBriefDesc(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCreate(true)}
                  disabled={!title.trim() || isGenerating}
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
                  disabled={!title.trim() || isGenerating}
                >
                  직접 작성
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 세계관 목록 */}
      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">로딩 중...</div>
      ) : elements && elements.length > 0 ? (
        <div className="space-y-4">
          {elements.map((el) => {
            const config = TYPE_CONFIG[el.type] || TYPE_CONFIG.custom;
            const isEditing = editId === el.id;
            return (
              <Card key={el.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
                        {config.label}
                      </span>
                      <CardTitle className="text-base">{el.title}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          if (isEditing) {
                            handleSaveEdit(el.id);
                          } else {
                            setEditId(el.id);
                            setEditContent(el.content);
                          }
                        }}
                      >
                        {isEditing ? (
                          <Sparkles className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Edit className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditId(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          if (confirm(`'${el.title}'을 삭제하시겠습니까?`)) {
                            supabaseWorldRepo.delete(el.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[200px] text-sm"
                      rows={10}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
                      {el.content || "내용이 없습니다."}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <Globe className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">아직 세계관 설정이 없어요</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            배경, 장소, 마법 체계 등을 AI로 자동 생성해보세요
          </p>
        </div>
      )}
    </div>
  );
}
