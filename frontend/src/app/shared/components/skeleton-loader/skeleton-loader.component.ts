import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

type SkeletonType = 'product-card' | 'product-detail' | 'order' | 'text';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (type) {
      @case ('product-card') {
        <div class="sk-card">
          <div class="skeleton sk-img"></div>
          <div class="skeleton sk-line w-80"></div>
          <div class="skeleton sk-line w-50"></div>
          <div class="skeleton sk-line w-30"></div>
        </div>
      }
      @case ('product-detail') {
        <div class="sk-detail">
          <div class="skeleton sk-hero"></div>
          <div class="sk-info">
            <div class="skeleton sk-line w-90"></div>
            <div class="skeleton sk-line w-60"></div>
            <div class="skeleton sk-line w-40"></div>
            <div class="skeleton sk-block"></div>
          </div>
        </div>
      }
      @case ('order') {
        <div class="skeleton sk-order"></div>
      }
      @default {
        <div class="skeleton sk-line w-100"></div>
      }
    }
  `,
  styles: [
    `
      .sk-card {
        border-radius: 12px;
        padding: 12px;
        background: #fff;
        border: 1px solid #eee;
      }
      .sk-img {
        height: 180px;
        border-radius: 8px;
        margin-bottom: 12px;
      }
      .sk-line {
        height: 12px;
        border-radius: 6px;
        margin: 8px 0;
      }
      .sk-block {
        height: 120px;
        border-radius: 8px;
        margin-top: 12px;
      }
      .sk-hero {
        height: 380px;
        border-radius: 12px;
      }
      .sk-order {
        height: 96px;
        border-radius: 12px;
      }
      .sk-detail {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      .w-30 {
        width: 30%;
      }
      .w-40 {
        width: 40%;
      }
      .w-50 {
        width: 50%;
      }
      .w-60 {
        width: 60%;
      }
      .w-80 {
        width: 80%;
      }
      .w-90 {
        width: 90%;
      }
      .w-100 {
        width: 100%;
      }
      @media (max-width: 720px) {
        .sk-detail {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SkeletonLoaderComponent {
  @Input() type: SkeletonType = 'text';
}
