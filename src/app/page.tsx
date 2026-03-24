"use client";

import { useProjects } from "@/lib/db/hooks/use-projects";
import { ProjectCard } from "@/components/project/project-card";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Settings, PenTool, Wand2 } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { projects, isLoading } = useProjects();

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="h-6 w-6" />
            <h1 className="text-xl font-bold">NovelKing</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="icon" title="설정">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">내 소설 프로젝트</h2>
            <p className="text-muted-foreground mt-1">
              AI와 함께 당신의 이야기를 만들어보세요
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/wizard">
              <Button variant="outline" className="gap-2">
                <Wand2 className="h-4 w-4" />
                소설 마법사
              </Button>
            </Link>
            <CreateProjectDialog />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">
            로딩 중...
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <PenTool className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              아직 프로젝트가 없어요
            </h3>
            <p className="text-muted-foreground mb-6">
              첫 번째 소설 프로젝트를 만들어보세요!
            </p>
            <CreateProjectDialog />
          </div>
        )}
      </main>
    </div>
  );
}
