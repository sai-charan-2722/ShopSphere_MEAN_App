import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SellerService } from '../../core/services/seller.service';
import { ToastService } from '../../core/services/toast.service';
import type { IOrder, OrderStatus } from '../../shared/models';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule, CurrencyInrPipe, PaginationComponent],
  template: `
    <div class="page container">
      <h1 class="section-title">Orders</h1>

      @if (orders().length === 0) {
        <div class="empty-state">
          <div class="emoji">🧾</div>
          <h3>No orders yet</h3>
          <p>Orders containing your products will appear here.</p>
        </div>
      } @else {
        <div class="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Items (yours)</th>
                <th>Buyer total</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              @for (o of orders(); track o._id) {
                <tr>
                  <td>#{{ o._id.slice(-8) }}</td>
                  <td>{{ o.createdAt | date: 'mediumDate' }}</td>
                  <td>{{ o.items.length }}</td>
                  <td>{{ o.totalAmount | inr }}</td>
                  <td><span class="pill s-{{ o.orderStatus }}">{{ o.orderStatus.replace('_', ' ') }}</span></td>
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
      }
    </div>
  `,
  styles: [
    `
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
      .pill {
        font-size: 12px;
        padding: 3px 10px;
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
    `,
  ],
})
export class SellerOrdersComponent {
  private sellerService = inject(SellerService);
  private toast = inject(ToastService);

  protected orders = signal<IOrder[]>([]);
  protected page = signal(1);
  protected pages = signal(1);
  protected statuses: OrderStatus[] = [
    'placed',
    'confirmed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  constructor() {
    this.load(1);
  }

  load(page: number): void {
    this.sellerService.orders(page).subscribe((res) => {
      this.orders.set(res.orders);
      this.page.set(res.meta.page);
      this.pages.set(res.meta.totalPages);
    });
  }

  update(order: IOrder, status: OrderStatus): void {
    this.sellerService.updateOrderStatus(order._id, status).subscribe(() => {
      this.toast.success(`Order marked as ${status.replace('_', ' ')}`);
      this.load(this.page());
    });
  }
}
