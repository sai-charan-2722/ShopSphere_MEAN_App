import { createReducer, on } from '@ngrx/store';
import { ProductActions } from './product.actions';
import type { IProduct, ProductFilters } from '../../shared/models';

export interface ProductState {
  products: IProduct[];
  featured: IProduct[];
  selectedProduct: IProduct | null;
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
}

export const initialProductState: ProductState = {
  products: [],
  featured: [],
  selectedProduct: null,
  total: 0,
  page: 1,
  loading: false,
  error: null,
  filters: { page: 1, limit: 12 },
};

export const productReducer = createReducer(
  initialProductState,

  on(ProductActions.loadProducts, (state, { filters }) => ({ ...state, loading: true, error: null, filters })),
  on(ProductActions.loadProductsSuccess, (state, { products, total, page }) => ({
    ...state,
    products,
    total,
    page,
    loading: false,
  })),
  on(ProductActions.loadProductsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProductActions.loadFeaturedSuccess, (state, { products }) => ({ ...state, featured: products })),

  on(ProductActions.loadProduct, (state) => ({ ...state, loading: true, error: null, selectedProduct: null })),
  on(ProductActions.loadProductSuccess, (state, { product }) => ({ ...state, selectedProduct: product, loading: false })),
  on(ProductActions.loadProductFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProductActions.setFilters, (state, { filters }) => ({ ...state, filters: { ...state.filters, ...filters } })),
  on(ProductActions.clearSelected, (state) => ({ ...state, selectedProduct: null })),
);
