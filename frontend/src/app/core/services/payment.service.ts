import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, IOrder, ShippingAddress } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/payment`;

  createCheckoutSession(shippingAddress: ShippingAddress): Observable<{ sessionUrl: string; sessionId: string }> {
    return this.http
      .post<ApiResponse<{ sessionUrl: string; sessionId: string }>>(`${this.base}/create-checkout-session`, {
        shippingAddress,
      })
      .pipe(map((r) => r.data as { sessionUrl: string; sessionId: string }));
  }

  verify(sessionId: string): Observable<IOrder> {
    const params = new HttpParams().set('session_id', sessionId);
    return this.http.get<ApiResponse<IOrder>>(`${this.base}/success`, { params }).pipe(map((r) => r.data as IOrder));
  }
}
