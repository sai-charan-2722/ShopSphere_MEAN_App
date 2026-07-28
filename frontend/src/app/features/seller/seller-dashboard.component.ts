import {
  Component,
  inject,
  signal,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  QueryList,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SellerService, type SellerOverview } from '../../core/services/seller.service';
import { AnimationService } from '../../core/services/animation.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="page container">
      <div class="head">
        <h1 class="section-title" style="margin:0">Seller Dashboard</h1>
        <a routerLink="/seller/products/new" class="btn btn-primary">+ New Product</a>
      </div>

      <div class="stats">
        <div class="stat card">
          <span class="label">Total Revenue</span>
          <span #counter class="value" data-prefix="₹" [attr.data-target]="revenueRupees()">₹0</span>
        </div>
        <div class="stat card">
          <span class="label">Orders</span>
          <span #counter class="value" [attr.data-target]="overview()?.totalOrders ?? 0">0</span>
        </div>
        <div class="stat card">
          <span class="label">Products</span>
          <span #counter class="value" [attr.data-target]="overview()?.totalProducts ?? 0">0</span>
        </div>
        <div class="stat card">
          <span class="label">Avg Rating</span>
          <span class="value">{{ overview()?.avgRating ?? 0 }} ★</span>
        </div>
      </div>

      <div class="links mt-6">
        <a routerLink="/seller/products" class="card link">📦 Manage Products</a>
        <a routerLink="/seller/orders" class="card link">🧾 View Orders</a>
        <a routerLink="/seller/analytics" class="card link">📊 Analytics</a>
      </div>
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 22px;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
      }
      .stat {
        padding: 22px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .label {
        color: #6b7280;
        font-size: 13px;
        font-weight: 600;
      }
      .value {
        font-size: 30px;
        font-weight: 800;
        color: #1a1a2e;
      }
      .links {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
      .link {
        padding: 24px;
        font-weight: 700;
        color: #1a1a2e;
        text-decoration: none;
      }
      .link:hover {
        box-shadow: 0 8px 20px rgba(16, 24, 40, 0.1);
        text-decoration: none;
      }
    `,
  ],
})
export class SellerDashboardComponent implements AfterViewInit {
  @ViewChildren('counter') counters!: QueryList<ElementRef<HTMLElement>>;

  private sellerService = inject(SellerService);
  private anim = inject(AnimationService);

  protected overview = signal<SellerOverview | null>(null);

  constructor() {
    this.sellerService.overview().subscribe((o) => this.overview.set(o));
  }

  revenueRupees(): number {
    return Math.round((this.overview()?.totalRevenue ?? 0) / 100);
  }

  ngAfterViewInit(): void {
    // Re-run counters once data resolves.
    const run = (): void => {
      this.counters.forEach((ref) => {
        const el = ref.nativeElement;
        const target = Number(el.getAttribute('data-target') ?? '0');
        const prefix = el.getAttribute('data-prefix') ?? '';
        if (target > 0) this.anim.animateCounter(el, target, prefix);
      });
    };
    setTimeout(run, 400);
  }
}
