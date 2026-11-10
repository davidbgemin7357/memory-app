import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TimePipe } from '../../time.pipe';

@Component({
  selector: 'app-win-dialog',
  imports: [TimePipe],
  template: `
    <div class="backdrop">
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="win-title">
        <div class="emoji" aria-hidden="true">🎉</div>
        <h2 id="win-title">¡Ganaste!</h2>
        <p>
          Encontraste todas las parejas en <strong>{{ moves() }}</strong> movimientos y
          <strong>{{ seconds() | time }}</strong>.
        </p>
        <button type="button" class="btn" (click)="playAgain.emit()">Jugar de nuevo</button>
      </div>
    </div>
  `,
  styleUrl: './win-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinDialogComponent {
  readonly moves = input.required<number>();
  readonly seconds = input.required<number>();
  readonly playAgain = output<void>();
}
