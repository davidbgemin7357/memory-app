import { TestBed } from '@angular/core/testing';
import { Animal, DIFFICULTIES } from '../models/card.model';
import { AnimalImageService } from './animal-image.service';
import { GameService, MATCH_DELAY_MS, MISMATCH_DELAY_MS } from './game.service';

const ANIMALS: Animal[] = Array.from({ length: 10 }, (_, i) => ({
  name: `animal ${i}`,
  imageUrl: `https://example.com/${i}.svg`,
}));

class FakeAnimalImageService {
  getRandomAnimals = (count: number) => Promise.resolve(ANIMALS.slice(0, count));
  preload = () => Promise.resolve([]);
}

describe('GameService', () => {
  let game: GameService;

  beforeEach(async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [{ provide: AnimalImageService, useClass: FakeAnimalImageService }],
    });
    game = TestBed.inject(GameService);
    await game.newGame(DIFFICULTIES[0]);
  });

  afterEach(() => vi.useRealTimers());

  const pairOf = (id: number) => {
    const card = game.cards().find((c) => c.id === id)!;
    return game.cards().find((c) => c.pairId === card.pairId && c.id !== id)!;
  };

  it('crea dos cartas por animal', () => {
    expect(game.status()).toBe('playing');
    expect(game.cards().length).toBe(DIFFICULTIES[0].pairs * 2);
  });

  it('marca como emparejadas dos cartas iguales', () => {
    const first = game.cards()[0];
    game.selectCard(first.id);
    game.selectCard(pairOf(first.id).id);
    vi.advanceTimersByTime(MATCH_DELAY_MS);

    expect(game.moves()).toBe(1);
    expect(game.matchesFound()).toBe(1);
    expect(game.cards().filter((c) => c.matched).length).toBe(2);
  });

  it('voltea de nuevo dos cartas distintas y bloquea mientras tanto', () => {
    const [first] = game.cards();
    const other = game.cards().find((c) => c.pairId !== first.pairId)!;
    game.selectCard(first.id);
    game.selectCard(other.id);

    expect(game.isLocked()).toBe(true);
    const third = game.cards().find((c) => !c.flipped)!;
    game.selectCard(third.id);
    expect(game.cards().find((c) => c.id === third.id)!.flipped).toBe(false);

    vi.advanceTimersByTime(MISMATCH_DELAY_MS);
    expect(game.cards().every((c) => !c.flipped && !c.matched)).toBe(true);
    expect(game.isLocked()).toBe(false);
  });

  it('gana al encontrar todas las parejas', () => {
    const done = new Set<number>();
    for (const card of game.cards()) {
      if (done.has(card.id)) continue;
      const pair = pairOf(card.id);
      game.selectCard(card.id);
      game.selectCard(pair.id);
      vi.advanceTimersByTime(MATCH_DELAY_MS);
      done.add(card.id).add(pair.id);
    }
    expect(game.status()).toBe('won');
    expect(game.moves()).toBe(DIFFICULTIES[0].pairs);
  });
});
