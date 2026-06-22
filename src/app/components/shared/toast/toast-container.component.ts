import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Toast, ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div
      class="fixed top-5 right-5 z-[2000] flex w-[min(92vw,22rem)] flex-col gap-3"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <div
        *ngFor="let t of toasts"
        class="card flex items-start gap-3 border-l-4 p-4 shadow-pop animate-[toastIn_0.22s_ease-out]"
        [style.border-left-color]="accent(t)"
        role="status"
      >
        <span class="text-xl leading-none" aria-hidden="true">{{ icon(t) }}</span>
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-ink">{{ t.title }}</p>
          <p *ngIf="t.message" class="mt-0.5 break-words text-sm text-ink-muted">{{ t.message }}</p>
        </div>
        <button
          type="button"
          class="-mr-1 -mt-1 shrink-0 rounded-full px-2 py-0.5 text-lg leading-none text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink"
          aria-label="Dismiss notification"
          (click)="dismiss(t.id)"
        >
          ×
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes toastIn {
        from {
          opacity: 0;
          transform: translateX(1.5rem);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
  ],
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly subs = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subs.add(
      this.toastService.toasts$.subscribe((toast) => {
        this.toasts = [toast, ...this.toasts];
        if (toast.duration > 0) {
          this.timers.set(
            toast.id,
            setTimeout(() => this.dismiss(toast.id), toast.duration)
          );
        }
      })
    );
    this.subs.add(this.toastService.dismissals$.subscribe((id) => this.dismiss(id)));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.timers.forEach((t) => clearTimeout(t));
  }

  dismiss(id: number): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  icon(t: Toast): string {
    return { success: '✅', error: '⛔', warning: '⚠️', info: 'ℹ️' }[t.type];
  }

  accent(t: Toast): string {
    return {
      success: 'var(--c-success)',
      error: 'var(--c-danger)',
      warning: 'var(--c-warning)',
      info: 'var(--c-info)',
    }[t.type];
  }
}
