import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { CartState } from './cart.reducer';

export const selectCartState = createFeatureSelector<CartState>('cart');

export const selectCartItems = createSelector(selectCartState, (s) => s.items);
export const selectCartLoading = createSelector(selectCartState, (s) => s.loading);
export const selectCartError = createSelector(selectCartState, (s) => s.error);

export const selectCartTotal = createSelector(selectCartItems, (items) =>
  items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0),
);

export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0),
);
