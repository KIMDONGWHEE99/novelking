"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../database";

export function usePlotColumns(projectId: string) {
  const columns = useLiveQuery(
    () => db.plotColumns.where("projectId").equals(projectId).sortBy("order"),
    [projectId]
  );
  return { columns, isLoading: columns === undefined };
}

export function usePlotCards(projectId: string) {
  const cards = useLiveQuery(
    () => db.plotCards.where("projectId").equals(projectId).sortBy("order"),
    [projectId]
  );
  return { cards, isLoading: cards === undefined };
}
