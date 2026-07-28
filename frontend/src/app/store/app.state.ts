import type { CartState } from './cart/cart.reducer';
import type { ProductState } from './products/product.reducer';
import type { OrderState } from './orders/order.reducer';

export interface AppState {
  cart: CartState;
  products: ProductState;
  orders: OrderState;
}
