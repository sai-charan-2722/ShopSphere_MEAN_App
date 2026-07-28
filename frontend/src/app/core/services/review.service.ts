import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, IReview, PaginationMeta } from '../../shared/models';

export interface ReviewCreate {
  productId: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/reviews`;

  forProduct(productId: string, page = 1, limit = 10): Observable<{ reviews: IReview[]; meta: PaginationMeta }> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http
      .get<ApiResponse<IReview[]>>(`${this.base}/product/${productId}`, { params })
      .pipe(map((r) => ({ reviews: r.data ?? [], meta: r.meta as PaginationMeta })));
  }

  create(body: ReviewCreate): Observable<IReview> {
    return this.http.post<ApiResponse<IReview>>(this.base, body).pipe(map((r) => r.data as IReview));
  }

  update(id: string, body: Partial<ReviewCreate>): Observable<IReview> {
    return this.http.put<ApiResponse<IReview>>(`${this.base}/${id}`, body).pipe(map((r) => r.data as IReview));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
