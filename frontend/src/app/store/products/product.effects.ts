import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ProductActions } from './product.actions';
import { ProductService } from '../../core/services/product.service';

export const loadProducts$ = createEffect(
  (actions$ = inject(Actions), service = inject(ProductService)) =>
    actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(({ filters }) =>
        service.list(filters).pipe(
          map(({ products, meta }) =>
            ProductActions.loadProductsSuccess({ products, total: meta.total, page: meta.page }),
          ),
          catchError((err) => of(ProductActions.loadProductsFailure({ error: err.message ?? 'Failed to load' }))),
        ),
      ),
    ),
  { functional: true },
);

export const loadFeatured$ = createEffect(
  (actions$ = inject(Actions), service = inject(ProductService)) =>
    actions$.pipe(
      ofType(ProductActions.loadFeatured),
      switchMap(() =>
        service.featured().pipe(
          map((products) => ProductActions.loadFeaturedSuccess({ products })),
          catchError((err) => of(ProductActions.loadFeaturedFailure({ error: err.message ?? 'error' }))),
        ),
      ),
    ),
  { functional: true },
);

export const loadProduct$ = createEffect(
  (actions$ = inject(Actions), service = inject(ProductService)) =>
    actions$.pipe(
      ofType(ProductActions.loadProduct),
      switchMap(({ id }) =>
        service.getById(id).pipe(
          map((product) => ProductActions.loadProductSuccess({ product })),
          catchError((err) => of(ProductActions.loadProductFailure({ error: err.message ?? 'Not found' }))),
        ),
      ),
    ),
  { functional: true },
);
