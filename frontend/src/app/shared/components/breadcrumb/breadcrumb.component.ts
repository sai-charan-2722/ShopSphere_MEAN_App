import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

interface Crumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (crumbs().length > 0) {
      <nav class="crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a>
        @for (c of crumbs(); track c.url) {
          <span class="sep">/</span>
          <a [routerLink]="c.url">{{ c.label }}</a>
        }
      </nav>
    }
  `,
  styles: [
    `
      .crumbs {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 18px;
        flex-wrap: wrap;
      }
      .crumbs a {
        color: #6b7280;
      }
      .crumbs a:hover {
        color: #6c63ff;
      }
      .sep {
        color: #cbd5e1;
      }
    `,
  ],
})
export class BreadcrumbComponent {
  private router = inject(Router);
  protected crumbs = signal<Crumb[]>([]);

  constructor() {
    this.build(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.build(e.urlAfterRedirects));
  }

  private build(url: string): void {
    const clean = url.split('?')[0].split('#')[0];
    const segments = clean.split('/').filter(Boolean);
    let acc = '';
    const crumbs: Crumb[] = segments.map((seg) => {
      acc += `/${seg}`;
      const label = decodeURIComponent(seg).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return { label, url: acc };
    });
    this.crumbs.set(crumbs);
  }
}
