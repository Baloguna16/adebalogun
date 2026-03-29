export interface Paper {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTimeMinutes: number;
  hasAudio: boolean;
  audioFile: string;
}

export interface ResearchManifest {
  generatedAt: string;
  papers: Paper[];
  categories: string[];
}
