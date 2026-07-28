import { Component, Input, inject, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { CurrencyInrPipe } from '../../pipes/currency-inr.pipe';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { CartActions } from '../../../store/cart/cart.actions';
import { AnimationService } from '../../../core/services/animation.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import type { IProduct } from '../../models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyInrPipe, StarRatingComponent],
  template: `
    <article class="pcard card">
      <a [routerLink]="['/products', product._id]" class="img-wrap">
        <img #cardImg [src]="product.images[0] || placeholder" [alt]="product.title" loading="lazy" />
        @if (discountPct > 0) {
          <span class="badge-discount">-{{ discountPct }}%</span>
        }
        @if (product.stock === 0) {
          <span class="badge-stock out">Out of stock</span>
        } @else if (product.stock < 5) {
          <span class="badge-stock low">Only {{ product.stock }} left</span>
        }
        <button class="wish" [class.active]="wished" (click)="toggleWishlist($event)" aria-label="Toggle wishlist">
          ♥
        </button>
      </a>

      <div class="body">
        @if (showSellerBadge && sellerName) {
          <span class="seller">{{ sellerName }}</span>
        }
        <a [routerLink]="['/products', product._id]" class="title">{{ product.title }}</a>

        <div class="rating-row">
          <app-star-rating [rating]="product.ratings" />
          <span class="num muted">({{ product.numReviews }})</span>
        </div>

        <div class="price-row">
          @if (product.discountPrice) {
            <span class="price">{{ product.discountPrice | inr }}</span>
            <span class="strike">{{ product.price | inr }}</span>
          } @else {
            <span class="price">{{ product.price | inr }}</span>
          }
        </div>

        <button class="btn btn-primary add" [disabled]="product.stock === 0" (click)="addToCart()">
          Add to Cart
        </button>
      </div>
    </article>
  `,
  styles: [
    `
      .pcard {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition:
          transform 0.18s ease,
          box-shadow 0.18s ease;
      }
      .pcard:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 28px rgba(16, 24, 40, 0.12);
      }
      .img-wrap {
        position: relative;
        display: block;
        aspect-ratio: 1;
        background: #f3f4f6;
      }
      .img-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .badge-discount {
        position: absolute;
        top: 10px;
        left: 10px;
        background: #ff6584;
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
      }
      .badge-stock {
        position: absolute;
        bottom: 10px;
        left: 10px;
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 6px;
        background: #fff;
      }
      .badge-stock.out {
        color: #dc2626;
      }
      .badge-stock.low {
        color: #d97706;
      }
      .wish {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.9);
        color: #cbd5e1;
        font-size: 17px;
        cursor: pointer;
      }
      .wish.active {
        color: #ff6584;
      }
      .body {
        padding: 12px 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
      }
      .seller {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #6c63ff;
        font-weight: 700;
      }
      .title {
        font-weight: 600;
        color: #1a1a2e;
        font-size: 14px;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 38px;
      }
      .rating-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .num {
        font-size: 12px;
      }
      .price-row {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-top: 2px;
      }
      .price {
        font-size: 18px;
        font-weight: 800;
        color: #1a1a2e;
      }
      .strike {
        font-size: 13px;
        color: #9ca3af;
        text-decoration: line-through;
      }
      .add {
        margin-top: auto;
        justify-content: center;
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: IProduct;
  @Input() showSellerBadge = false;
  @ViewChild('cardImg') cardImg!: ElementRef<HTMLImageElement>;

  private store = inject(Store);
  private anim = inject(AnimationService);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  protected placeholder = 'https://placehold.co/400x400/f3f4f6/94a3b8?text=ShopSphere';
  protected wished = false;

  get discountPct(): number {
    if (!this.product.discountPrice) return 0;
    return Math.round((1 - this.product.discountPrice / this.product.price) * 100);
  }

  get sellerName(): string | null {
    return typeof this.product.seller === 'object' ? this.product.seller.name : null;
  }

  addToCart(): void {
    this.store.dispatch(CartActions.addItem({ productId: this.product._id, quantity: 1 }));
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon && this.cardImg?.nativeElement) {
      this.anim.flyToCart(this.cardImg.nativeElement, cartIcon);
      cartIcon.classList.add('badge-pulse');
      setTimeout(() => cartIcon.classList.remove('badge-pulse'), 400);
    }
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.auth.isSignedIn()) {
      this.toast.info('Sign in to save to your wishlist');
      return;
    }
    if (this.wished) {
      this.userService.removeFromWishlist(this.product._id).subscribe(() => {
        this.wished = false;
        this.toast.info('Removed from wishlist');
      });
    } else {
      this.userService.addToWishlist(this.product._id).subscribe(() => {
        this.wished = true;
        this.toast.success('Saved to wishlist');
      });
    }
  }
}
