export interface Animal {
  name: string;
  imageUrl: string;
}

export interface Card {
  id: number;
  pairId: string;
  name: string;
  imageUrl: string;
  flipped: boolean;
  matched: boolean;
}

export type GameStatus = 'loading' | 'playing' | 'won' | 'error';

export interface Difficulty {
  label: string;
  pairs: number;
  columns: number;
}

export const DIFFICULTIES: readonly Difficulty[] = [
  { label: 'Fácil', pairs: 6, columns: 3 },
  { label: 'Normal', pairs: 8, columns: 4 },
  { label: 'Difícil', pairs: 10, columns: 4 },
];
