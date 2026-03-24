"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../database";

export function useProjects() {
  const projects = useLiveQuery(() =>
    db.projects.orderBy("updatedAt").reverse().toArray()
  );
  return { projects, isLoading: projects === undefined };
}

export function useProject(id: string) {
  const project = useLiveQuery(() => db.projects.get(id), [id]);
  return { project, isLoading: project === undefined };
}
