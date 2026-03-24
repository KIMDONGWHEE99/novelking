"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../database";

export function useWorldElements(projectId: string) {
  const elements = useLiveQuery(
    () => db.worldElements.where("projectId").equals(projectId).toArray(),
    [projectId]
  );
  return { elements, isLoading: elements === undefined };
}

export function useWorldElement(id: string) {
  const element = useLiveQuery(() => db.worldElements.get(id), [id]);
  return { element, isLoading: element === undefined };
}
