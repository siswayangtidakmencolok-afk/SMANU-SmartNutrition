// NutriPath shared types

export interface NutriPathContext {
  situation: string;
  availableFoods: string;
  budget: string;
  question: string;
}

export interface StructuredSection {
  heading: string;
  content: string;
}

export interface NutriPathResponse {
  sections: StructuredSection[];
  sources: SourceCitation[];
  retrievedChunks: RetrievedChunkMeta[];
  rawText: string;
}

export interface SourceCitation {
  id: string;
  title: string;
  category: string;
  source: string;
  score: number;
}

export interface RetrievedChunkMeta {
  id: string;
  category: string;
  title: string;
  matchedTerms: string[];
  score: number;
}

export type QueryStatus = "idle" | "loading" | "streaming" | "done" | "error";
