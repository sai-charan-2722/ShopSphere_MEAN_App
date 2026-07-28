import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  private push(type: ToastType, message: string, duration = 3500): void {
    const id = ++this.counter;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void {
    this.push('success', message);
  }
  error(message: string): void {
    this.push('error', message, 5000);
  }
  info(message: string): void {
    this.push('info', message);
  }
  warning(message: string): void {
    this.push('warning', message);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
