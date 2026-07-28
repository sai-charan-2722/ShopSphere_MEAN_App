import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { SellerService, type RevenuePoint, type TopProduct } from '../../core/services/seller.service';

@Component({
  selector: 'app-seller-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CurrencyInrPipe],
  template: `
    <div class="page container">
      <div class="head">
        <h1 class="section-title" style="margin:0">Analytics</h1>
        <select [(ngModel)]="interval" (ngModelChange)="loadRevenue()">
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
                <div class="bar" [style.height.%]="barHeight(pt)" [title]="(pt.revenue | inr) + ' — ' + pt.period"></div>
                <span class="lbl">{{ pt.period.slice(-5) }}</span>
              </div>
            }
          </div>
        }
      </div>

      <div class="grid2 mt-6">
        <div class="card">
          <h3>Top Products</h3>
          @if (top().length === 0) {
            <p class="muted">No sales yet.</p>
          } @else {
            <ol class="top">
              @for (p of top(); track p.productId) {
                <li>
                  <span class="t">{{ p.title }}</span>
                  <span class="muted">{{ p.unitsSold }} sold</span>
                  <span class="rev">{{ p.revenue | inr }}</span>
                </li>
              }
            </ol>
          }
        </div>

        <div class="card">
          <h3>Orders by Status</h3>
          <ul class="status-list">
            @for (row of statusRows(); track row.status) {
              <li>
                <span class="dot s-{{ row.status }}"></span>
                <span class="cap">{{ row.status.replace('_', ' ') }}</span>
                <span class="count">{{ row.count }}</span>
              </li>
            }
          </ul>
        </div>
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
        transition: height 0.4s ease;
      }
      .lbl {
        font-size: 11px;
        color: #9ca3af;
      }
      .grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .card {
        padding: 20px;
      }
      .top {
        margin: 0;
        padding-left: 18px;
      }
      .top li {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px solid #f1f1f4;
      }
      .rev {
        font-weight: 700;
      }
      .status-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .status-list li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
      }
      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #6c63ff;
      }
      .cap {
        text-transform: capitalize;
        flex: 1;
      }
      .count {
        font-weight: 700;
      }
      @media (max-width: 800px) {
        .grid2 {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SellerAnalyticsComponent {
  private sellerService = inject(SellerService);

  protected interval: 'daily' | 'weekly' | 'monthly' = 'daily';
  protected revenue = signal<RevenuePoint[]>([]);
  protected top = signal<TopProduct[]>([]);
  protected ordersByStatus = signal<Record<string, number>>({});

  protected statusRows = computed(() =>
    Object.entries(this.ordersByStatus()).map(([status, count]) => ({ status, count })),
  );

  private maxRevenue = 1;

  constructor() {
    this.loadRevenue();
    this.sellerService.topProducts().subscribe((t) => this.top.set(t));
    this.sellerService.ordersByStatus().subscribe((s) => this.ordersByStatus.set(s));
  }

  loadRevenue(): void {
    this.sellerService.revenue(this.interval).subscribe((data) => {
      this.maxRevenue = Math.max(1, ...data.map((d) => d.revenue));
      this.revenue.set(data);
    });
  }

  barHeight(pt: RevenuePoint): number {
    return Math.max(4, Math.round((pt.revenue / this.maxRevenue) * 100));
  }
}
