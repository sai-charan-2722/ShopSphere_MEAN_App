import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { OrderActions } from './order.actions';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';

export const loadOrders$ = createEffect(
  (actions$ = inject(Actions), service = inject(OrderService)) =>
    actions$.pipe(
      ofType(OrderActions.loadOrders),
      switchMap(({ page }) =>
        service.myOrders(page).pipe(
          map(({ orders, meta }) => OrderActions.loadOrdersSuccess({ orders, total: meta.total, page: meta.page })),
          catchError((err) => of(OrderActions.loadOrdersFailure({ error: err.message ?? 'Failed to load orders' }))),
        ),
      ),
    ),
  { functional: true },
);

export const loadOrder$ = createEffect(
  (actions$ = inject(Actions), service = inject(OrderService)) =>
    actions$.pipe(
      ofType(OrderActions.loadOrder),
      switchMap(({ id }) =>
        service.getById(id).pipe(
          map((order) => OrderActions.loadOrderSuccess({ order })),
          catchError((err) => of(OrderActions.loadOrderFailure({ error: err.message ?? 'Order not found' }))),
        ),
      ),
    ),
  { functional: true },
);

export const cancelOrder$ = createEffect(
  (actions$ = inject(Actions), service = inject(OrderService), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(OrderActions.cancelOrder),
      switchMap(({ id }) =>
        service.cancel(id).pipe(
          map((order) => {
            toast.success('Order cancelled');
            return OrderActions.cancelOrderSuccess({ order });
          }),
          catchError((err) => {
            toast.error(err.error?.message ?? 'Could not cancel order');
            return of(OrderActions.cancelOrderFailure({ error: err.message ?? 'error' }));
          }),
        ),
      ),
    ),
  { functional: true },
);
