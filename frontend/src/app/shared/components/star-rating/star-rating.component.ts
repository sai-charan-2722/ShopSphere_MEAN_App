import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="stars" [class.interactive]="!readonly" role="img" [attr.aria-label]="rating + ' out of ' + maxStars + ' stars'">
      @for (star of starArray; track star) {
        <span
          class="star"
          [class.filled]="star <= Math.round(rating)"
          (click)="select(star)"
          (keydown.enter)="select(star)"
          [attr.tabindex]="readonly ? null : 0"
          >★</span
        >
      }
    </span>
  `,
  styles: [
    `
      .stars {
        display: inline-flex;
        gap: 1px;
        color: #d1d5db;
        font-size: 16px;
        line-height: 1;
      }
      .star.filled {
        color: #f59e0b;
      }
      .interactive .star {
        cursor: pointer;
      }
      .interactive .star:hover {
        transform: scale(1.15);
      }
    `,
  ],
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() maxStars = 5;
  @Input() readonly = true;
  @Output() ratingChange = new EventEmitter<number>();

  protected readonly Math = Math;

  get starArray(): number[] {
    return Array.from({ length: this.maxStars }, (_, i) => i + 1);
  }

  select(star: number): void {
    if (this.readonly) return;
    this.rating = star;
    this.ratingChange.emit(star);
  }
}
