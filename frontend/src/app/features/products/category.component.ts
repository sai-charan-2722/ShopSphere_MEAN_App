import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ProductActions } from '../../store/products/product.actions';
import {
  selectProducts,
  selectProductsLoading,
  selectProductsPage,
  selectTotalPages,
  selectProductsTotal,
} from '../../store/products/product.selectors';
import { CategoryService } from '../../core/services/category.service';
import type { ICategory } from '../../shared/models';

@Component({
  selector: 'app-category',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent, SkeletonLoaderComponent, PaginationComponent],
  template: `
    <div class="page container">
      <h1 class="section-title">{{ category()?.name ?? 'Category' }}</h1>
      @if (loading()) {
        <div class="grid grid-products">
          @for (i of [1, 2, 3, 4]; track i) {
            <app-skeleton-loader type="product-card" />
          }
        </div>
      } @else if (products().length === 0) {
        <div class="empty-state">
          <div class="emoji">📦</div>
          <h3>No products in this category yet</h3>
        </div>
      } @else {
        <div class="grid grid-products">
          @for (product of products(); track product._id) {
            <app-product-card [product]="product" [showSellerBadge]="true" />
          }
        </div>
        <app-pagination [currentPage]="page()" [totalPages]="totalPages()" [totalItems]="total()" (pageChange)="goToPage($event)" />
      }
    </div>
  `,
})
export class CategoryComponent {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);

  protected products = toSignal(this.store.select(selectProducts), { initialValue: [] });
  protected loading = toSignal(this.store.select(selectProductsLoading), { initialValue: false });
  protected page = toSignal(this.store.select(selectProductsPage), { initialValue: 1 });
  protected totalPages = toSignal(this.store.select(selectTotalPages), { initialValue: 1 });
  protected total = toSignal(this.store.select(selectProductsTotal), { initialValue: 0 });
  protected category = signal<ICategory | null>(null);

  private currentPage = 1;

  constructor() {
    this.route.paramMap.subscribe((pm) => {
      const slug = pm.get('slug');
      if (slug) {
        this.categoryService.getBySlug(slug).subscribe((cat) => {
          this.category.set(cat);
          this.load(cat._id);
        });
      }
    });
  }

  private load(categoryId: string): void {
    this.store.dispatch(ProductActions.loadProducts({ filters: { category: categoryId, page: this.currentPage, limit: 12 } }));
  }

  goToPage(p: number): void {
    this.currentPage = p;
    const cat = this.category();
    if (cat) this.load(cat._id);
  }
}
