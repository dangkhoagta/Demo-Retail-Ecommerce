import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import { Brand, BrandInput } from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/brands`;

  getAll(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.base);
  }

  getById(id: number): Observable<Brand> {
    return this.http.get<Brand>(`${this.base}/${id}`);
  }

  create(input: BrandInput): Observable<Brand> {
    return this.http.post<Brand>(this.base, input);
  }

  update(id: number, input: BrandInput): Observable<Brand> {
    return this.http.put<Brand>(`${this.base}/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
