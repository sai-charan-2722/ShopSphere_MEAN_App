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
import { AdminService, type AdminOverview } from '../../core/services/admin.service';
import { AnimationService } from '../../core/services/animation.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="page container">
      <h1 class="section-title">Admin Dashboard</h1>

      <div class="stats">
        <div class="stat card">
          <span class="label">Platform Revenue</span>
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
          <span class="label">Users</span>
          <span #counter class="value" [attr.data-target]="overview()?.totalUsers ?? 0">0</span>
        </div>
        <div class="stat card">
          <span class="label">Sellers</span>
          <span #counter class="value" [attr.data-target]="overview()?.totalSellers ?? 0">0</span>
        </div>
      </div>

      <div class="links mt-6">
        <a routerLink="/admin/users" class="card link">👤 Users</a>
        <a routerLink="/admin/products" class="card link">📦 Products</a>
        <a routerLink="/admin/orders" class="card link">🧾 Orders</a>
        <a routerLink="/admin/categories" class="card link">🗂️ Categories</a>
        <a routerLink="/admin/analytics" class="card link">📊 Analytics</a>
      </div>
    </div>
  `,
  styles: [
    `
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
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
        font-size: 28px;
        font-weight: 800;
        color: #1a1a2e;
      }
      .links {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 16px;
      }
      .link {
        padding: 22px;
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
export class AdminDashboardComponent implements AfterViewInit {
  @ViewChildren('counter') counters!: QueryList<ElementRef<HTMLElement>>;

  private adminService = inject(AdminService);
  private anim = inject(AnimationService);

  protected overview = signal<AdminOverview | null>(null);

  constructor() {
    this.adminService.overview().subscribe((o) => this.overview.set(o));
  }

  revenueRupees(): number {
    return Math.round((this.overview()?.totalRevenue ?? 0) / 100);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.counters.forEach((ref) => {
        const el = ref.nativeElement;
        const target = Number(el.getAttribute('data-target') ?? '0');
        const prefix = el.getAttribute('data-prefix') ?? '';
        if (target > 0) this.anim.animateCounter(el, target, prefix);
      });
    }, 400);
  }
}
