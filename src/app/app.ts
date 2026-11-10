import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { BoardComponent } from './components/board/board';
import { WinDialogComponent } from './components/win-dialog/win-dialog';
import { DIFFICULTIES, Difficulty } from './models/card.model';
import { GameService } from './services/game.service';
import { TimePipe } from './time.pipe';

@Component({
  selector: 'app-root',
  imports: [BoardComponent, WinDialogComponent, TimePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  protected readonly game = inject(GameService);
  protected readonly difficulties = DIFFICULTIES;

  ngOnInit(): void {
    void this.game.newGame();
  }

  protected newGame(difficulty?: Difficulty): void {
    void this.game.newGame(difficulty);
  }
}
