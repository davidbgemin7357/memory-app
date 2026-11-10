import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Card } from '../../models/card.model';
import { CardComponent } from '../card/card';

@Component({
  selector: 'app-board',
  imports: [CardComponent],
  template: `
    <div class="board" [style.--columns]="columns()">
      @for (card of cards(); track card.id) {
        <app-card [card]="card" (selectCard)="selectCard.emit($event)" />
      }
    </div>
  `,
  styleUrl: './board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent {
  readonly cards = input.required<Card[]>();
  readonly columns = input(4);
  readonly selectCard = output<number>();
}
