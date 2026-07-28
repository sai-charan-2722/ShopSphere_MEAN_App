import { Component, inject, effect, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';

import { AuthService } from './core/services/auth.service';
import { SocketService } from './core/services/socket.service';
import { UserService } from './core/services/user.service';
import { ToastService } from './core/services/toast.service';
import { CartActions } from './store/cart/cart.actions';
import { OrderActions } from './store/orders/order.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
    <app-footer />
    <app-toast />
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      main {
        flex: 1;
      }
    `,
  ],
})
export class App {
  private auth = inject(AuthService);
  private socket = inject(SocketService);
  private store = inject(Store);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  private bootstrapped = false;

  constructor() {
    // React to sign-in state becoming available.
    effect(() => {
      const user = this.auth.user();
      if (user && !this.bootstrapped) {
        this.bootstrapped = true;
        this.onSignedIn(user.id);
      }
    });

    this.wireRealtime();
  }

  private onSignedIn(clerkId: string): void {
    // Ensure the MongoDB mirror exists, then hydrate cart + join socket rooms.
    this.userService.syncMe().subscribe({
      next: (mongoUser) => {
        this.store.dispatch(CartActions.loadCart());
        this.socket.joinBuyerRoom(mongoUser._id);
        if (mongoUser.role === 'seller' || mongoUser.role === 'admin') {
          this.socket.joinSellerRoom(mongoUser._id);
        }
      },
      error: () => {
        // Non-fatal; user can still browse.
      },
    });
    void clerkId;
  }

  private wireRealtime(): void {
    this.socket
      .onOrderStatusUpdate()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((evt) => {
        this.store.dispatch(OrderActions.orderStatusUpdated({ orderId: evt.orderId, status: evt.status }));
        this.toast.info(`Order update: ${evt.status.replace(/_/g, ' ')}`);
      });

    this.socket
      .onPaymentConfirmed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.toast.success('Payment confirmed! Your order is being processed.'));

    this.socket
      .onNewOrder()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.toast.success('🎉 You received a new order!'));
  }
}
