"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseProjectRepo } from "../repositories/supabase/project.repo";
import type { Project } from "@/types/project";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setProjects(undefined);
    supabaseProjectRepo.getAll().then(setProjects).catch(console.error);
  }, [version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { projects, isLoading: projects === undefined, refetch };
}

export function useProject(id: string) {
  const [project, setProject] = useState<Project>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setProject(undefined);
    supabaseProjectRepo.getById(id).then(setProject).catch(console.error);
  }, [id, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { project, isLoading: project === undefined, refetch };
}
