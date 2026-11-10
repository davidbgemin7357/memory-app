import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Card } from '../../models/card.model';

@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  readonly card = input.required<Card>();
  readonly selectCard = output<number>();
}
