import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import {
  Product,
  ProductCreateInput,
  ProductListItem,
  ProductQuery,
  ProductUpdateInput,
} from '../models/catalog.model';
import { PagedResult } from '../models/pagination.model';
import { toHttpParams } from '../utils/http-params';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/products`;

  getPaged(query: ProductQuery): Observable<PagedResult<ProductListItem>> {
    return this.http.get<PagedResult<ProductListItem>>(this.base, {
      params: toHttpParams(query as Record<string, unknown>),
    });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  getBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/slug/${slug}`);
  }

  create(input: ProductCreateInput): Observable<Product> {
    return this.http.post<Product>(this.base, input);
  }

  update(id: number, input: ProductUpdateInput): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
