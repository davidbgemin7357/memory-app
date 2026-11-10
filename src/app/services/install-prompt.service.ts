import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

/** Evento no estándar que Chrome/Edge (Android y escritorio) disparan cuando la app es instalable. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallMode = 'none' | 'prompt' | 'ios';

const DISMISSED_KEY = 'install-banner-dismissed';

@Injectable({ providedIn: 'root' })
export class InstallPromptService {
  private readonly window = inject(DOCUMENT).defaultView;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  private readonly canPrompt = signal(false);
  private readonly dismissed = signal(this.readDismissed());
  private readonly installed = signal(this.isStandalone());
  private readonly ios = this.isIosSafari();

  /** Qué tipo de aviso mostrar: botón de instalación (Android), instrucciones (iOS) o nada. */
  readonly mode = computed<InstallMode>(() => {
    if (this.installed() || this.dismissed()) return 'none';
    if (this.canPrompt()) return 'prompt';
    return this.ios ? 'ios' : 'none';
  });

  constructor() {
    this.window?.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault(); // evita la mini barra por defecto; mostramos nuestro banner
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.canPrompt.set(true);
    });
    this.window?.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canPrompt.set(false);
      this.installed.set(true);
    });
  }

  async install(): Promise<void> {
    const prompt = this.deferredPrompt;
    if (!prompt) return;
    this.deferredPrompt = null;
    this.canPrompt.set(false);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'dismissed') this.dismiss();
  }

  dismiss(): void {
    this.dismissed.set(true);
    try {
      this.window?.localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // almacenamiento no disponible: solo se oculta en esta sesión
    }
  }

  private readDismissed(): boolean {
    try {
      return this.window?.localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  }

  private isStandalone(): boolean {
    const w = this.window;
    if (!w) return false;
    return (
      w.matchMedia?.('(display-mode: standalone)').matches === true ||
      (w.navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  }

  private isIosSafari(): boolean {
    const ua = this.window?.navigator.userAgent ?? '';
    const isIos = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && (this.window?.navigator.maxTouchPoints ?? 0) > 1);
    const isOtherBrowser = /crios|fxios|edgios/i.test(ua);
    return isIos && !isOtherBrowser;
  }
}
