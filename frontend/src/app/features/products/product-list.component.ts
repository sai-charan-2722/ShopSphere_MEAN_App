import {
  Component,
  inject,
  signal,
  AfterViewInit,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';

import { ProductActions } from '../../store/products/product.actions';
import {
  selectProducts,
  selectProductsLoading,
  selectProductsTotal,
  selectProductsPage,
  selectTotalPages,
} from '../../store/products/product.selectors';
import { CategoryService } from '../../core/services/category.service';
import { AnimationService } from '../../core/services/animation.service';
import type { ICategory, ProductFilters } from '../../shared/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ProductCardComponent,
    SkeletonLoaderComponent,
    PaginationComponent,
    BreadcrumbComponent,
    StarRatingComponent,
  ],
  template: `
    <div class="page container" #page>
      <app-breadcrumb />
      <div class="layout">
        <!-- Filters sidebar -->
        <aside class="filters card">
          <h3>Filters</h3>

          <div class="filter-group">
            <label>Category</label>
            <select [(ngModel)]="filters.category" (change)="apply()">
              <option [ngValue]="undefined">All categories</option>
              @for (cat of categories(); track cat._id) {
                <option [ngValue]="cat._id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label>Price range (₹)</label>
            <div class="price-inputs">
              <input type="number" placeholder="Min" [(ngModel)]="minRupees" />
              <span>–</span>
              <input type="number" placeholder="Max" [(ngModel)]="maxRupees" />
            </div>
          </div>

          <div class="filter-group">
            <label>Minimum rating</label>
            <div class="rating-filter">
              @for (r of [4, 3, 2, 1]; track r) {
                <button class="rf" [class.active]="filters.rating === r" (click)="setRating(r)">
                  <app-star-rating [rating]="r" /> &nbsp;& up
                </button>
              }
            </div>
          </div>

          <label class="checkbox">
            <input type="checkbox" [(ngModel)]="filters.inStock" (change)="apply()" />
            In stock only
          </label>

          <button class="btn btn-primary w-full" (click)="apply()">Apply</button>
          <button class="btn btn-outline w-full mt-2" (click)="reset()">Reset</button>
        </aside>

        <!-- Results -->
        <section class="results">
          <div class="toolbar">
            <span class="muted">{{ total() }} products</span>
            <select [(ngModel)]="filters.sort" (change)="apply()">
              <option [ngValue]="undefined">Sort: Relevance</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Top Rated</option>
            </select>
          </div>

          @if (loading()) {
            <div class="grid grid-products">
              @for (i of [1, 2, 3, 4, 5, 6]; track i) {
                <app-skeleton-loader type="product-card" />
              }
            </div>
          } @else if (products().length === 0) {
            <div class="empty-state">
              <div class="emoji">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          } @else {
            <div #cards class="grid grid-products">
              @for (product of products(); track product._id) {
                <app-product-card [product]="product" [showSellerBadge]="true" />
              }
            </div>
            <app-pagination
              [currentPage]="page$()"
              [totalPages]="totalPages()"
              [totalItems]="total()"
              (pageChange)="goToPage($event)"
            />
          }
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 24px;
        align-items: start;
      }
      .filters {
        padding: 18px;
        position: sticky;
        top: 82px;
      }
      .filters h3 {
        margin: 0 0 16px;
      }
      .filter-group {
        margin-bottom: 18px;
      }
      .filter-group label {
        display: block;
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 8px;
      }
      select,
      input[type='number'] {
        width: 100%;
        padding: 9px 10px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
      }
      .price-inputs {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .rating-filter {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .rf {
        display: flex;
        align-items: center;
        border: 1px solid transparent;
        background: none;
        padding: 5px 8px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
      }
      .rf.active {
        border-color: #6c63ff;
        background: #f3f2ff;
      }
      .checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        margin-bottom: 16px;
      }
      .w-full {
        width: 100%;
        justify-content: center;
      }
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
      }
      .toolbar select {
        width: auto;
      }
      @media (max-width: 860px) {
        .layout {
          grid-template-columns: 1fr;
        }
        .filters {
          position: static;
        }
      }
    `,
  ],
})
export class ProductListComponent implements AfterViewInit {
  @ViewChild('page') pageEl!: ElementRef<HTMLElement>;
  @ViewChild('cards') cards?: ElementRef<HTMLElement>;

  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private anim = inject(AnimationService);

  protected products = toSignal(this.store.select(selectProducts), { initialValue: [] });
  protected loading = toSignal(this.store.select(selectProductsLoading), { initialValue: false });
  protected total = toSignal(this.store.select(selectProductsTotal), { initialValue: 0 });
  protected page$ = toSignal(this.store.select(selectProductsPage), { initialValue: 1 });
  protected totalPages = toSignal(this.store.select(selectTotalPages), { initialValue: 1 });

  protected categories = signal<ICategory[]>([]);
  protected filters: ProductFilters = { page: 1, limit: 12 };
  protected minRupees?: number;
  protected maxRupees?: number;

  constructor() {
    this.categoryService.list().subscribe((c) => this.categories.set(this.flatten(c)));
    this.route.queryParams.subscribe((params) => {
      this.filters = {
        page: params['page'] ? +params['page'] : 1,
        limit: 12,
        search: params['search'] || undefined,
        category: params['category'] || undefined,
        sort: params['sort'] || undefined,
      };
      this.load();
    });
  }

  ngAfterViewInit(): void {
    this.anim.pageEnter(this.pageEl.nativeElement);
  }

  private flatten(cats: ICategory[]): ICategory[] {
    const out: ICategory[] = [];
    for (const c of cats) {
      out.push(c);
      if (c.children?.length) out.push(...c.children);
    }
    return out;
  }

  private load(): void {
    if (this.minRupees != null) this.filters.minPrice = this.minRupees * 100;
    if (this.maxRupees != null) this.filters.maxPrice = this.maxRupees * 100;
    this.store.dispatch(ProductActions.loadProducts({ filters: this.filters }));
    setTimeout(() => {
      if (this.cards) this.anim.staggerCards('.pcard', this.cards.nativeElement);
    }, 250);
  }

  apply(): void {
    void this.router.navigate([], {
      queryParams: {
        search: this.filters.search || null,
        category: this.filters.category || null,
        sort: this.filters.sort || null,
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  }

  setRating(r: number): void {
    this.filters.rating = this.filters.rating === r ? undefined : r;
    this.load();
  }

  reset(): void {
    this.filters = { page: 1, limit: 12 };
    this.minRupees = this.maxRupees = undefined;
    void this.router.navigate([], { queryParams: {} });
  }

  goToPage(p: number): void {
    void this.router.navigate([], { queryParams: { page: p }, queryParamsHandling: 'merge' });
  }
}
