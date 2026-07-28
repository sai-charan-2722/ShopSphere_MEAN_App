import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse, ICategory } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/categories`;

  list(): Observable<ICategory[]> {
    return this.http.get<ApiResponse<ICategory[]>>(this.base).pipe(map((r) => r.data ?? []));
  }

  getBySlug(slug: string): Observable<ICategory> {
    return this.http.get<ApiResponse<ICategory>>(`${this.base}/${slug}`).pipe(map((r) => r.data as ICategory));
  }

  create(body: FormData | Partial<ICategory>): Observable<ICategory> {
    return this.http.post<ApiResponse<ICategory>>(this.base, body).pipe(map((r) => r.data as ICategory));
  }

  update(id: string, body: FormData | Partial<ICategory>): Observable<ICategory> {
    return this.http.put<ApiResponse<ICategory>>(`${this.base}/${id}`, body).pipe(map((r) => r.data as ICategory));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
