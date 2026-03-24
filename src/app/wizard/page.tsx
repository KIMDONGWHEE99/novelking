"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { projectRepo, chapterRepo } from "@/lib/db/repositories/project.repo";
import { characterRepo } from "@/lib/db/repositories/character.repo";
import { worldRepo } from "@/lib/db/repositories/world.repo";
import { plotColumnRepo, plotCardRepo } from "@/lib/db/repositories/plot.repo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wand2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Users,
  Globe,
  BookOpen,
  Check,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const GENRE_OPTIONS = [
  "로맨스", "판타지", "SF", "미스터리/추리", "스릴러/호러",
  "무협", "현대소설", "역사소설", "라이트노벨", "기타",
];

const STEPS = [
  { id: "idea", label: "아이디어", icon: Wand2, desc: "소설의 씨앗을 심으세요" },
  { id: "synopsis", label: "시놉시스", icon: BookOpen, desc: "AI가 줄거리를 만듭니다" },
  { id: "characters", label: "캐릭터", icon: Users, desc: "등장인물을 설계합니다" },
  { id: "world", label: "세계관", icon: Globe, desc: "배경을 구축합니다" },
  { id: "plot", label: "챕터 구성", icon: BookOpen, desc: "챕터별 플롯을 짭니다" },
  { id: "complete", label: "완성", icon: Check, desc: "프로젝트가 생성됩니다" },
];

interface WizardResults {
  title?: string;
  logline?: string;
  synopsis?: string;
  themes?: string[];
  targetAudience?: string;
  estimatedChapters?: number;
  characters?: Array<{
    name: string;
    role: string;
    description: string;
    traits: Array<{ key: string; value: string }>;
  }>;
  worldElements?: Array<{
    type: string;
    title: string;
    content: string;
  }>;
  chapters?: Array<{
    number: number;
    title: string;
    act: string;
    summary: string;
    characters: string[];
  }>;
}

