"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../database";

export function useChapters(projectId: string) {
  const chapters = useLiveQuery(
    () => db.chapters.where("projectId").equals(projectId).sortBy("order"),
    [projectId]
  );
  return { chapters, isLoading: chapters === undefined };
}

export function useChapter(id: string) {
  const chapter = useLiveQuery(() => db.chapters.get(id), [id]);
  return { chapter, isLoading: chapter === undefined };
}
