"use client";

import { use } from "react";
import { ProjectSidebar } from "@/components/project/project-sidebar";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  return (
    <div className="flex h-screen overflow-hidden">
      <ProjectSidebar projectId={projectId} />
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
}
