import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, IProduct, PaginationMeta, ProductFilters } from '../../shared/models';

export interface ProductListResult {
  products: IProduct[];
  meta: PaginationMeta;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/products`;

  list(filters: ProductFilters = {}): Observable<ProductListResult> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http
      .get<ApiResponse<IProduct[]>>(this.base, { params })
      .pipe(map((res) => ({ products: res.data ?? [], meta: res.meta as PaginationMeta })));
  }

  featured(): Observable<IProduct[]> {
    return this.http.get<ApiResponse<IProduct[]>>(`${this.base}/featured`).pipe(map((r) => r.data ?? []));
  }

  getById(id: string): Observable<IProduct> {
    return this.http.get<ApiResponse<IProduct>>(`${this.base}/${id}`).pipe(map((r) => r.data as IProduct));
  }

  create(form: FormData): Observable<IProduct> {
    return this.http.post<ApiResponse<IProduct>>(this.base, form).pipe(map((r) => r.data as IProduct));
  }

  update(id: string, body: Partial<IProduct>): Observable<IProduct> {
    return this.http.put<ApiResponse<IProduct>>(`${this.base}/${id}`, body).pipe(map((r) => r.data as IProduct));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`).pipe(map(() => undefined));
  }

  addImages(id: string, form: FormData): Observable<string[]> {
    return this.http
      .post<ApiResponse<string[]>>(`${this.base}/${id}/images`, form)
      .pipe(map((r) => r.data ?? []));
  }

  removeImage(id: string, imageUrl: string): Observable<string[]> {
    return this.http
      .delete<ApiResponse<string[]>>(`${this.base}/${id}/images`, { body: { imageUrl } })
      .pipe(map((r) => r.data ?? []));
  }
}
