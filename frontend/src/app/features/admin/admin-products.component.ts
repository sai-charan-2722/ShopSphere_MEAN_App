import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import type { IProduct } from '../../shared/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CurrencyInrPipe, PaginationComponent],
  template: `
    <div class="page container">
      <h1 class="section-title">All Products</h1>

      <div class="search">
        <input [(ngModel)]="search" (keyup.enter)="load(1)" placeholder="Search products…" />
        <button class="btn btn-primary" (click)="load(1)">Search</button>
      </div>

      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Featured</th>
            </tr>
          </thead>
          <tbody>
            @for (p of products(); track p._id) {
              <tr>
                <td class="prod">
                  <img [src]="p.images[0]" [alt]="p.title" />
                  <span>{{ p.title }}</span>
                </td>
                <td>{{ sellerName(p) }}</td>
                <td>{{ p.price | inr }}</td>
                <td>{{ p.stock }}</td>
                <td><span class="pill" [class.on]="p.isActive">{{ p.isActive ? 'Active' : 'Inactive' }}</span></td>
                <td>
                  <button class="star" [class.on]="p.isFeatured" (click)="toggle(p)" aria-label="Toggle featured">
                    {{ p.isFeatured ? '★' : '☆' }}
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-pagination [currentPage]="page()" [totalPages]="pages()" (pageChange)="load($event)" />
    </div>
  `,
  styles: [
    `
      .search {
        display: flex;
        gap: 10px;
        margin-bottom: 18px;
        max-width: 480px;
      }
      .search input {
        flex: 1;
        padding: 10px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
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
      .prod {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .prod img {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        object-fit: cover;
      }
      .pill {
        font-size: 12px;
        padding: 3px 10px;
        border-radius: 999px;
        background: #fee2e2;
        color: #dc2626;
      }
      .pill.on {
        background: #dcfce7;
        color: #16a34a;
      }
      .star {
        border: none;
        background: none;
        font-size: 20px;
        cursor: pointer;
        color: #d1d5db;
      }
      .star.on {
        color: #f59e0b;
      }
    `,
  ],
})
export class AdminProductsComponent {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  protected products = signal<IProduct[]>([]);
  protected page = signal(1);
  protected pages = signal(1);
  protected search = '';

  constructor() {
    this.load(1);
  }

  load(page: number): void {
    this.adminService.products(page, 12, this.search).subscribe((res) => {
      this.products.set(res.products);
      this.page.set(res.meta.page);
      this.pages.set(res.meta.totalPages);
    });
  }

  sellerName(p: IProduct): string {
    return typeof p.seller === 'object' ? p.seller.name : '—';
  }

  toggle(product: IProduct): void {
    this.adminService.toggleFeatured(product._id).subscribe((updated) => {
      this.toast.success(`${updated.title} ${updated.isFeatured ? 'featured' : 'unfeatured'}`);
      this.load(this.page());
    });
  }
}
