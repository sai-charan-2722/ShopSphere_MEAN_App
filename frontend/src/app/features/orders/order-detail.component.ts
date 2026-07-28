import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { OrderActions } from '../../store/orders/order.actions';
import { selectSelectedOrder, selectOrdersLoading } from '../../store/orders/order.selectors';
import type { OrderStatus } from '../../shared/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, CurrencyInrPipe, SkeletonLoaderComponent],
  template: `
    <div class="page container">
      @if (loading() || !order()) {
        <app-skeleton-loader type="order" />
      } @else {
        <div class="head">
          <div>
            <h1>Order #{{ order()!._id.slice(-8) }}</h1>
            <span class="muted">Placed {{ order()!.createdAt | date: 'medium' }}</span>
          </div>
          @if (order()!.orderStatus === 'placed') {
            <button class="btn btn-outline" (click)="cancel()">Cancel Order</button>
          }
        </div>

        <!-- Timeline -->
        <div class="timeline card">
          @for (step of steps; track step) {
            <div class="step" [class.done]="isDone(step)" [class.active]="order()!.orderStatus === step">
              <div class="dot"></div>
              <span>{{ labelOf(step) }}</span>
            </div>
          }
        </div>

        <div class="grid2">
          <div class="card items">
            <h3>Items</h3>
            @for (item of order()!.items; track item.product) {
              <div class="item">
                <img [src]="item.image" [alt]="item.title" />
                <div class="meta">
                  <span class="t">{{ item.title }}</span>
                  <span class="muted">Qty {{ item.quantity }}</span>
                </div>
                <span class="p">{{ item.price * item.quantity | inr }}</span>
              </div>
            }
          </div>

          <div>
            <div class="card ship">
              <h3>Shipping Address</h3>
              <p>
                {{ order()!.shippingAddress.name }}<br />
                {{ order()!.shippingAddress.street }}<br />
                {{ order()!.shippingAddress.city }}, {{ order()!.shippingAddress.state }}
                {{ order()!.shippingAddress.zip }}<br />
                {{ order()!.shippingAddress.country }}<br />
                📞 {{ order()!.shippingAddress.phone }}
              </p>
              @if (order()!.trackingNumber) {
                <p><strong>Tracking:</strong> {{ order()!.trackingNumber }}</p>
              }
            </div>

            <div class="card totals mt-4">
              <div class="line"><span>Subtotal</span><span>{{ order()!.subtotal | inr }}</span></div>
              <div class="line"><span>Shipping</span><span>{{ order()!.shippingFee | inr }}</span></div>
              <div class="line"><span>Tax</span><span>{{ order()!.tax | inr }}</span></div>
              <div class="line grand"><span>Total</span><span>{{ order()!.totalAmount | inr }}</span></div>
              <div class="line"><span>Payment</span><span class="pay pay-{{ order()!.paymentStatus }}">{{ order()!.paymentStatus }}</span></div>
            </div>
          </div>
        </div>

        <a routerLink="/orders" class="back mt-4">← Back to orders</a>
      }
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .head h1 {
        margin: 0;
        font-size: 26px;
      }
      .timeline {
        display: flex;
        justify-content: space-between;
        padding: 22px;
        margin-bottom: 24px;
        overflow-x: auto;
      }
      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #9ca3af;
        flex: 1;
        text-align: center;
        position: relative;
      }
      .dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #e5e7eb;
        z-index: 1;
      }
      .step.done {
        color: #16a34a;
      }
      .step.done .dot {
        background: #16a34a;
      }
      .step.active {
        color: #6c63ff;
        font-weight: 700;
      }
      .step.active .dot {
        background: #6c63ff;
      }
      .grid2 {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 20px;
        align-items: start;
      }
      .card {
        padding: 18px;
      }
      .item {
        display: grid;
        grid-template-columns: 56px 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f1f1f4;
      }
      .item img {
        width: 56px;
        height: 56px;
        border-radius: 8px;
        object-fit: cover;
      }
      .t {
        font-weight: 600;
        display: block;
      }
      .line {
        display: flex;
        justify-content: space-between;
        margin: 7px 0;
      }
      .grand {
        font-weight: 800;
        border-top: 1px solid #eee;
        padding-top: 10px;
      }
      .pay {
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
      .back {
        display: inline-block;
      }
      @media (max-width: 800px) {
        .grid2 {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class OrderDetailComponent {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  protected order = toSignal(this.store.select(selectSelectedOrder), { initialValue: null });
  protected loading = toSignal(this.store.select(selectOrdersLoading), { initialValue: false });

  protected steps: OrderStatus[] = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.store.dispatch(OrderActions.loadOrder({ id }));
  }

  isDone(step: OrderStatus): boolean {
    const current = this.order()?.orderStatus;
    if (!current) return false;
    if (current === 'cancelled' || current === 'refunded') return false;
    return this.steps.indexOf(step) <= this.steps.indexOf(current);
  }

  labelOf(step: OrderStatus): string {
    return step.replace(/_/g, ' ');
  }

  cancel(): void {
    const o = this.order();
    if (o) this.store.dispatch(OrderActions.cancelOrder({ id: o._id }));
  }
}
