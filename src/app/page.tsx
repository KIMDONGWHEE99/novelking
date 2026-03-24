"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProjects } from "@/lib/db/hooks/use-projects";
import { ProjectCard } from "@/components/project/project-card";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LandingPage } from "@/components/landing/landing-page";
import { Button } from "@/components/ui/button";
import { Settings, PenTool, Wand2, CreditCard, User, LogOut } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  // 로딩 중
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PenTool className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  // 미로그인 → 마케팅 랜딩 페이지
  if (!isLoggedIn) {
    return <LandingPage />;
  }

  // 로그인 → 기존 대시보드
  return <Dashboard />;
}

function Dashboard() {
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
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <CreditCard className="h-3.5 w-3.5" />
                요금제
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost" size="icon" title="내 계정">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon" title="설정">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              title="로그아웃"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
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
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Wand2 className="h-16 w-16 mx-auto text-primary/40 mb-6" />
              <h3 className="text-xl font-semibold mb-2">
                첫 소설을 만들어볼까요?
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                아이디어 한 줄만 입력하면 AI가 시놉시스, 캐릭터, 세계관, 플롯을
                자동으로 만들어줍니다.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/wizard">
                  <Button size="lg" className="gap-2">
                    <Wand2 className="h-4 w-4" />
                    소설 마법사로 시작하기
                  </Button>
                </Link>
                <CreateProjectDialog />
              </div>
              <p className="text-xs text-muted-foreground mt-6">
                소설 마법사가 아이디어를 소설 프로젝트로 바꿔줍니다
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
