import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  /** Auto-dismiss delay in ms. 0 keeps it until dismissed manually. */
  duration: number;
}

/**
 * Lightweight, non-blocking notification service used in place of the native
 * `alert()` dialogs. Gives the app a consistent way to surface system status
 * (success / error / progress) without freezing the UI.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly _toasts = new Subject<Toast>();
  private readonly _dismissals = new Subject<number>();

  readonly toasts$: Observable<Toast> = this._toasts.asObservable();
  readonly dismissals$: Observable<number> = this._dismissals.asObservable();

  success(title: string, message?: string, duration = 4000): number {
    return this.show('success', title, message, duration);
  }

  error(title: string, message?: string, duration = 7000): number {
    return this.show('error', title, message, duration);
  }

  info(title: string, message?: string, duration = 4000): number {
    return this.show('info', title, message, duration);
  }

  warning(title: string, message?: string, duration = 5000): number {
    return this.show('warning', title, message, duration);
  }

  /** Persistent toast (no auto-dismiss); dismiss it later with its id. */
  loading(title: string, message?: string): number {
    return this.show('info', title, message, 0);
  }

  dismiss(id: number): void {
    this._dismissals.next(id);
  }

  private show(type: ToastType, title: string, message: string | undefined, duration: number): number {
    const id = this.nextId++;
    this._toasts.next({ id, type, title, message, duration });
    return id;
  }
}
