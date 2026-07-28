import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, IOrder, IProduct, OrderStatus, PaginationMeta } from '../../shared/models';

export interface SellerOverview {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  avgRating: number;
}
export interface RevenuePoint {
  period: string;
  revenue: number;
  orders: number;
}
export interface TopProduct {
  productId: string;
  title: string;
  revenue: number;
  unitsSold: number;
}

@Injectable({ providedIn: 'root' })
export class SellerService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/seller`;

  products(page = 1, limit = 12): Observable<{ products: IProduct[]; meta: PaginationMeta }> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http
      .get<ApiResponse<IProduct[]>>(`${this.base}/products`, { params })
      .pipe(map((r) => ({ products: r.data ?? [], meta: r.meta as PaginationMeta })));
  }

  orders(page = 1, limit = 12): Observable<{ orders: IOrder[]; meta: PaginationMeta }> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http
      .get<ApiResponse<IOrder[]>>(`${this.base}/orders`, { params })
      .pipe(map((r) => ({ orders: r.data ?? [], meta: r.meta as PaginationMeta })));
  }

  updateOrderStatus(id: string, status: OrderStatus, note?: string, trackingNumber?: string): Observable<IOrder> {
    return this.http
      .put<ApiResponse<IOrder>>(`${this.base}/orders/${id}/status`, { status, note, trackingNumber })
      .pipe(map((r) => r.data as IOrder));
  }

  overview(): Observable<SellerOverview> {
    return this.http.get<ApiResponse<SellerOverview>>(`${this.base}/analytics/overview`).pipe(map((r) => r.data as SellerOverview));
  }

  revenue(interval: 'daily' | 'weekly' | 'monthly' = 'daily'): Observable<RevenuePoint[]> {
    const params = new HttpParams().set('interval', interval);
    return this.http.get<ApiResponse<RevenuePoint[]>>(`${this.base}/analytics/revenue`, { params }).pipe(map((r) => r.data ?? []));
  }

  topProducts(): Observable<TopProduct[]> {
    return this.http.get<ApiResponse<TopProduct[]>>(`${this.base}/analytics/top-products`).pipe(map((r) => r.data ?? []));
  }

  ordersByStatus(): Observable<Record<string, number>> {
    return this.http
      .get<ApiResponse<Record<string, number>>>(`${this.base}/analytics/orders-by-status`)
      .pipe(map((r) => r.data ?? {}));
  }
}
