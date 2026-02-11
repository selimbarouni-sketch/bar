export type HistoryItem = {
  id: string;
  expression: string;
  result: number;
  timestamp: Date;
  isGradePart?: boolean;
};

export interface AIAnalysis {
  summary: string;
  insights: string[];
  recommendations: string;
}