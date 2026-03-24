"use client";

import { useState, useEffect, useCallback } from "react";
import { supabasePlotColumnRepo, supabasePlotCardRepo } from "../repositories/supabase/plot.repo";
import type { PlotColumn, PlotCard } from "@/types/plot";

export function usePlotColumns(projectId: string) {
  const [columns, setColumns] = useState<PlotColumn[]>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setColumns(undefined);
    supabasePlotColumnRepo.getByProject(projectId).then(setColumns).catch(console.error);
  }, [projectId, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { columns, isLoading: columns === undefined, refetch };
}

export function usePlotCards(projectId: string) {
  const [cards, setCards] = useState<PlotCard[]>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setCards(undefined);
    supabasePlotCardRepo.getByProject(projectId).then(setCards).catch(console.error);
  }, [projectId, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { cards, isLoading: cards === undefined, refetch };
}
