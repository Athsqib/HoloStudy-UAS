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
