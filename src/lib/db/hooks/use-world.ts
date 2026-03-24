"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseWorldRepo } from "../repositories/supabase/world.repo";
import type { WorldElement } from "@/types/world";

export function useWorldElements(projectId: string) {
  const [elements, setElements] = useState<WorldElement[]>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setElements(undefined);
    supabaseWorldRepo.getByProject(projectId).then(setElements).catch(console.error);
  }, [projectId, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { elements, isLoading: elements === undefined, refetch };
}

export function useWorldElement(id: string) {
  const [element, setElement] = useState<WorldElement>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setElement(undefined);
    supabaseWorldRepo.getById(id).then(setElement).catch(console.error);
  }, [id, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { element, isLoading: element === undefined, refetch };
}
