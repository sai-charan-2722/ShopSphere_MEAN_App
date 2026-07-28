import type { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { sellerGuard } from './core/guards/seller.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list.component').then((m) => m.ProductListComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail.component').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'categories/:slug',
    loadComponent: () => import('./features/products/category.component').then((m) => m.CategoryComponent),
  },
  { path: 'sign-in', loadComponent: () => import('./features/auth/sign-in.component').then((m) => m.SignInComponent) },
  { path: 'sign-up', loadComponent: () => import('./features/auth/sign-up.component').then((m) => m.SignUpComponent) },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent) },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
      },
      {
        path: 'checkout/success',
        loadComponent: () =>
          import('./features/checkout/checkout-success.component').then((m) => m.CheckoutSuccessComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/order-list.component').then((m) => m.OrderListComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/orders/order-detail.component').then((m) => m.OrderDetailComponent),
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./features/profile/wishlist.component').then((m) => m.WishlistComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },

  {
    path: 'seller',
    canActivate: [authGuard, sellerGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/seller/seller-dashboard.component').then((m) => m.SellerDashboardComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/seller/seller-products.component').then((m) => m.SellerProductsComponent),
      },
      {
        path: 'products/new',
        loadComponent: () => import('./features/seller/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./features/seller/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/seller/seller-orders.component').then((m) => m.SellerOrdersComponent),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/seller/seller-analytics.component').then((m) => m.SellerAnalyticsComponent),
      },
    ],
  },

  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/admin-products.component').then((m) => m.AdminProductsComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/admin-orders.component').then((m) => m.AdminOrdersComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/admin-categories.component').then((m) => m.AdminCategoriesComponent),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/admin/admin-analytics.component').then((m) => m.AdminAnalyticsComponent),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