export default function WizardPage() {
  const router = useRouter();
  const { activeProvider, activeModel, getApiKey } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [idea, setIdea] = useState("");
  const [genre, setGenre] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<WizardResults>({});
  const [isCreating, setIsCreating] = useState(false);

  async function callWizardApi(step: string) {
    const apiKey = getApiKey(activeProvider);
    if (!apiKey) {
      alert("설정에서 API 키를 먼저 입력해주세요.");
      return null;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step,
          idea,
          genre,
          previousResults: results,
          provider: activeProvider,
          model: activeModel,
          apiKey,
        }),
      });

      if (!res.ok) {
        alert("AI 생성에 실패했습니다. API 키와 모델 설정을 확인해주세요.");
        return null;
      }

      const { content } = await res.json();
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch?.[0] ?? content);
      } catch {
        alert("AI 응답을 파싱하지 못했습니다. 다시 시도해주세요.");
        return null;
      }
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleNext() {
    const stepId = STEPS[currentStep].id;

    if (stepId === "idea") {
      if (!idea.trim()) return;
      // 시놉시스 생성
      const data = await callWizardApi("synopsis");
      if (data) {
        setResults((prev) => ({ ...prev, ...data }));
        setCurrentStep(1);
      }
    } else if (stepId === "synopsis") {
      // 캐릭터 생성
      const data = await callWizardApi("characters");
      if (data) {
        setResults((prev) => ({ ...prev, ...data }));
        setCurrentStep(2);
      }
    } else if (stepId === "characters") {
      // 세계관 생성
      const data = await callWizardApi("world");
      if (data) {
        setResults((prev) => ({ ...prev, ...data }));
        setCurrentStep(3);
      }
    } else if (stepId === "world") {
      // 챕터 플롯 생성
      const data = await callWizardApi("plot");
      if (data) {
        setResults((prev) => ({ ...prev, ...data }));
        setCurrentStep(4);
      }
    } else if (stepId === "plot") {
      setCurrentStep(5);
    }
  }

  async function handleCreateProject() {
    setIsCreating(true);
    try {
      // 1. 프로젝트 생성
      const projectId = await projectRepo.create({
        title: results.title || "새 소설",
        description: results.synopsis || idea,
        genre: genre || "기타",
        settings: {
          defaultLlmProvider: activeProvider,
          defaultLlmModel: activeModel,
          writingStyle: "대중소설",
        },
      });

      // 2. 캐릭터 생성
      if (results.characters) {
        for (const char of results.characters) {
          await characterRepo.create({
            projectId,
            name: char.name,
            role: char.role,
            tags: [char.role],
            description: char.description,
            traits: char.traits || [],
            backstory: "",
            relationships: [],
          });
        }
      }

      // 3. 세계관 생성
      if (results.worldElements) {
        for (const we of results.worldElements) {
          await worldRepo.create({
            projectId,
            type: we.type as "setting" | "location" | "magic-system" | "culture" | "history" | "custom",
            title: we.title,
            content: we.content,
            fields: [],
          });
        }
      }

      // 4. 플롯 열 + 카드 + 챕터 생성
      if (results.chapters) {
        // 플롯 열 초기화
        await plotColumnRepo.initializeDefault(projectId);
        const columns = await plotColumnRepo.getByProject(projectId);

        const actToColumn: Record<string, string> = {};
        for (const col of columns) {
          actToColumn[col.title] = col.id;
        }

        for (const ch of results.chapters) {
          // 챕터 생성
          await chapterRepo.create({
            projectId,
            title: `${ch.number}장: ${ch.title}`,
            content: "",
            rawDraft: "",
            wordCount: 0,
            order: ch.number - 1,
            status: "draft",
          });

          // 플롯 카드 생성
          const columnId = actToColumn[ch.act] || columns[0]?.id;
          if (columnId) {
            await plotCardRepo.create({
              projectId,
              columnId,
              title: `${ch.number}장: ${ch.title}`,
              description: ch.summary,
              characterLinks: [],
              order: ch.number - 1,
            });
          }
        }
      }

      router.push(`/project/${projectId}`);
    } catch (error) {
      alert("프로젝트 생성 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            홈으로
          </Link>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            소설 마법사
          </h1>
          <div className="w-16" />
        </div>
      </div>

      {/* 단계 표시 */}
      <div className="border-b px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-1">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                      ? "bg-green-500/20 text-green-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/30 mx-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Step 0: 아이디어 입력 */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">어떤 소설을 쓰고 싶으세요?</h2>
              <p className="text-muted-foreground">
                아이디어 한 줄이면 충분합니다. AI가 나머지를 함께 만들어드립니다.
              </p>
            </div>

            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="예: 기억을 잃은 소녀가 마법 도서관에서 세계의 비밀을 풀어가는 이야기"
              rows={3}
              className="text-lg"
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">장르 (선택)</p>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((g) => (
                  <Badge
                    key={g}
                    variant={genre === g ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setGenre(genre === g ? "" : g)}
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleNext}
              disabled={!idea.trim() || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? "AI가 시놉시스를 만들고 있어요..." : "마법 시작"}
            </Button>
          </div>
        )}

        {/* Step 1: 시놉시스 확인 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">시놉시스가 완성되었어요</h2>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">제목</p>
                  <Input
                    value={results.title || ""}
                    onChange={(e) => setResults((p) => ({ ...p, title: e.target.value }))}
                    className="text-lg font-bold"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">한 줄 요약</p>
                  <p className="text-sm">{results.logline}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">시놉시스</p>
                  <Textarea
                    value={results.synopsis || ""}
                    onChange={(e) => setResults((p) => ({ ...p, synopsis: e.target.value }))}
                    rows={6}
                  />
                </div>
                {results.themes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">테마</p>
                    <div className="flex gap-1.5">
                      {results.themes.map((t) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(0)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>
              <Button className="flex-1 gap-2" onClick={handleNext} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                {isGenerating ? "캐릭터를 설계하고 있어요..." : "다음: 캐릭터 생성"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: 캐릭터 확인 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">등장인물이 탄생했어요</h2>

            <div className="space-y-3">
              {results.characters?.map((char, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                        {char.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{char.name}</p>
                        <Badge variant="outline" className="text-[10px]">{char.role}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{char.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>
              <Button className="flex-1 gap-2" onClick={handleNext} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                {isGenerating ? "세계관을 구축하고 있어요..." : "다음: 세계관 생성"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: 세계관 확인 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">세계관이 구축되었어요</h2>

            <div className="space-y-3">
              {results.worldElements?.map((we, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-[10px]">{we.type}</Badge>
                      <p className="font-medium">{we.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{we.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>
              <Button className="flex-1 gap-2" onClick={handleNext} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                {isGenerating ? "챕터를 구성하고 있어요..." : "다음: 챕터 구성"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: 챕터 플롯 확인 */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">챕터별 플롯이 완성되었어요</h2>

            <div className="space-y-2">
              {results.chapters?.map((ch, i) => (
                <Card key={i}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold shrink-0">
                        {ch.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{ch.title}</p>
                          <Badge variant="outline" className="text-[10px] shrink-0">{ch.act}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{ch.summary}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>
              <Button className="flex-1 gap-2" onClick={handleNext}>
                <Check className="h-4 w-4" />
                확인 완료
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: 완성 */}
        {currentStep === 5 && (
          <div className="space-y-6 text-center">
            <div className="py-8">
              <div className="h-20 w-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Sparkles className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">소설 뼈대가 완성되었어요!</h2>
              <p className="text-muted-foreground">
                &ldquo;{results.title}&rdquo; 프로젝트를 생성하면<br />
                시놉시스, {results.characters?.length || 0}명의 캐릭터,{" "}
                {results.worldElements?.length || 0}개의 세계관 설정,{" "}
                {results.chapters?.length || 0}개의 챕터가 자동으로 만들어집니다.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleCreateProject}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {isCreating ? "프로젝트를 생성하고 있어요..." : "프로젝트 생성하고 집필 시작하기"}
            </Button>

            <Button variant="outline" onClick={() => setCurrentStep(4)} className="w-full">
              <ChevronLeft className="h-4 w-4 mr-1" />
              돌아가서 수정하기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
