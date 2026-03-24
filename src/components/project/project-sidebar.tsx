"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PenTool,
  MessageSquare,
  Users,
  Globe,
  LayoutGrid,
  Settings,
  ChevronLeft,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useProject } from "@/lib/db/hooks/use-projects";
import { useChapters } from "@/lib/db/hooks/use-chapters";
import { supabaseChapterRepo } from "@/lib/db/repositories/supabase/project.repo";

interface ProjectSidebarProps {
  projectId: string;
}

const NAV_ITEMS = [
  { href: "", icon: LayoutGrid, label: "대시보드" },
  { href: "/brainstorm", icon: MessageSquare, label: "브레인스토밍" },
  { href: "/characters", icon: Users, label: "캐릭터" },
  { href: "/worldbuilding", icon: Globe, label: "세계관" },
  { href: "/plot", icon: LayoutGrid, label: "플롯 보드" },
  { href: "/settings", icon: Settings, label: "프로젝트 설정" },
];

export function ProjectSidebar({ projectId }: ProjectSidebarProps) {
  const pathname = usePathname();
  const { project } = useProject(projectId);
  const { chapters } = useChapters(projectId);

  async function handleAddChapter() {
    const order = (chapters?.length ?? 0) + 1;
    const id = await supabaseChapterRepo.create({
      projectId,
      title: `${order}장`,
      content: "",
      rawDraft: "",
      wordCount: 0,
      order,
      status: "draft",
    });
    // 페이지 이동은 Link로 처리
    window.location.href = `/project/${projectId}/write/${id}`;
  }

  return (
    <div className="w-64 border-r flex flex-col h-full bg-card">
      {/* 프로젝트 헤더 */}
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ChevronLeft className="h-4 w-4" />
          프로젝트 목록
        </Link>
        <h2 className="font-bold text-lg truncate">
          {project?.title ?? "로딩 중..."}
        </h2>
        {project?.genre && (
          <p className="text-xs text-muted-foreground">{project.genre}</p>
        )}
      </div>

      <ScrollArea className="flex-1">
        {/* 네비게이션 */}
        <nav className="p-2">
          {NAV_ITEMS.map((item) => {
            const href = `/project/${projectId}${item.href}`;
            const isActive =
              item.href === ""
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link key={item.href} href={href}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-2" />

        {/* 챕터 목록 */}
        <div className="p-2">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              챕터
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleAddChapter}
              title="새 챕터 추가"
            >
              <span className="text-lg leading-none">+</span>
            </Button>
          </div>
          {chapters?.map((chapter) => {
            const href = `/project/${projectId}/write/${chapter.id}`;
            const isActive = pathname === href;
            return (
              <Link key={chapter.id} href={href}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="truncate">{chapter.title}</span>
                </div>
              </Link>
            );
          })}
          {(!chapters || chapters.length === 0) && (
            <p className="text-xs text-muted-foreground px-3 py-2">
              아직 챕터가 없어요
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
