import { createActionGroup, props } from '@ngrx/store';
import type { IOrder, OrderStatus } from '../../shared/models';

export const OrderActions = createActionGroup({
  source: 'Orders',
  events: {
    'Load Orders': props<{ page: number }>(),
    'Load Orders Success': props<{ orders: IOrder[]; total: number; page: number }>(),
    'Load Orders Failure': props<{ error: string }>(),

    'Load Order': props<{ id: string }>(),
    'Load Order Success': props<{ order: IOrder }>(),
    'Load Order Failure': props<{ error: string }>(),

    'Cancel Order': props<{ id: string }>(),
    'Cancel Order Success': props<{ order: IOrder }>(),
    'Cancel Order Failure': props<{ error: string }>(),

    // Pushed from Socket.io in real time
    'Order Status Updated': props<{ orderId: string; status: OrderStatus }>(),
  },
});
