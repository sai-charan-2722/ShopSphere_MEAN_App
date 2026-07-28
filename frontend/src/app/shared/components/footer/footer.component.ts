import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container cols">
        <div>
          <a routerLink="/" class="logo">Shop<span>Sphere</span></a>
          <p class="muted">A multi-vendor marketplace built on the MEAN stack.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <a routerLink="/products">All Products</a>
          <a routerLink="/products" [queryParams]="{ sort: 'rating_desc' }">Top Rated</a>
        </div>
        <div>
          <h4>Account</h4>
          <a routerLink="/orders">My Orders</a>
          <a routerLink="/wishlist">Wishlist</a>
          <a routerLink="/profile">Profile</a>
        </div>
        <div>
          <h4>Sell</h4>
          <a routerLink="/seller/dashboard">Seller Dashboard</a>
        </div>
      </div>
      <div class="bar">
        <div class="container">© {{ year }} ShopSphere. Built for demonstration purposes.</div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        background: #1a1a2e;
        color: #cbd5e1;
        margin-top: 60px;
      }
      .cols {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 32px;
        padding: 44px 20px;
      }
      .logo {
        font-size: 20px;
        font-weight: 800;
        color: #fff;
      }
      .logo span {
        color: #6c63ff;
      }
      h4 {
        color: #fff;
        margin: 0 0 12px;
        font-size: 14px;
      }
      .cols a {
        display: block;
        color: #cbd5e1;
        font-size: 14px;
        margin: 7px 0;
      }
      .cols a:hover {
        color: #fff;
      }
      .muted {
        color: #94a3b8;
        font-size: 14px;
        max-width: 280px;
      }
      .bar {
        border-top: 1px solid #2d2d44;
        padding: 16px 0;
        font-size: 13px;
        color: #94a3b8;
      }
      @media (max-width: 720px) {
        .cols {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ],
})
export class FooterComponent {
  protected year = new Date().getFullYear();
}
