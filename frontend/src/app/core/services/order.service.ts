import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, IOrder, OrderStatus, PaginationMeta } from '../../shared/models';

export interface OrderListResult {
  orders: IOrder[];
  meta: PaginationMeta;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/orders`;

  private listAt(url: string, page: number, limit: number, extra: Record<string, string> = {}): Observable<OrderListResult> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    for (const [k, v] of Object.entries(extra)) params = params.set(k, v);
    return this.http
      .get<ApiResponse<IOrder[]>>(url, { params })
      .pipe(map((r) => ({ orders: r.data ?? [], meta: r.meta as PaginationMeta })));
  }

  myOrders(page = 1, limit = 12): Observable<OrderListResult> {
    return this.listAt(this.base, page, limit);
  }

  getById(id: string): Observable<IOrder> {
    return this.http.get<ApiResponse<IOrder>>(`${this.base}/${id}`).pipe(map((r) => r.data as IOrder));
  }

  cancel(id: string): Observable<IOrder> {
    return this.http.put<ApiResponse<IOrder>>(`${this.base}/${id}/cancel`, {}).pipe(map((r) => r.data as IOrder));
  }

  // Admin
  adminAll(page = 1, limit = 12, filters: Record<string, string> = {}): Observable<OrderListResult> {
    return this.listAt(`${this.base}/admin/all`, page, limit, filters);
  }

  adminUpdateStatus(id: string, status: OrderStatus, note?: string, trackingNumber?: string): Observable<IOrder> {
    return this.http
      .put<ApiResponse<IOrder>>(`${this.base}/admin/${id}/status`, { status, note, trackingNumber })
      .pipe(map((r) => r.data as IOrder));
  }
}
