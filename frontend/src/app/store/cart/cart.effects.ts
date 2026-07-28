import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, catchError, map, mergeMap, of } from 'rxjs';
import { CartActions } from './cart.actions';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

export const loadCart$ = createEffect(
  (actions$ = inject(Actions), cartService = inject(CartService)) =>
    actions$.pipe(
      ofType(CartActions.loadCart),
      mergeMap(() =>
        cartService.get().pipe(
          map((cart) => CartActions.loadCartSuccess({ items: cart.items ?? [] })),
          catchError((err) => of(CartActions.loadCartFailure({ error: err.message ?? 'Failed to load cart' }))),
        ),
      ),
    ),
  { functional: true },
);

export const addItem$ = createEffect(
  (actions$ = inject(Actions), cartService = inject(CartService), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(CartActions.addItem),
      mergeMap(({ productId, quantity }) =>
        cartService.add(productId, quantity).pipe(
          map((cart) => {
            toast.success('Added to cart');
            return CartActions.addItemSuccess({ items: cart.items ?? [] });
          }),
          catchError((err) => {
            toast.error(err.error?.message ?? 'Could not add to cart');
            return of(CartActions.addItemFailure({ error: err.message ?? 'error' }));
          }),
        ),
      ),
    ),
  { functional: true },
);

export const updateQuantity$ = createEffect(
  (actions$ = inject(Actions), cartService = inject(CartService)) =>
    actions$.pipe(
      ofType(CartActions.updateQuantity),
      mergeMap(({ productId, quantity }) =>
        cartService.updateItem(productId, quantity).pipe(
          map((cart) => CartActions.updateQuantitySuccess({ items: cart.items ?? [] })),
          catchError((err) => of(CartActions.updateQuantityFailure({ error: err.message ?? 'error' }))),
        ),
      ),
    ),
  { functional: true },
);

export const removeItem$ = createEffect(
  (actions$ = inject(Actions), cartService = inject(CartService)) =>
    actions$.pipe(
      ofType(CartActions.removeItem),
      mergeMap(({ productId }) =>
        cartService.removeItem(productId).pipe(
          map((cart) => CartActions.removeItemSuccess({ items: cart.items ?? [] })),
          catchError((err) => of(CartActions.removeItemFailure({ error: err.message ?? 'error' }))),
        ),
      ),
    ),
  { functional: true },
);

export const clearCart$ = createEffect(
  (actions$ = inject(Actions), cartService = inject(CartService)) =>
    actions$.pipe(
      ofType(CartActions.clearCart),
      mergeMap(() =>
        cartService.clear().pipe(
          map(() => CartActions.clearCartSuccess()),
          catchError((err) => of(CartActions.clearCartFailure({ error: err.message ?? 'error' }))),
        ),
      ),
    ),
  { functional: true },
);

// Effect that intentionally swallows to satisfy "return EMPTY" pattern where needed.
export const noopCartEffect$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(CartActions.clearCartFailure),
      mergeMap(() => EMPTY),
    ),
  { functional: true, dispatch: false },
);
