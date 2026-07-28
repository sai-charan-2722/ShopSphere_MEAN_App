import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { OrderState } from './order.reducer';

export const selectOrderState = createFeatureSelector<OrderState>('orders');

export const selectOrders = createSelector(selectOrderState, (s) => s.orders);
export const selectSelectedOrder = createSelector(selectOrderState, (s) => s.selectedOrder);
export const selectOrdersLoading = createSelector(selectOrderState, (s) => s.loading);
export const selectOrdersError = createSelector(selectOrderState, (s) => s.error);
export const selectOrdersTotal = createSelector(selectOrderState, (s) => s.total);
export const selectOrdersPage = createSelector(selectOrderState, (s) => s.page);
