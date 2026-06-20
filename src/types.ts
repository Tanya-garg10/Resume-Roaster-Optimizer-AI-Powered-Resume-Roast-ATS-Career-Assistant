export type Mode = "roast" | "optimize";

export type IndustryType =
  | "Software Engineering"
  | "Data Science"
  | "Finance"
  | "Marketing"
  | "Product Management"
  | "General";

export interface AnalysisResponse {
  atsScore: number;
  reaction: string;
  reactionCategory: "CRITICAL" | "MILD_ANNOYANCE" | "IMPRESSED" | "READY_TO_OFFER";
  buzzwords: string[];
  missingMetrics: string[];
  contentMarkdown: string;
  suggestedFormatBefore?: string;
  suggestedFormatAfter?: string;
  suggestedFormatWhy?: string;
}
