import {
  Component,
  inject,
  signal,
  AfterViewInit,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import gsap from 'gsap';

import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { PaymentService } from '../../core/services/payment.service';
import { CartActions } from '../../store/cart/cart.actions';
import type { IOrder } from '../../shared/models';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyInrPipe],
  template: `
    <div class="page container success">
      <div #check class="check">✓</div>
      <h1>Thank you for your order!</h1>
      @if (order()) {
        <p class="muted">Order <strong>#{{ order()!._id.slice(-8) }}</strong> — {{ order()!.totalAmount | inr }}</p>
        <p class="muted">A confirmation email is on its way. You can track your order any time.</p>
        <div class="actions mt-4">
          <a [routerLink]="['/orders', order()!._id]" class="btn btn-primary">Track Order</a>
          <a routerLink="/products" class="btn btn-outline">Continue Shopping</a>
        </div>
      } @else if (error()) {
        <p class="muted">We couldn't verify your payment yet. If you completed payment, your order will appear shortly.</p>
        <a routerLink="/orders" class="btn btn-primary mt-4">View My Orders</a>
      } @else {
        <p class="muted">Verifying your payment…</p>
      }
    </div>
  `,
  styles: [
    `
      .success {
        text-align: center;
        padding-top: 60px;
        max-width: 560px;
        margin: 0 auto;
      }
      .check {
        width: 92px;
        height: 92px;
        border-radius: 50%;
        background: #16a34a;
        color: #fff;
        font-size: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
      }
      h1 {
        font-size: 30px;
        margin: 0 0 10px;
      }
      .actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
    `,
  ],
})
export class CheckoutSuccessComponent implements AfterViewInit {
  @ViewChild('check') check!: ElementRef<HTMLElement>;

  private route = inject(ActivatedRoute);
  private payment = inject(PaymentService);
  private store = inject(Store);

  protected order = signal<IOrder | null>(null);
  protected error = signal(false);

  constructor() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (sessionId) {
      this.payment.verify(sessionId).subscribe({
        next: (order) => {
          this.order.set(order);
          this.store.dispatch(CartActions.loadCart());
        },
        error: () => this.error.set(true),
      });
    } else {
      this.error.set(true);
    }
  }

  ngAfterViewInit(): void {
    gsap.from(this.check.nativeElement, { scale: 0, rotate: -180, duration: 0.7, ease: 'back.out(1.7)' });
  }
}
