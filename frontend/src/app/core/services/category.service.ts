import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import { Category, CategoryInput } from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/categories`;

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.base);
  }

  getTree(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/tree`);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.base}/${id}`);
  }

  create(input: CategoryInput): Observable<Category> {
    return this.http.post<Category>(this.base, input);
  }

  update(id: number, input: CategoryInput): Observable<Category> {
    return this.http.put<Category>(`${this.base}/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
