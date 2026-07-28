import { createReducer, on } from '@ngrx/store';
import { CartActions } from './cart.actions';
import type { CartItem } from '../../shared/models';

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

export const initialCartState: CartState = {
  items: [],
  loading: false,
  error: null,
};

export const cartReducer = createReducer(
  initialCartState,

  on(CartActions.loadCart, CartActions.addItem, CartActions.updateQuantity, CartActions.removeItem, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(
    CartActions.loadCartSuccess,
    CartActions.addItemSuccess,
    CartActions.updateQuantitySuccess,
    CartActions.removeItemSuccess,
    (state, { items }) => ({ ...state, items, loading: false, error: null }),
  ),

  on(
    CartActions.loadCartFailure,
    CartActions.addItemFailure,
    CartActions.updateQuantityFailure,
    CartActions.removeItemFailure,
    CartActions.clearCartFailure,
    (state, { error }) => ({ ...state, loading: false, error }),
  ),

  on(CartActions.clearCartSuccess, (state) => ({ ...state, items: [], loading: false })),
);
