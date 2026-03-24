"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabaseProjectRepo } from "@/lib/db/repositories/supabase/project.repo";

const GENRES = [
  "로맨스",
  "판타지",
  "SF",
  "미스터리/추리",
  "스릴러/호러",
  "무협",
  "현대소설",
  "역사소설",
  "라이트노벨",
  "기타",
];

export function CreateProjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const id = await supabaseProjectRepo.create({
        title: title.trim(),
        description: description.trim(),
        genre: genre || "기타",
        settings: {
          defaultLlmProvider: "openai",
          defaultLlmModel: "gpt-4o-mini",
          writingStyle: "대중소설",
        },
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      setGenre("");
      router.push(`/project/${id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
      >
        <Plus className="h-5 w-5" />
        새 소설 프로젝트
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 소설 프로젝트 만들기</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">소설 제목</Label>
            <Input
              id="title"
              placeholder="예: 별이 빛나는 밤에"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genre">장르</Label>
            <Select value={genre} onValueChange={(v) => v && setGenre(v)}>
              <SelectTrigger>
                <SelectValue placeholder="장르를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">간단한 설명 (선택)</Label>
            <Textarea
              id="description"
              placeholder="소설의 간단한 줄거리나 컨셉을 적어주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || loading}
            className="w-full"
          >
            {loading ? "생성 중..." : "프로젝트 만들기"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
