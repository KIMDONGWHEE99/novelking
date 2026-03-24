"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseCharacterRepo } from "../repositories/supabase/character.repo";
import type { Character } from "@/types/character";

export function useCharacters(projectId: string) {
  const [characters, setCharacters] = useState<Character[]>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setCharacters(undefined);
    supabaseCharacterRepo.getByProject(projectId).then(setCharacters).catch(console.error);
  }, [projectId, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { characters, isLoading: characters === undefined, refetch };
}

export function useCharacter(id: string) {
  const [character, setCharacter] = useState<Character>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setCharacter(undefined);
    supabaseCharacterRepo.getById(id).then(setCharacter).catch(console.error);
  }, [id, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { character, isLoading: character === undefined, refetch };
}
