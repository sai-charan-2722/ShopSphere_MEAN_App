import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, ICart } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cart`;

  get(): Observable<ICart> {
    return this.http.get<ApiResponse<ICart>>(this.base).pipe(map((r) => r.data as ICart));
  }

  add(productId: string, quantity: number): Observable<ICart> {
    return this.http
      .post<ApiResponse<ICart>>(`${this.base}/add`, { productId, quantity })
      .pipe(map((r) => r.data as ICart));
  }

  updateItem(productId: string, quantity: number): Observable<ICart> {
    return this.http
      .put<ApiResponse<ICart>>(`${this.base}/item/${productId}`, { quantity })
      .pipe(map((r) => r.data as ICart));
  }

  removeItem(productId: string): Observable<ICart> {
    return this.http.delete<ApiResponse<ICart>>(`${this.base}/item/${productId}`).pipe(map((r) => r.data as ICart));
  }

  clear(): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/clear`).pipe(map(() => undefined));
  }
}
