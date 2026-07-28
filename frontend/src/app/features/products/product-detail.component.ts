import {
  Component,
  inject,
  signal,
  effect,
  AfterViewInit,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

import { ProductActions } from '../../store/products/product.actions';
import { selectSelectedProduct, selectProductsLoading } from '../../store/products/product.selectors';
import { CartActions } from '../../store/cart/cart.actions';
import { ReviewService } from '../../core/services/review.service';
import { AnimationService } from '../../core/services/animation.service';
import { AuthService } from '../../core/services/auth.service';
import { fadeInUp } from '../../shared/animations';
import type { IReview } from '../../shared/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInUp],
  imports: [CurrencyInrPipe, StarRatingComponent, SkeletonLoaderComponent, BreadcrumbComponent],
  template: `
    <div class="page container" #page>
      <app-breadcrumb />

      @if (loading() || !product()) {
        <app-skeleton-loader type="product-detail" />
      } @else {
        <div class="detail" @fadeInUp>
          <div class="gallery">
            <img #mainImg class="main" [src]="activeImage()" [alt]="product()!.title" />
            @if (product()!.images.length > 1) {
              <div class="thumbs">
                @for (img of product()!.images; track img) {
                  <img [src]="img" [alt]="product()!.title" [class.active]="img === activeImage()" (click)="activeImage.set(img)" />
                }
              </div>
            }
          </div>

          <div class="info">
            <h1>{{ product()!.title }}</h1>
            <div class="rating-row">
              <app-star-rating [rating]="product()!.ratings" />
              <span class="muted">{{ product()!.ratings }} ({{ product()!.numReviews }} reviews)</span>
            </div>

            <div class="price">
              @if (product()!.discountPrice) {
                <span class="now">{{ product()!.discountPrice! | inr }}</span>
                <span class="was">{{ product()!.price | inr }}</span>
              } @else {
                <span class="now">{{ product()!.price | inr }}</span>
              }
            </div>

            @if (product()!.stock > 0) {
              <p class="stock in">In stock ({{ product()!.stock }} available)</p>
            } @else {
              <p class="stock out">Out of stock</p>
            }

            <div class="qty">
              <label>Qty</label>
              <button (click)="qty = Math.max(1, qty - 1)">−</button>
              <span>{{ qty }}</span>
              <button (click)="qty = Math.min(product()!.stock, qty + 1)">+</button>
            </div>

            <button #buyImg class="btn btn-primary big" [disabled]="product()!.stock === 0" (click)="addToCart()">
              Add to Cart
            </button>

            <div class="desc">
              <h3>Description</h3>
              <p>{{ product()!.description }}</p>
            </div>
          </div>
        </div>

        <!-- Reviews -->
        <section class="reviews mt-6" @fadeInUp>
          <h2 class="section-title">Customer Reviews</h2>
          @if (reviews().length === 0) {
            <p class="muted">No reviews yet. Purchase this product to leave the first review!</p>
          } @else {
            <div class="review-list">
              @for (r of reviews(); track r._id) {
                <div class="review card">
                  <div class="review-head">
                    <strong>{{ reviewerName(r) }}</strong>
                    <app-star-rating [rating]="r.rating" />
                    @if (r.isVerifiedPurchase) {
                      <span class="verified">✓ Verified purchase</span>
                    }
                  </div>
                  <h4>{{ r.title }}</h4>
                  <p>{{ r.comment }}</p>
                </div>
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [
    `
      .detail {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 36px;
      }
      .main {
        width: 100%;
        border-radius: 14px;
        aspect-ratio: 1;
        object-fit: cover;
        background: #f3f4f6;
      }
      .thumbs {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }
      .thumbs img {
        width: 64px;
        height: 64px;
        object-fit: cover;
        border-radius: 8px;
        cursor: pointer;
        border: 2px solid transparent;
      }
      .thumbs img.active {
        border-color: #6c63ff;
      }
      .info h1 {
        font-size: 28px;
        margin: 0 0 10px;
      }
      .rating-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
      }
      .price {
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 12px;
      }
      .now {
        font-size: 30px;
        font-weight: 800;
        color: #1a1a2e;
      }
      .was {
        font-size: 16px;
        color: #9ca3af;
        text-decoration: line-through;
      }
      .stock.in {
        color: #16a34a;
        font-weight: 600;
      }
      .stock.out {
        color: #dc2626;
        font-weight: 600;
      }
      .qty {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 16px 0;
      }
      .qty button {
        width: 34px;
        height: 34px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: #fff;
        font-size: 18px;
        cursor: pointer;
      }
      .big {
        font-size: 16px;
        padding: 14px 28px;
      }
      .desc {
        margin-top: 26px;
      }
      .desc p {
        color: #4b5563;
        line-height: 1.7;
      }
      .review-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .review {
        padding: 16px;
      }
      .review-head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 6px;
      }
      .verified {
        color: #16a34a;
        font-size: 12px;
        font-weight: 600;
      }
      .review h4 {
        margin: 4px 0;
      }
      .review p {
        color: #4b5563;
        margin: 0;
      }
      @media (max-width: 760px) {
        .detail {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ProductDetailComponent implements AfterViewInit {
  @ViewChild('page') page!: ElementRef<HTMLElement>;
  @ViewChild('buyImg') buyImg?: ElementRef<HTMLElement>;

  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private reviewService = inject(ReviewService);
  private anim = inject(AnimationService);
  protected auth = inject(AuthService);

  protected product = toSignal(this.store.select(selectSelectedProduct), { initialValue: null });
  protected loading = toSignal(this.store.select(selectProductsLoading), { initialValue: false });
  protected reviews = signal<IReview[]>([]);
  protected activeImage = signal<string>('https://placehold.co/600x600/f3f4f6/94a3b8?text=ShopSphere');
  protected qty = 1;
  protected readonly Math = Math;

  private lastId = '';

  constructor() {
    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id');
      if (id && id !== this.lastId) {
        this.lastId = id;
        this.store.dispatch(ProductActions.loadProduct({ id }));
        this.reviewService.forProduct(id).subscribe((res) => this.reviews.set(res.reviews));
      }
    });

    // Keep the active gallery image in sync with the loaded product.
    effect(() => {
      const p = this.product();
      if (p && p.images.length) this.activeImage.set(p.images[0]);
    });
  }

  ngAfterViewInit(): void {
    this.anim.pageEnter(this.page.nativeElement);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.store.dispatch(CartActions.addItem({ productId: p._id, quantity: this.qty }));
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon && this.buyImg) this.anim.flyToCart(this.buyImg.nativeElement, cartIcon);
  }

  reviewerName(r: IReview): string {
    return typeof r.user === 'object' ? r.user.name : 'Customer';
  }
}
