import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, IProduct, IUser, PaginationMeta, Role } from '../../shared/models';
import type { RevenuePoint } from './seller.service';

export interface AdminOverview {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalSellers: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  users(page = 1, limit = 12, search = ''): Observable<{ users: IUser[]; meta: PaginationMeta }> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    if (search) params = params.set('search', search);
    return this.http
      .get<ApiResponse<IUser[]>>(`${this.base}/users`, { params })
      .pipe(map((r) => ({ users: r.data ?? [], meta: r.meta as PaginationMeta })));
  }

  changeRole(id: string, role: Role): Observable<IUser> {
    return this.http.put<ApiResponse<IUser>>(`${this.base}/users/${id}/role`, { role }).pipe(map((r) => r.data as IUser));
  }

  changeStatus(id: string, isActive: boolean): Observable<IUser> {
    return this.http
      .put<ApiResponse<IUser>>(`${this.base}/users/${id}/status`, { isActive })
      .pipe(map((r) => r.data as IUser));
  }

  overview(): Observable<AdminOverview> {
    return this.http.get<ApiResponse<AdminOverview>>(`${this.base}/analytics/overview`).pipe(map((r) => r.data as AdminOverview));
  }

  revenue(interval: 'daily' | 'weekly' | 'monthly' = 'daily'): Observable<{ revenue: RevenuePoint[]; userGrowth: { period: string; users: number }[] }> {
    const params = new HttpParams().set('interval', interval);
    return this.http
      .get<ApiResponse<{ revenue: RevenuePoint[]; userGrowth: { period: string; users: number }[] }>>(
        `${this.base}/analytics/revenue`,
        { params },
      )
      .pipe(map((r) => r.data ?? { revenue: [], userGrowth: [] }));
  }

  products(page = 1, limit = 12, search = ''): Observable<{ products: IProduct[]; meta: PaginationMeta }> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    if (search) params = params.set('search', search);
    return this.http
      .get<ApiResponse<IProduct[]>>(`${this.base}/products`, { params })
      .pipe(map((r) => ({ products: r.data ?? [], meta: r.meta as PaginationMeta })));
  }

  toggleFeatured(id: string): Observable<IProduct> {
    return this.http.put<ApiResponse<IProduct>>(`${this.base}/products/${id}/featured`, {}).pipe(map((r) => r.data as IProduct));
  }
}
