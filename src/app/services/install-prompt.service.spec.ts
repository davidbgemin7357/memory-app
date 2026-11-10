import { TestBed } from '@angular/core/testing';
import { InstallPromptService } from './install-prompt.service';

describe('InstallPromptService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  function fireBeforeInstallPrompt(outcome: 'accepted' | 'dismissed') {
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt: vi.fn(() => Promise.resolve()),
      userChoice: Promise.resolve({ outcome }),
    });
    window.dispatchEvent(event);
    return event;
  }

  it('no muestra aviso hasta que el navegador indica que es instalable', () => {
    const service = TestBed.inject(InstallPromptService);
    expect(service.mode()).toBe('none');
  });

  it('muestra el botón y llama a prompt() al instalar', async () => {
    const service = TestBed.inject(InstallPromptService);
    const event = fireBeforeInstallPrompt('accepted');
    expect(event.defaultPrevented).toBe(true);
    expect(service.mode()).toBe('prompt');

    await service.install();
    expect(event.prompt).toHaveBeenCalled();
    expect(service.mode()).toBe('none');
  });

  it('recuerda cuando el usuario cierra el aviso', () => {
    const service = TestBed.inject(InstallPromptService);
    fireBeforeInstallPrompt('accepted');
    service.dismiss();
    expect(service.mode()).toBe('none');
    expect(localStorage.getItem('install-banner-dismissed')).toBe('1');
  });
});
