import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import { CreateOrder, Order, OrderListItem, OrderQuery, OrderStatus } from '../models/order.model';
import { PagedResult } from '../models/pagination.model';
import { toHttpParams } from '../utils/http-params';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/orders`;

  checkout(order: CreateOrder): Observable<Order> {
    return this.http.post<Order>(this.base, order);
  }

  getPaged(query: OrderQuery): Observable<PagedResult<OrderListItem>> {
    return this.http.get<PagedResult<OrderListItem>>(this.base, {
      params: toHttpParams(query as Record<string, unknown>),
    });
  }

  getMy(query: OrderQuery): Observable<PagedResult<OrderListItem>> {
    return this.http.get<PagedResult<OrderListItem>>(`${this.base}/my`, {
      params: toHttpParams(query as Record<string, unknown>),
    });
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.put<Order>(`${this.base}/${id}/status`, { status });
  }
}
