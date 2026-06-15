export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  lastStudied?: string;
  createdAt: string;
  projectId?: string;
  userId?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  color?: string;
  userId?: string;
}

export type FlexibleCard = {
  front?: string;
  term?: string;
  back?: string;
  definition?: string;
};

export interface UserProfile {
  userId: string;
  streakCount: number;
  lastStudyDate?: string;
  dailyTarget?: number;
  goalSetId?: string;
  cardsStudiedToday?: number;
  cardsStudiedDate?: string;
}
