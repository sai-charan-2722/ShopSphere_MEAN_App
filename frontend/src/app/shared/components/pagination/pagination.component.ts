import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages > 1) {
      <nav class="pagination" aria-label="Pagination">
        <button class="pg-btn" [disabled]="currentPage <= 1" (click)="go(currentPage - 1)" aria-label="Previous page">
          ‹
        </button>
        @for (p of pages; track p) {
          @if (p === -1) {
            <span class="ellipsis">…</span>
          } @else {
            <button class="pg-btn" [class.active]="p === currentPage" (click)="go(p)">{{ p }}</button>
          }
        }
        <button
          class="pg-btn"
          [disabled]="currentPage >= totalPages"
          (click)="go(currentPage + 1)"
          aria-label="Next page"
        >
          ›
        </button>
      </nav>
    }
  `,
  styles: [
    `
      .pagination {
        display: flex;
        gap: 6px;
        justify-content: center;
        align-items: center;
        margin: 28px 0;
        flex-wrap: wrap;
      }
      .pg-btn {
        min-width: 38px;
        height: 38px;
        border: 1px solid #e5e7eb;
        background: #fff;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        color: #1a1a2e;
      }
      .pg-btn.active {
        background: #6c63ff;
        color: #fff;
        border-color: #6c63ff;
      }
      .pg-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .ellipsis {
        padding: 0 4px;
        color: #9ca3af;
      }
    `,
  ],
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() itemsPerPage = 12;
  @Output() pageChange = new EventEmitter<number>();

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const result: number[] = [1];
    if (current > 3) result.push(-1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) result.push(i);
    if (current < total - 2) result.push(-1);
    result.push(total);
    return result;
  }

  go(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }
}
