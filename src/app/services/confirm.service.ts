import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** Styles the confirm button as destructive. */
  danger?: boolean;
}

interface ActiveConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

/**
 * Promise-based confirmation dialog, replacing the browser's blocking
 * `confirm()` (and guarding destructive actions that previously had none).
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly active$ = new BehaviorSubject<ActiveConfirm | null>(null);

  ask(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.active$.next({ ...options, resolve });
    });
  }

  resolve(result: boolean): void {
    const current = this.active$.value;
    if (current) {
      current.resolve(result);
      this.active$.next(null);
    }
  }
}
