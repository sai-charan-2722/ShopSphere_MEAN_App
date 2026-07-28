import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import type { IOrder, OrderStatus } from '../../shared/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule, CurrencyInrPipe, PaginationComponent],
  template: `
    <div class="page container">
      <h1 class="section-title">All Orders</h1>

      <div class="filters">
        <select [(ngModel)]="statusFilter" (ngModelChange)="load(1)">
          <option value="">All statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ s.replace('_', ' ') }}</option>
          }
        </select>
      </div>

      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Buyer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (o of orders(); track o._id) {
              <tr>
                <td>#{{ o._id.slice(-8) }}</td>
                <td>{{ buyerName(o) }}</td>
                <td>{{ o.createdAt | date: 'mediumDate' }}</td>
                <td>{{ o.totalAmount | inr }}</td>
                <td><span class="cap pay-{{ o.paymentStatus }}">{{ o.paymentStatus }}</span></td>
                <td>
                  <select [ngModel]="o.orderStatus" (ngModelChange)="update(o, $event)">
                    @for (s of statuses; track s) {
                      <option [value]="s">{{ s.replace('_', ' ') }}</option>
                    }
                  </select>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-pagination [currentPage]="page()" [totalPages]="pages()" (pageChange)="load($event)" />
    </div>
  `,
  styles: [
    `
      .filters {
        margin-bottom: 18px;
      }
      .filters select {
        padding: 9px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      .table-wrap {
        overflow-x: auto;
        padding: 4px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        text-align: left;
        padding: 12px 14px;
        border-bottom: 1px solid #f1f1f4;
        font-size: 14px;
      }
      th {
        color: #6b7280;
        font-size: 12px;
        text-transform: uppercase;
      }
      select {
        padding: 6px 8px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        text-transform: capitalize;
      }
      .cap {
        text-transform: capitalize;
        font-weight: 700;
      }
      .pay-paid {
        color: #16a34a;
      }
      .pay-pending {
        color: #d97706;
      }
      .pay-failed {
        color: #dc2626;
      }
    `,
  ],
})
export class AdminOrdersComponent {
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  protected orders = signal<IOrder[]>([]);
  protected page = signal(1);
  protected pages = signal(1);
  protected statusFilter = '';
  protected statuses: OrderStatus[] = [
    'placed',
    'confirmed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'refunded',
  ];

  constructor() {
    this.load(1);
  }

  load(page: number): void {
    const filters: Record<string, string> = this.statusFilter ? { status: this.statusFilter } : {};
    this.orderService.adminAll(page, 12, filters).subscribe((res) => {
      this.orders.set(res.orders);
      this.page.set(res.meta.page);
      this.pages.set(res.meta.totalPages);
    });
  }

  buyerName(o: IOrder): string {
    return typeof o.buyer === 'object' ? o.buyer.name : '—';
  }

  update(order: IOrder, status: OrderStatus): void {
    this.orderService.adminUpdateStatus(order._id, status).subscribe(() => {
      this.toast.success(`Order updated to ${status.replace('_', ' ')}`);
      this.load(this.page());
    });
  }
}
