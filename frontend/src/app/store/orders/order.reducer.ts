import { createReducer, on } from '@ngrx/store';
import { OrderActions } from './order.actions';
import type { IOrder } from '../../shared/models';

export interface OrderState {
  orders: IOrder[];
  selectedOrder: IOrder | null;
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
}

export const initialOrderState: OrderState = {
  orders: [],
  selectedOrder: null,
  total: 0,
  page: 1,
  loading: false,
  error: null,
};

export const orderReducer = createReducer(
  initialOrderState,

  on(OrderActions.loadOrders, OrderActions.loadOrder, OrderActions.cancelOrder, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(OrderActions.loadOrdersSuccess, (state, { orders, total, page }) => ({
    ...state,
    orders,
    total,
    page,
    loading: false,
  })),

  on(OrderActions.loadOrderSuccess, (state, { order }) => ({ ...state, selectedOrder: order, loading: false })),

  on(OrderActions.cancelOrderSuccess, (state, { order }) => ({
    ...state,
    selectedOrder: order,
    orders: state.orders.map((o) => (o._id === order._id ? order : o)),
    loading: false,
  })),

  on(
    OrderActions.loadOrdersFailure,
    OrderActions.loadOrderFailure,
    OrderActions.cancelOrderFailure,
    (state, { error }) => ({ ...state, loading: false, error }),
  ),

  on(OrderActions.orderStatusUpdated, (state, { orderId, status }) => ({
    ...state,
    orders: state.orders.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o)),
    selectedOrder:
      state.selectedOrder && state.selectedOrder._id === orderId
        ? { ...state.selectedOrder, orderStatus: status }
        : state.selectedOrder,
  })),
);
