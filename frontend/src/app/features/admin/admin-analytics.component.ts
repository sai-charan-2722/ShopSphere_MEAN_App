import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { AdminService } from '../../core/services/admin.service';
import type { RevenuePoint } from '../../core/services/seller.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CurrencyInrPipe],
  template: `
    <div class="page container">
      <div class="head">
        <h1 class="section-title" style="margin:0">Platform Analytics</h1>
        <select [(ngModel)]="interval" (ngModelChange)="load()">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div class="card chart">
        <h3>Revenue over time</h3>
        @if (revenue().length === 0) {
          <p class="muted">No revenue data yet.</p>
        } @else {
          <div class="bars">
            @for (pt of revenue(); track pt.period) {
              <div class="bar-col">
                <div class="bar" [style.height.%]="barHeight(pt, maxRevenue)" [title]="(pt.revenue | inr) + ' — ' + pt.period"></div>
                <span class="lbl">{{ pt.period.slice(-5) }}</span>
              </div>
            }
          </div>
        }
      </div>

      <div class="card chart mt-6">
        <h3>User growth</h3>
        @if (userGrowth().length === 0) {
          <p class="muted">No user data yet.</p>
        } @else {
          <div class="bars">
            @for (pt of userGrowth(); track pt.period) {
              <div class="bar-col">
                <div class="bar green" [style.height.%]="growthHeight(pt.users)" [title]="pt.users + ' users — ' + pt.period"></div>
                <span class="lbl">{{ pt.period.slice(-5) }}</span>
              </div>
            }
          </div>
        }
      </div>
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
      .head select {
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      .chart {
        padding: 22px;
      }
      .bars {
        display: flex;
        gap: 8px;
        align-items: flex-end;
        height: 220px;
        margin-top: 16px;
      }
      .bar-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        height: 100%;
        justify-content: flex-end;
      }
      .bar {
        width: 70%;
        max-width: 42px;
        background: linear-gradient(180deg, #6c63ff, #574fd6);
        border-radius: 6px 6px 0 0;
        min-height: 4px;
      }
      .bar.green {
        background: linear-gradient(180deg, #34d399, #059669);
      }
      .lbl {
        font-size: 11px;
        color: #9ca3af;
      }
    `,
  ],
})
export class AdminAnalyticsComponent {
  private adminService = inject(AdminService);

  protected interval: 'daily' | 'weekly' | 'monthly' = 'daily';
  protected revenue = signal<RevenuePoint[]>([]);
  protected userGrowth = signal<{ period: string; users: number }[]>([]);

  protected maxRevenue = 1;
  private maxUsers = 1;

  constructor() {
    this.load();
  }

  load(): void {
    this.adminService.revenue(this.interval).subscribe((data) => {
      this.revenue.set(data.revenue);
      this.userGrowth.set(data.userGrowth);
      this.maxRevenue = Math.max(1, ...data.revenue.map((d) => d.revenue));
      this.maxUsers = Math.max(1, ...data.userGrowth.map((d) => d.users));
    });
  }

  barHeight(pt: RevenuePoint, max: number): number {
    return Math.max(4, Math.round((pt.revenue / max) * 100));
  }

  growthHeight(users: number): number {
    return Math.max(4, Math.round((users / this.maxUsers) * 100));
  }
}
