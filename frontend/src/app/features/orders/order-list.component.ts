import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { OrderActions } from '../../store/orders/order.actions';
import {
  selectOrders,
  selectOrdersLoading,
  selectOrdersPage,
  selectOrdersTotal,
} from '../../store/orders/order.selectors';
import type { OrderStatus } from '../../shared/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, CurrencyInrPipe, SkeletonLoaderComponent, PaginationComponent],
  template: `
    <div class="page container">
      <h1 class="section-title">My Orders</h1>

      @if (loading()) {
        @for (i of [1, 2, 3]; track i) {
          <app-skeleton-loader type="order" />
          <div style="height:12px"></div>
        }
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <div class="emoji">📦</div>
          <h3>No orders yet</h3>
          <a routerLink="/products" class="btn btn-primary mt-4">Start Shopping</a>
        </div>
      } @else {
        @for (order of orders(); track order._id) {
          <a [routerLink]="['/orders', order._id]" class="order card">
            <div class="info">
              <strong>#{{ order._id.slice(-8) }}</strong>
              <span class="muted">{{ order.createdAt | date: 'mediumDate' }} · {{ order.items.length }} item(s)</span>
            </div>
            <span class="status s-{{ order.orderStatus }}">{{ label(order.orderStatus) }}</span>
            <span class="total">{{ order.totalAmount | inr }}</span>
          </a>
        }
        <app-pagination [currentPage]="page()" [totalPages]="pages()" [totalItems]="total()" (pageChange)="go($event)" />
      }
    </div>
  `,
  styles: [
    `
      .order {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 16px;
        align-items: center;
        padding: 16px;
        margin-bottom: 12px;
        text-decoration: none;
        color: #1a1a2e;
      }
      .order:hover {
        box-shadow: 0 8px 20px rgba(16, 24, 40, 0.1);
        text-decoration: none;
      }
      .info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .status {
        font-size: 12px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        text-transform: capitalize;
      }
      .s-placed,
      .s-confirmed {
        background: #eef2ff;
        color: #4f46e5;
      }
      .s-shipped,
      .s-out_for_delivery {
        background: #fef3c7;
        color: #b45309;
      }
      .s-delivered {
        background: #dcfce7;
        color: #16a34a;
      }
      .s-cancelled,
      .s-refunded {
        background: #fee2e2;
        color: #dc2626;
      }
      .total {
        font-weight: 800;
      }
    `,
  ],
})
export class OrderListComponent {
  private store = inject(Store);

  protected orders = toSignal(this.store.select(selectOrders), { initialValue: [] });
  protected loading = toSignal(this.store.select(selectOrdersLoading), { initialValue: false });
  protected page = toSignal(this.store.select(selectOrdersPage), { initialValue: 1 });
  protected total = toSignal(this.store.select(selectOrdersTotal), { initialValue: 0 });

  constructor() {
    this.store.dispatch(OrderActions.loadOrders({ page: 1 }));
  }

  pages(): number {
    return Math.max(1, Math.ceil(this.total() / 12));
  }

  go(p: number): void {
    this.store.dispatch(OrderActions.loadOrders({ page: p }));
  }

  label(status: OrderStatus): string {
    return status.replace(/_/g, ' ');
  }
}
