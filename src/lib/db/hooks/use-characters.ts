"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../database";

export function useCharacters(projectId: string) {
  const characters = useLiveQuery(
    () => db.characters.where("projectId").equals(projectId).toArray(),
    [projectId]
  );
  return { characters, isLoading: characters === undefined };
}

export function useCharacter(id: string) {
  const character = useLiveQuery(() => db.characters.get(id), [id]);
  return { character, isLoading: character === undefined };
}
