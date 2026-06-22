import { Component, HostListener } from '@angular/core';
import { ConfirmService } from '../../../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div
      *ngIf="confirm.active$ | async as dialog"
      class="fixed inset-0 z-[1900] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      (click)="onBackdrop($event)"
      role="presentation"
    >
      <div
        class="card w-full max-w-md p-6 animate-[popIn_0.18s_ease-out]"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        (click)="$event.stopPropagation()"
      >
        <h2 id="confirm-title" class="text-xl font-bold text-ink">{{ dialog.title }}</h2>
        <p *ngIf="dialog.message" class="mt-2 text-ink-muted">{{ dialog.message }}</p>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="btn btn-ghost" (click)="confirm.resolve(false)">
            {{ dialog.cancelText || 'Cancel' }}
          </button>
          <button
            type="button"
            class="btn"
            [class.btn-danger]="dialog.danger"
            [class.btn-primary]="!dialog.danger"
            (click)="confirm.resolve(true)"
          >
            {{ dialog.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes popIn {
        from {
          opacity: 0;
          transform: scale(0.96) translateY(8px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  constructor(public confirm: ConfirmService) {}

  onBackdrop(_event: MouseEvent): void {
    this.confirm.resolve(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.confirm.active$.value) {
      this.confirm.resolve(false);
    }
  }
}
