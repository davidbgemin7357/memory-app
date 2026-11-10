import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Animal } from '../models/card.model';
import { shuffle } from './shuffle';

/** API pública de Iconify: ilustraciones vectoriales (sin API key, con CORS). */
const ICONIFY_API = 'https://api.iconify.design';
const ICON_SET = 'noto';
const CATEGORY = 'Animals & Nature';

/** Iconos de la categoría que no son animales (plantas, objetos, etc.). */
const NOT_ANIMALS = new Set([
  'blossom', 'bouquet', 'cactus', 'cherry-blossom', 'coral', 'deciduous-tree', 'empty-nest',
  'evergreen-tree', 'fallen-leaf', 'feather', 'four-leaf-clover', 'herb', 'hibiscus', 'hyacinth',
  'leaf-fluttering-in-wind', 'leafless-tree', 'lotus', 'maple-leaf', 'microbe', 'mushroom',
  'nest-with-eggs', 'palm-tree', 'paw-prints', 'pig-nose', 'potted-plant', 'rose', 'rosette',
  'seedling', 'shamrock', 'sheaf-of-rice', 'spider-web', 'spiral-shell', 'sunflower', 'tulip',
  'white-flower', 'wilted-flower', 'wing',
]);

/** Lista de respaldo si la consulta a la API falla. */
const FALLBACK_ANIMALS = [
  'dog-face', 'cat-face', 'fox', 'panda', 'lion', 'frog', 'tiger-face', 'koala', 'monkey-face',
  'rabbit-face', 'pig-face', 'cow-face', 'penguin', 'owl', 'turtle', 'octopus', 'unicorn',
  'elephant', 'giraffe', 'zebra', 'dolphin', 'butterfly', 'hedgehog', 'sloth',
];

interface IconifyCollection {
  categories?: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
export class AnimalImageService {
  private readonly http = inject(HttpClient);
  private animalNames: string[] | null = null;

  /** Devuelve `count` animales distintos elegidos al azar. */
  async getRandomAnimals(count: number): Promise<Animal[]> {
    const names = await this.loadAnimalNames();
    return shuffle(names)
      .slice(0, count)
      .map((name) => ({ name: this.toLabel(name), imageUrl: `${ICONIFY_API}/${ICON_SET}/${name}.svg` }));
  }

  /** Precarga las imágenes; rechaza si alguna no se puede cargar. */
  preload(animals: Animal[]): Promise<void[]> {
    return Promise.all(
      animals.map(
        (a) =>
          new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`No se pudo cargar ${a.name}`));
            img.src = a.imageUrl;
          }),
      ),
    );
  }

  private async loadAnimalNames(): Promise<string[]> {
    if (this.animalNames) {
      return this.animalNames;
    }
    try {
      const collection = await firstValueFrom(
        this.http.get<IconifyCollection>(`${ICONIFY_API}/collection`, { params: { prefix: ICON_SET } }),
      );
      const names = (collection.categories?.[CATEGORY] ?? []).filter((n) => !NOT_ANIMALS.has(n));
      this.animalNames = names.length >= 12 ? names : FALLBACK_ANIMALS;
    } catch {
      this.animalNames = FALLBACK_ANIMALS;
    }
    return this.animalNames;
  }

  private toLabel(name: string): string {
    return name.replace(/-face$/, '').replaceAll('-', ' ');
  }
}
