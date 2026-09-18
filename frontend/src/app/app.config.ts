import {
  type ApplicationConfig,
  provideZoneChangeDetection,
  provideAppInitializer,
  isDevMode,
  inject,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { AuthService } from './core/services/auth.service';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

import { cartReducer } from './store/cart/cart.reducer';
import { productReducer } from './store/products/product.reducer';
import { orderReducer } from './store/orders/order.reducer';

import * as cartEffects from './store/cart/cart.effects';
import * as productEffects from './store/products/product.effects';
import * as orderEffects from './store/orders/order.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),

    provideStore({
      cart: cartReducer,
      products: productReducer,
      orders: orderReducer,
    }),
    provideEffects([cartEffects, productEffects, orderEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),

    // Load the Clerk browser SDK and expose it as window.Clerk before the app renders.
    provideAppInitializer(() => inject(AuthService).initClerk()),
  ],
};
