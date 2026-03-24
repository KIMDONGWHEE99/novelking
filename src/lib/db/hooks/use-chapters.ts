"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseChapterRepo } from "../repositories/supabase/project.repo";
import type { Chapter } from "@/types/project";

export function useChapters(projectId: string) {
  const [chapters, setChapters] = useState<Chapter[]>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setChapters(undefined);
    supabaseChapterRepo.getByProject(projectId).then(setChapters).catch(console.error);
  }, [projectId, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { chapters, isLoading: chapters === undefined, refetch };
}

export function useChapter(id: string) {
  const [chapter, setChapter] = useState<Chapter>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setChapter(undefined);
    supabaseChapterRepo.getById(id).then(setChapter).catch(console.error);
  }, [id, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { chapter, isLoading: chapter === undefined, refetch };
}
