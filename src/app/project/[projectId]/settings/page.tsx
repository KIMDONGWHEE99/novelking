"use client";

import { use, useState, useRef, useCallback } from "react";
import { useProject } from "@/lib/db/hooks/use-projects";
import { supabaseProjectRepo } from "@/lib/db/repositories/supabase/project.repo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ImagePlus,
  Trash2,
  Save,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GENRE_OPTIONS = [
  "로맨스", "판타지", "SF", "미스터리/추리", "스릴러/호러",
  "무협", "현대소설", "역사소설", "라이트노벨", "기타",
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { project, isLoading } = useProject(projectId);
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const save = useCallback(
    async (data: Record<string, unknown>) => {
      await supabaseProjectRepo.update(projectId, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    [projectId]
  );

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    save({ coverImage: base64 });
  }

  async function handleDeleteProject() {
    if (!project) return;
    const confirmed = confirm(
      `"${project.title}" 프로젝트와 모든 챕터, 캐릭터, 세계관, 플롯 데이터가 영구적으로 삭제됩니다.\n\n정말 삭제하시겠습니까?`
    );
    if (!confirmed) return;

    const doubleCheck = confirm("이 작업은 되돌릴 수 없습니다. 정말로 삭제하시겠습니까?");
    if (!doubleCheck) return;

    await supabaseProjectRepo.delete(projectId);
    router.push("/");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        프로젝트를 찾을 수 없습니다
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl space-y-6 flex-1 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">프로젝트 설정</h1>
          <p className="text-sm text-muted-foreground">
            소설 프로젝트의 기본 정보를 관리합니다
          </p>
        </div>
        {saved && (
          <Badge variant="secondary" className="gap-1 text-green-500">
            <Save className="h-3 w-3" />
            저장됨
          </Badge>
        )}
      </div>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
          <CardDescription>소설의 제목, 장르, 설명을 수정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>소설 제목</Label>
            <Input
              value={project.title}
              onChange={(e) => save({ title: e.target.value })}
              placeholder="소설 제목"
            />
          </div>

          <div className="space-y-2">
            <Label>장르</Label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((g) => (
                <Badge
                  key={g}
                  variant={project.genre === g ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => save({ genre: g })}
                >
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>소설 설명</Label>
            <Textarea
              value={project.description}
              onChange={(e) => save({ description: e.target.value })}
              placeholder="소설의 간단한 줄거리나 컨셉을 적어주세요"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* 커버 이미지 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">커버 이미지</CardTitle>
          <CardDescription>소설의 대표 이미지를 설정합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
          {project.coverImage ? (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={project.coverImage}
                  alt="커버"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <ImagePlus className="h-3.5 w-3.5 mr-1.5" />
                  변경
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => save({ coverImage: undefined })}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  삭제
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => coverInputRef.current?.click()}
              className="w-full h-32 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ImagePlus className="h-8 w-8 text-muted-foreground/30" />
              <span className="text-sm text-muted-foreground/50">
                클릭하여 커버 이미지 업로드
              </span>
            </button>
          )}
        </CardContent>
      </Card>

      {/* AI 설정 안내 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI 설정</CardTitle>
          <CardDescription>
            AI 모델, 문체 스타일, 글자수 등은 전역 설정에서 관리됩니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/settings">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              전역 AI 설정으로 이동
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 위험 구역 */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            위험 구역
          </CardTitle>
          <CardDescription>
            되돌릴 수 없는 작업입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">프로젝트 삭제</p>
              <p className="text-xs text-muted-foreground">
                모든 챕터, 캐릭터, 세계관, 플롯 데이터가 영구 삭제됩니다
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteProject}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              프로젝트 삭제
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
