import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Address, ApiResponse, IProduct, IUser } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  getProfile(): Observable<IUser> {
    return this.http.get<ApiResponse<IUser>>(`${this.base}/profile`).pipe(map((r) => r.data as IUser));
  }

  updateProfile(body: { name?: string; avatar?: string; address?: Address }): Observable<IUser> {
    return this.http.put<ApiResponse<IUser>>(`${this.base}/profile`, body).pipe(map((r) => r.data as IUser));
  }

  getWishlist(): Observable<IProduct[]> {
    return this.http.get<ApiResponse<IProduct[]>>(`${this.base}/wishlist`).pipe(map((r) => r.data ?? []));
  }

  addToWishlist(productId: string): Observable<void> {
    return this.http.post<ApiResponse<null>>(`${this.base}/wishlist/${productId}`, {}).pipe(map(() => undefined));
  }

  removeFromWishlist(productId: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/wishlist/${productId}`).pipe(map(() => undefined));
  }

  syncMe(): Observable<IUser> {
    return this.http.post<ApiResponse<IUser>>(`${environment.apiUrl}/auth/sync`, {}).pipe(map((r) => r.data as IUser));
  }

  me(): Observable<IUser> {
    return this.http.get<ApiResponse<IUser>>(`${environment.apiUrl}/auth/me`).pipe(map((r) => r.data as IUser));
  }
}
