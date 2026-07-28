import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { UserService } from '../../core/services/user.service';
import type { IProduct } from '../../shared/models';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <div class="page container">
      <h1 class="section-title">My Wishlist</h1>
      @if (loaded() && products().length === 0) {
        <div class="empty-state">
          <div class="emoji">💜</div>
          <h3>Your wishlist is empty</h3>
          <a routerLink="/products" class="btn btn-primary mt-4">Discover Products</a>
        </div>
      } @else {
        <div class="grid grid-products">
          @for (product of products(); track product._id) {
            <app-product-card [product]="product" [showSellerBadge]="true" />
          }
        </div>
      }
    </div>
  `,
})
export class WishlistComponent {
  private userService = inject(UserService);
  protected products = signal<IProduct[]>([]);
  protected loaded = signal(false);

  constructor() {
    this.userService.getWishlist().subscribe((p) => {
      this.products.set(p);
      this.loaded.set(true);
    });
  }
}
