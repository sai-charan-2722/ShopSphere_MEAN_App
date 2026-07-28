import {
  Component,
  inject,
  signal,
  AfterViewInit,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { ProductActions } from '../../store/products/product.actions';
import { selectFeatured } from '../../store/products/product.selectors';
import { CategoryService } from '../../core/services/category.service';
import { AnimationService } from '../../core/services/animation.service';
import type { ICategory } from '../../shared/models';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCardComponent, SkeletonLoaderComponent],
  template: `
    <div #page>
      <!-- Hero -->
      <section class="hero">
        <div class="container hero-inner">
          <div class="hero-copy">
            <span class="pill">🛍️ Multi-Vendor Marketplace</span>
            <h1>Everything you love, from sellers you trust.</h1>
            <p>Discover thousands of products across every category — shipped fast, priced right.</p>
            <div class="cta">
              <a routerLink="/products" class="btn btn-primary">Shop Now</a>
              <a routerLink="/seller/dashboard" class="btn btn-outline">Become a Seller</a>
            </div>
          </div>
          <div class="hero-art">🛒</div>
        </div>
      </section>

      <div class="container">
        <!-- Categories -->
        <section class="mt-6">
          <h2 class="section-title">Shop by Category</h2>
          <div class="cat-grid">
            @for (cat of categories(); track cat._id) {
              <a [routerLink]="['/categories', cat.slug]" class="cat card">
                <div class="cat-emoji">{{ emoji(cat.name) }}</div>
                <span>{{ cat.name }}</span>
              </a>
            }
          </div>
        </section>

        <!-- Featured -->
        <section class="mt-6">
          <h2 class="section-title">Featured Products</h2>
          @if (featured().length === 0) {
            <div class="grid grid-products">
              @for (i of [1, 2, 3, 4]; track i) {
                <app-skeleton-loader type="product-card" />
              }
            </div>
          } @else {
            <div #cards class="grid grid-products">
              @for (product of featured(); track product._id) {
                <app-product-card [product]="product" [showSellerBadge]="true" />
              }
            </div>
          }
        </section>

        <!-- Promo -->
        <section class="promo mt-6">
          <div class="promo-card grad1">
            <h3>Free shipping over ₹500</h3>
            <p>On thousands of eligible items.</p>
          </div>
          <div class="promo-card grad2">
            <h3>Verified sellers</h3>
            <p>Shop with confidence from trusted vendors.</p>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .hero {
        background: linear-gradient(135deg, #6c63ff 0%, #574fd6 100%);
        color: #fff;
        padding: 56px 0;
      }
      .hero-inner {
        display: flex;
        align-items: center;
        gap: 24px;
      }
      .hero-copy {
        flex: 1;
      }
      .pill {
        display: inline-block;
        background: rgba(255, 255, 255, 0.18);
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
      }
      .hero h1 {
        font-size: 42px;
        margin: 16px 0 12px;
        line-height: 1.1;
        max-width: 560px;
      }
      .hero p {
        font-size: 17px;
        opacity: 0.92;
        max-width: 460px;
      }
      .cta {
        display: flex;
        gap: 12px;
        margin-top: 22px;
      }
      .cta .btn-outline {
        color: #fff;
        border-color: rgba(255, 255, 255, 0.6);
      }
      .hero-art {
        font-size: 160px;
        line-height: 1;
      }
      .cat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 14px;
      }
      .cat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 20px;
        text-decoration: none;
        color: #1a1a2e;
        font-weight: 600;
        transition: transform 0.15s ease;
      }
      .cat:hover {
        transform: translateY(-3px);
        text-decoration: none;
      }
      .cat-emoji {
        font-size: 34px;
      }
      .promo {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }
      .promo-card {
        border-radius: 16px;
        padding: 30px;
        color: #fff;
      }
      .grad1 {
        background: linear-gradient(120deg, #ff6584, #e84e6f);
      }
      .grad2 {
        background: linear-gradient(120deg, #6c63ff, #574fd6);
      }
      .promo-card h3 {
        margin: 0 0 6px;
        font-size: 22px;
      }
      @media (max-width: 720px) {
        .hero-art {
          display: none;
        }
        .hero h1 {
          font-size: 30px;
        }
        .promo {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('page') page!: ElementRef<HTMLElement>;
  @ViewChild('cards') cards?: ElementRef<HTMLElement>;

  private store = inject(Store);
  private categoryService = inject(CategoryService);
  private anim = inject(AnimationService);

  protected featured = toSignal(this.store.select(selectFeatured), { initialValue: [] });
  protected categories = signal<ICategory[]>([]);

  constructor() {
    this.store.dispatch(ProductActions.loadFeatured());
    this.categoryService.list().subscribe((cats) => this.categories.set(cats));
  }

  ngAfterViewInit(): void {
    this.anim.pageEnter(this.page.nativeElement);
    setTimeout(() => {
      if (this.cards) this.anim.staggerCards('.pcard', this.cards.nativeElement);
    }, 300);
  }

  emoji(name: string): string {
    const map: Record<string, string> = {
      Electronics: '💻',
      Fashion: '👕',
      'Home & Kitchen': '🏠',
      Books: '📚',
      Sports: '⚽',
      Beauty: '💄',
    };
    return map[name] ?? '🛍️';
  }
}
