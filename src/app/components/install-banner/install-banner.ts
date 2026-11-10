import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InstallPromptService } from '../../services/install-prompt.service';

@Component({
  selector: 'app-install-banner',
  template: `
    @switch (installer.mode()) {
      @case ('prompt') {
        <aside class="banner" role="dialog" aria-label="Instalar aplicación">
          <img src="icons/icon-96x96.png" alt="" class="icon" />
          <p><strong>Instala Memoria Animal</strong><br />Juega desde la pantalla de inicio.</p>
          <button type="button" class="btn small" (click)="installer.install()">Instalar</button>
          <button type="button" class="close" aria-label="Cerrar" (click)="installer.dismiss()">×</button>
        </aside>
      }
      @case ('ios') {
        <aside class="banner" role="dialog" aria-label="Agregar a inicio">
          <img src="icons/icon-96x96.png" alt="" class="icon" />
          <p>
            <strong>Instala Memoria Animal</strong><br />
            Toca
            <svg class="share" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12M7 8l5-5 5 5M5 12v8h14v-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <em>Compartir</em> y luego
            <em>Agregar a inicio</em>.
          </p>
          <button type="button" class="close" aria-label="Cerrar" (click)="installer.dismiss()">×</button>
        </aside>
      }
    }
  `,
  styleUrl: './install-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallBannerComponent {
  protected readonly installer = inject(InstallPromptService);
}
