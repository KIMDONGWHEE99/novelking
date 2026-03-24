export interface PlotColumn {
  id: string;
  projectId: string;
  title: string;
  order: number;
  color: string;
}

export interface PlotCard {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description: string;
  chapterLink?: string;
  characterLinks: string[];
  order: number;
  color?: string;
}
