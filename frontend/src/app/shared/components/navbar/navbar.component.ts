import {
  Component,
  inject,
  signal,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectCartCount } from '../../../store/cart/cart.selectors';
import { AuthService } from '../../../core/services/auth.service';
import { AnimationService } from '../../../core/services/animation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header #nav class="navbar">
      <div class="container inner">
        <a routerLink="/" class="logo">Shop<span>Sphere</span></a>

        <form class="search" (submit)="search($event)">
          <input
            type="search"
            name="q"
            [(ngModel)]="query"
            placeholder="Search products, brands and more..."
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">🔍</button>
        </form>

        <nav class="links">
          <a routerLink="/products" routerLinkActive="active">Shop</a>

          @if (auth.role() === 'seller' || auth.role() === 'admin') {
            <a routerLink="/seller/dashboard" class="role-link">Seller</a>
          }
          @if (auth.role() === 'admin') {
            <a routerLink="/admin/dashboard" class="role-link admin">Admin</a>
          }

          <a routerLink="/cart" class="cart" id="cart-icon" aria-label="Cart">
            🛒
            @if (cartCount() > 0) {
              <span class="badge">{{ cartCount() }}</span>
            }
          </a>

          @if (auth.isSignedIn()) {
            <div class="user-menu">
              <button class="avatar" (click)="menuOpen.set(!menuOpen())" aria-label="User menu">
                @if (auth.user()?.imageUrl) {
                  <img [src]="auth.user()!.imageUrl" alt="Profile" />
                } @else {
                  <span>{{ initials() }}</span>
                }
              </button>
              @if (menuOpen()) {
                <div class="dropdown" (mouseleave)="menuOpen.set(false)">
                  <a routerLink="/profile" (click)="menuOpen.set(false)">Profile</a>
                  <a routerLink="/orders" (click)="menuOpen.set(false)">My Orders</a>
                  <a routerLink="/wishlist" (click)="menuOpen.set(false)">Wishlist</a>
                  <button (click)="signOut()">Sign Out</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/sign-in" class="btn btn-primary signin">Sign In</a>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [
    `
      .navbar {
        position: sticky;
        top: 0;
        z-index: 900;
        background: #fff;
        border-bottom: 1px solid #eee;
        will-change: transform;
      }
      .inner {
        display: flex;
        align-items: center;
        gap: 20px;
        height: 66px;
      }
      .logo {
        font-size: 22px;
        font-weight: 800;
        color: #1a1a2e;
        white-space: nowrap;
      }
      .logo span {
        color: #6c63ff;
      }
      .search {
        flex: 1;
        display: flex;
        max-width: 520px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
      }
      .search input {
        flex: 1;
        border: none;
        padding: 10px 14px;
        outline: none;
        font-size: 14px;
      }
      .search button {
        border: none;
        background: #f3f4f6;
        padding: 0 14px;
        cursor: pointer;
      }
      .links {
        display: flex;
        align-items: center;
        gap: 18px;
      }
      .links a {
        color: #374151;
        font-weight: 600;
        font-size: 14px;
      }
      .links a.active {
        color: #6c63ff;
      }
      .role-link {
        color: #6c63ff !important;
      }
      .role-link.admin {
        color: #ff6584 !important;
      }
      .cart {
        position: relative;
        font-size: 20px;
        text-decoration: none;
      }
      .badge {
        position: absolute;
        top: -8px;
        right: -10px;
        background: #ff6584;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
      }
      .user-menu {
        position: relative;
      }
      .avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: none;
        background: #6c63ff;
        color: #fff;
        font-weight: 700;
        cursor: pointer;
        overflow: hidden;
      }
      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .dropdown {
        position: absolute;
        right: 0;
        top: 48px;
        background: #fff;
        border: 1px solid #eee;
        border-radius: 12px;
        box-shadow: 0 12px 32px rgba(16, 24, 40, 0.14);
        display: flex;
        flex-direction: column;
        min-width: 170px;
        overflow: hidden;
      }
      .dropdown a,
      .dropdown button {
        padding: 11px 16px;
        text-align: left;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        color: #374151;
        font-weight: 500;
      }
      .dropdown a:hover,
      .dropdown button:hover {
        background: #f7f7fb;
        text-decoration: none;
      }
      .signin {
        text-decoration: none;
      }
      @media (max-width: 720px) {
        .search {
          display: none;
        }
      }
    `,
  ],
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('nav') navRef!: ElementRef<HTMLElement>;

  protected auth = inject(AuthService);
  private store = inject(Store);
  private router = inject(Router);
  private anim = inject(AnimationService);

  protected query = '';
  protected menuOpen = signal(false);
  protected cartCount = toSignal(this.store.select(selectCartCount), { initialValue: 0 });

  private teardown?: () => void;

  ngAfterViewInit(): void {
    this.teardown = this.anim.navbarAutoHide(this.navRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.teardown?.();
  }

  initials(): string {
    const name = this.auth.user()?.fullName ?? this.auth.user()?.firstName ?? 'U';
    return name.slice(0, 1).toUpperCase();
  }

  search(event: Event): void {
    event.preventDefault();
    void this.router.navigate(['/products'], { queryParams: { search: this.query || null } });
  }

  signOut(): void {
    this.menuOpen.set(false);
    void this.auth.signOut().then(() => this.router.navigate(['/']));
  }
}
