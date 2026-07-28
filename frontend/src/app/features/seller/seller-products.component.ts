import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SellerService } from '../../core/services/seller.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import type { IProduct } from '../../shared/models';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyInrPipe, PaginationComponent],
  template: `
    <div class="page container">
      <div class="head">
        <h1 class="section-title" style="margin:0">My Products</h1>
        <a routerLink="/seller/products/new" class="btn btn-primary">+ New Product</a>
      </div>

      @if (products().length === 0) {
        <div class="empty-state">
          <div class="emoji">📦</div>
          <h3>No products yet</h3>
          <a routerLink="/seller/products/new" class="btn btn-primary mt-4">Create your first product</a>
        </div>
      } @else {
        <div class="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (p of products(); track p._id) {
                <tr>
                  <td class="prod">
                    <img [src]="p.images[0]" [alt]="p.title" />
                    <span>{{ p.title }}</span>
                  </td>
                  <td>{{ p.price | inr }}</td>
                  <td [class.low]="p.stock < 5">{{ p.stock }}</td>
                  <td>{{ p.ratings }} ★</td>
                  <td>
                    <span class="pill" [class.on]="p.isActive">{{ p.isActive ? 'Active' : 'Inactive' }}</span>
                  </td>
                  <td class="actions">
                    <a [routerLink]="['/seller/products', p._id, 'edit']">Edit</a>
                    <button (click)="remove(p)">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination [currentPage]="page()" [totalPages]="pages()" (pageChange)="load($event)" />
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
      .low {
        color: #d97706;
        font-weight: 700;
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
      .actions {
        display: flex;
        gap: 12px;
      }
      .actions button {
        border: none;
        background: none;
        color: #dc2626;
        cursor: pointer;
        font-weight: 600;
      }
    `,
  ],
})
export class SellerProductsComponent {
  private sellerService = inject(SellerService);
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);

  protected products = signal<IProduct[]>([]);
  protected page = signal(1);
  protected pages = signal(1);

  constructor() {
    this.load(1);
  }

  load(page: number): void {
    this.sellerService.products(page).subscribe((res) => {
      this.products.set(res.products);
      this.page.set(res.meta.page);
      this.pages.set(res.meta.totalPages);
    });
  }

  async remove(product: IProduct): Promise<void> {
    const data: ConfirmDialogData = {
      title: 'Delete product',
      message: `Are you sure you want to delete "${product.title}"?`,
      confirmText: 'Delete',
      danger: true,
    };
    const confirmed = await firstValueFrom(this.dialog.open(ConfirmDialogComponent, { data }).afterClosed());
    if (!confirmed) return;
    this.productService.remove(product._id).subscribe(() => {
      this.toast.success('Product deleted');
      this.load(this.page());
    });
  }
}
