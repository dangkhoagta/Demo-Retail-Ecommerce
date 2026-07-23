import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import { AdminUser } from '../models/auth.model';
import { PagedResult } from '../models/pagination.model';
import { toHttpParams } from '../utils/http-params';

export interface UserQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/users`;

  getPaged(query: UserQuery): Observable<PagedResult<AdminUser>> {
    return this.http.get<PagedResult<AdminUser>>(this.base, {
      params: toHttpParams(query as Record<string, unknown>),
    });
  }

  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/roles`);
  }

  getById(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.base}/${id}`);
  }

  updateRoles(id: string, roles: string[]): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.base}/${id}/roles`, { roles });
  }

  setLockout(id: string, locked: boolean): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/lockout`, { locked });
  }
}
