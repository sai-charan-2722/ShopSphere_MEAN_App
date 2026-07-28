import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { CartActions } from '../../store/cart/cart.actions';
import { selectCartItems, selectCartTotal, selectCartLoading } from '../../store/cart/cart.selectors';

@Component({
  selector: 'app-cart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyInrPipe],
  template: `
    <div class="page container">
      <h1 class="section-title">Your Cart</h1>

      @if (items().length === 0) {
        <div class="empty-state">
          <div class="emoji">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Browse products and add your favourites.</p>
          <a routerLink="/products" class="btn btn-primary mt-4">Start Shopping</a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="items">
            @for (item of items(); track item.product._id) {
              <div class="row card">
                <img [src]="item.product.images[0]" [alt]="item.product.title" />
                <div class="meta">
                  <a [routerLink]="['/products', item.product._id]" class="title">{{ item.product.title }}</a>
                  <span class="muted">{{ item.priceAtAdd | inr }} each</span>
                </div>
                <div class="qty">
                  <button (click)="dec(item.product._id, item.quantity)" aria-label="Decrease">−</button>
                  <span>{{ item.quantity }}</span>
                  <button (click)="inc(item.product._id, item.quantity, item.product.stock)" aria-label="Increase">+</button>
                </div>
                <span class="line-total">{{ item.priceAtAdd * item.quantity | inr }}</span>
                <button class="remove" (click)="remove(item.product._id)" aria-label="Remove">🗑</button>
              </div>
            }
            <button class="btn btn-outline mt-2" (click)="clear()">Clear Cart</button>
          </div>

          <aside class="summary card">
            <h3>Order Summary</h3>
            <div class="line">
              <span>Subtotal</span><span>{{ total() | inr }}</span>
            </div>
            <div class="line muted">
              <span>Shipping</span><span>{{ total() >= 50000 ? 'FREE' : (4900 | inr) }}</span>
            </div>
            <div class="line muted">
              <span>Tax (GST 18%)</span><span>{{ tax() | inr }}</span>
            </div>
            <div class="line grand">
              <span>Total</span><span>{{ grandTotal() | inr }}</span>
            </div>
            <a routerLink="/checkout" class="btn btn-primary w-full mt-4">Proceed to Checkout</a>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .cart-layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 24px;
        align-items: start;
      }
      .row {
        display: grid;
        grid-template-columns: 80px 1fr auto auto auto;
        gap: 16px;
        align-items: center;
        padding: 12px;
        margin-bottom: 12px;
      }
      .row img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
      }
      .title {
        font-weight: 600;
        color: #1a1a2e;
        display: block;
      }
      .qty {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .qty button {
        width: 30px;
        height: 30px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
      }
      .line-total {
        font-weight: 700;
      }
      .remove {
        border: none;
        background: none;
        cursor: pointer;
        font-size: 16px;
      }
      .summary {
        padding: 20px;
        position: sticky;
        top: 82px;
      }
      .summary h3 {
        margin: 0 0 14px;
      }
      .line {
        display: flex;
        justify-content: space-between;
        margin: 8px 0;
      }
      .grand {
        font-size: 18px;
        font-weight: 800;
        border-top: 1px solid #eee;
        padding-top: 12px;
        margin-top: 12px;
      }
      .w-full {
        width: 100%;
        justify-content: center;
      }
      @media (max-width: 800px) {
        .cart-layout {
          grid-template-columns: 1fr;
        }
        .row {
          grid-template-columns: 64px 1fr auto;
        }
        .line-total,
        .remove {
          grid-column: 2;
        }
      }
    `,
  ],
})
export class CartComponent {
  private store = inject(Store);

  protected items = toSignal(this.store.select(selectCartItems), { initialValue: [] });
  protected total = toSignal(this.store.select(selectCartTotal), { initialValue: 0 });
  protected loading = toSignal(this.store.select(selectCartLoading), { initialValue: false });

  constructor() {
    this.store.dispatch(CartActions.loadCart());
  }

  tax(): number {
    return Math.round(this.total() * 0.18);
  }
  grandTotal(): number {
    const shipping = this.total() >= 50000 ? 0 : 4900;
    return this.total() + shipping + this.tax();
  }

  inc(productId: string, qty: number, stock: number): void {
    if (qty < stock) this.store.dispatch(CartActions.updateQuantity({ productId, quantity: qty + 1 }));
  }
  dec(productId: string, qty: number): void {
    if (qty > 1) this.store.dispatch(CartActions.updateQuantity({ productId, quantity: qty - 1 }));
  }
  remove(productId: string): void {
    this.store.dispatch(CartActions.removeItem({ productId }));
  }
  clear(): void {
    this.store.dispatch(CartActions.clearCart());
  }
}
