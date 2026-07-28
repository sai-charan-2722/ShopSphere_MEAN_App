import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { selectCartItems, selectCartTotal } from '../../store/cart/cart.selectors';
import { CartActions } from '../../store/cart/cart.actions';
import { PaymentService } from '../../core/services/payment.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import type { ShippingAddress } from '../../shared/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CurrencyInrPipe],
  template: `
    <div class="page container">
      <h1 class="section-title">Checkout</h1>
      <div class="layout">
        <form class="card form" (submit)="pay($event)">
          <h3>Shipping Address</h3>
          <div class="grid2">
            <label>Full name<input name="name" [(ngModel)]="address.name" required /></label>
            <label>Phone<input name="phone" [(ngModel)]="address.phone" required /></label>
          </div>
          <label>Street<input name="street" [(ngModel)]="address.street" required /></label>
          <div class="grid2">
            <label>City<input name="city" [(ngModel)]="address.city" required /></label>
            <label>State<input name="state" [(ngModel)]="address.state" required /></label>
          </div>
          <div class="grid2">
            <label>ZIP<input name="zip" [(ngModel)]="address.zip" required /></label>
            <label>Country<input name="country" [(ngModel)]="address.country" required /></label>
          </div>
          <button class="btn btn-primary w-full mt-4" [disabled]="submitting() || items().length === 0">
            {{ submitting() ? 'Redirecting to payment…' : 'Pay with Stripe' }}
          </button>
          <p class="muted test-hint">Test card: 4242 4242 4242 4242 · any future expiry · any CVC</p>
        </form>

        <aside class="card summary">
          <h3>Summary</h3>
          @for (item of items(); track item.product._id) {
            <div class="line">
              <span>{{ item.product.title }} × {{ item.quantity }}</span>
              <span>{{ item.priceAtAdd * item.quantity | inr }}</span>
            </div>
          }
          <div class="line grand">
            <span>Total</span><span>{{ grandTotal() | inr }}</span>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 24px;
        align-items: start;
      }
      .form {
        padding: 22px;
      }
      .form h3 {
        margin: 0 0 16px;
      }
      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 12px;
      }
      input {
        display: block;
        width: 100%;
        margin-top: 5px;
        padding: 10px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
      }
      .grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .w-full {
        width: 100%;
        justify-content: center;
      }
      .test-hint {
        font-size: 12px;
        margin-top: 10px;
        text-align: center;
      }
      .summary {
        padding: 20px;
        position: sticky;
        top: 82px;
      }
      .line {
        display: flex;
        justify-content: space-between;
        margin: 8px 0;
        font-size: 14px;
      }
      .grand {
        font-weight: 800;
        border-top: 1px solid #eee;
        padding-top: 12px;
        margin-top: 12px;
      }
      @media (max-width: 800px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CheckoutComponent {
  private store = inject(Store);
  private payment = inject(PaymentService);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  protected items = toSignal(this.store.select(selectCartItems), { initialValue: [] });
  protected total = toSignal(this.store.select(selectCartTotal), { initialValue: 0 });
  protected submitting = signal(false);

  protected address: ShippingAddress = {
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  };

  constructor() {
    this.store.dispatch(CartActions.loadCart());
    // Prefill from saved profile address.
    this.userService.getProfile().subscribe((u) => {
      this.address.name = u.name;
      if (u.address) Object.assign(this.address, u.address);
    });
  }

  grandTotal(): number {
    const shipping = this.total() >= 50000 ? 0 : 4900;
    return this.total() + shipping + Math.round(this.total() * 0.18);
  }

  pay(event: Event): void {
    event.preventDefault();
    this.submitting.set(true);
    this.payment.createCheckoutSession(this.address).subscribe({
      next: ({ sessionUrl }) => {
        window.location.href = sessionUrl;
      },
      error: () => {
        this.toast.error('Could not start checkout. Please try again.');
        this.submitting.set(false);
      },
    });
  }
}
