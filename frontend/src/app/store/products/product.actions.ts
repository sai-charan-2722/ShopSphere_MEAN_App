import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { IProduct, ProductFilters } from '../../shared/models';

export const ProductActions = createActionGroup({
  source: 'Products',
  events: {
    'Load Products': props<{ filters: ProductFilters }>(),
    'Load Products Success': props<{ products: IProduct[]; total: number; page: number }>(),
    'Load Products Failure': props<{ error: string }>(),

    'Load Featured': emptyProps(),
    'Load Featured Success': props<{ products: IProduct[] }>(),
    'Load Featured Failure': props<{ error: string }>(),

    'Load Product': props<{ id: string }>(),
    'Load Product Success': props<{ product: IProduct }>(),
    'Load Product Failure': props<{ error: string }>(),

    'Set Filters': props<{ filters: ProductFilters }>(),
    'Clear Selected': emptyProps(),
  },
});
