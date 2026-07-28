import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { ProductState } from './product.reducer';

export const selectProductState = createFeatureSelector<ProductState>('products');

export const selectProducts = createSelector(selectProductState, (s) => s.products);
export const selectFeatured = createSelector(selectProductState, (s) => s.featured);
export const selectSelectedProduct = createSelector(selectProductState, (s) => s.selectedProduct);
export const selectProductsLoading = createSelector(selectProductState, (s) => s.loading);
export const selectProductsError = createSelector(selectProductState, (s) => s.error);
export const selectProductsTotal = createSelector(selectProductState, (s) => s.total);
export const selectProductsPage = createSelector(selectProductState, (s) => s.page);
export const selectProductFilters = createSelector(selectProductState, (s) => s.filters);
export const selectTotalPages = createSelector(selectProductState, (s) =>
  Math.max(1, Math.ceil(s.total / (s.filters.limit ?? 12))),
);
