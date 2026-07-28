import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { toastAnimation } from '../../animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [toastAnimation],
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" @toast (click)="toastService.dismiss(toast.id)">
          <span class="icon">{{ icon(toast.type) }}</span>
          <span class="msg">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 360px;
      }
      .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 13px 16px;
        border-radius: 12px;
        color: #fff;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      }
      .toast-success {
        background: #16a34a;
      }
      .toast-error {
        background: #dc2626;
      }
      .toast-info {
        background: #2563eb;
      }
      .toast-warning {
        background: #d97706;
      }
      .icon {
        font-size: 16px;
      }
    `,
  ],
})
export class ToastComponent {
  protected toastService = inject(ToastService);

  icon(type: string): string {
    return { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }[type] ?? 'ℹ';
  }
}
