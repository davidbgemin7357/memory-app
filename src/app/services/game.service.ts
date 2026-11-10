import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Card, DIFFICULTIES, Difficulty, GameStatus } from '../models/card.model';
import { AnimalImageService } from './animal-image.service';
import { shuffle } from './shuffle';

export const MATCH_DELAY_MS = 500;
export const MISMATCH_DELAY_MS = 900;

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly animals = inject(AnimalImageService);

  readonly cards = signal<Card[]>([]);
  readonly status = signal<GameStatus>('loading');
  readonly moves = signal(0);
  readonly elapsedSeconds = signal(0);
  readonly difficulty = signal<Difficulty>(DIFFICULTIES[1]);
  readonly isLocked = signal(false);

  readonly totalPairs = computed(() => this.cards().length / 2);
  readonly matchesFound = computed(() => this.cards().filter((c) => c.matched).length / 2);

  private selected: Card[] = [];
  private timerId: ReturnType<typeof setInterval> | null = null;
  private pendingTimeout: ReturnType<typeof setTimeout> | null = null;
  private gameToken = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimers());
  }

  async newGame(difficulty: Difficulty = this.difficulty()): Promise<void> {
    const token = ++this.gameToken;
    this.clearTimers();
    this.difficulty.set(difficulty);
    this.status.set('loading');
    this.cards.set([]);
    this.moves.set(0);
    this.elapsedSeconds.set(0);
    this.isLocked.set(false);
    this.selected = [];

    try {
      const animals = await this.animals.getRandomAnimals(difficulty.pairs);
      await this.animals.preload(animals);
      if (token !== this.gameToken) return; // se inició otra partida mientras cargaba

      const deck = animals.flatMap((animal) => [animal, animal]);
      this.cards.set(
        shuffle(deck).map((animal, id) => ({
          id,
          pairId: animal.imageUrl,
          name: animal.name,
          imageUrl: animal.imageUrl,
          flipped: false,
          matched: false,
        })),
      );
      this.status.set('playing');
    } catch {
      if (token === this.gameToken) this.status.set('error');
    }
  }

  selectCard(cardId: number): void {
    if (this.status() !== 'playing' || this.isLocked()) return;
    const card = this.cards().find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    if (this.timerId === null) this.startTimer();
    this.updateCards([cardId], { flipped: true });
    this.selected.push(card);
    if (this.selected.length < 2) return;

    const [first, second] = this.selected;
    this.selected = [];
    this.moves.update((m) => m + 1);
    this.isLocked.set(true);
    const ids = [first.id, second.id];

    if (first.pairId === second.pairId) {
      // Coinciden: desaparecen de la vista.
      this.pendingTimeout = setTimeout(() => {
        this.updateCards(ids, { matched: true });
        this.isLocked.set(false);
        if (this.matchesFound() === this.totalPairs()) this.finish();
      }, MATCH_DELAY_MS);
    } else {
      // No coinciden: se voltean de nuevo.
      this.pendingTimeout = setTimeout(() => {
        this.updateCards(ids, { flipped: false });
        this.isLocked.set(false);
      }, MISMATCH_DELAY_MS);
    }
  }

  private finish(): void {
    this.stopTimer();
    this.status.set('won');
  }

  private updateCards(ids: number[], changes: Partial<Card>): void {
    this.cards.update((cards) => cards.map((c) => (ids.includes(c.id) ? { ...c, ...changes } : c)));
  }

  private startTimer(): void {
    this.timerId = setInterval(() => this.elapsedSeconds.update((s) => s + 1), 1000);
  }

  private stopTimer(): void {
    if (this.timerId !== null) clearInterval(this.timerId);
    this.timerId = null;
  }

  private clearTimers(): void {
    this.stopTimer();
    if (this.pendingTimeout !== null) clearTimeout(this.pendingTimeout);
    this.pendingTimeout = null;
  }
}
