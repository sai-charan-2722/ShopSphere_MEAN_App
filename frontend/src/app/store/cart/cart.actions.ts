import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { CartItem } from '../../shared/models';

export const CartActions = createActionGroup({
  source: 'Cart',
  events: {
    'Load Cart': emptyProps(),
    'Load Cart Success': props<{ items: CartItem[] }>(),
    'Load Cart Failure': props<{ error: string }>(),

    'Add Item': props<{ productId: string; quantity: number }>(),
    'Add Item Success': props<{ items: CartItem[] }>(),
    'Add Item Failure': props<{ error: string }>(),

    'Update Quantity': props<{ productId: string; quantity: number }>(),
    'Update Quantity Success': props<{ items: CartItem[] }>(),
    'Update Quantity Failure': props<{ error: string }>(),

    'Remove Item': props<{ productId: string }>(),
    'Remove Item Success': props<{ items: CartItem[] }>(),
    'Remove Item Failure': props<{ error: string }>(),

    'Clear Cart': emptyProps(),
    'Clear Cart Success': emptyProps(),
    'Clear Cart Failure': props<{ error: string }>(),
  },
});
