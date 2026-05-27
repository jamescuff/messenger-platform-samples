export type ThemeId =
  | "brand-marchnata"
  | "cynhyrchu"
  | "arweinyddiaeth"
  | "cynulleidfa-digidol"
  | "gwerthoedd"
  | "sgyrsiau";

export interface Theme {
  id: ThemeId;
  welsh: string;
  english: string;
  emoji: string;
}

export interface Phrase {
  id: string;
  welsh: string;
  english: string;
  theme: ThemeId;
  example?: {
    welsh: string;
    english: string;
  };
  notes?: string;
}

export type ReviewGrade = "again" | "hard" | "good" | "easy";

export interface CardState {
  phraseId: string;
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueAt: number;
  lapses: number;
  lastReviewedAt?: number;
}

export interface Stats {
  totalReviews: number;
  correctReviews: number;
  streakDays: number;
  lastReviewDate?: string;
  reviewsByDay: Record<string, number>;
}

export type Mode = "home" | "flashcards" | "sentences" | "quiz" | "stats" | "add";
