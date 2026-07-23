import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import {
  OrderListItem, ORDER_STATUSES, ORDER_STATUS_LABELS, OrderStatus,
} from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-order-admin-list',
  imports: [RouterLink, FormsModule, MatPaginatorModule, DatePipe, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="head"><h1>Đơn hàng</h1><p class="muted">{{ total() }} đơn</p></header>

    <div class="toolbar surface">
      <input type="text" placeholder="Tìm mã đơn / tên / SĐT…" [(ngModel)]="search" (keyup.enter)="applyFilters()" />
      <select [(ngModel)]="status" (ngModelChange)="applyFilters()">
        <option [ngValue]="null">Tất cả trạng thái</option>
        @for (s of statuses; track s) { <option [ngValue]="s">{{ label(s) }}</option> }
      </select>
      <button class="btn btn-dark btn-sm" (click)="applyFilters()">Lọc</button>
    </div>

    <div class="surface tbl-wrap">
      @if (loading()) {
        <div class="full-bleed-loading"><span class="muted">Đang tải…</span></div>
      } @else {
        <table class="tbl">
          <thead>
            <tr><th>Mã đơn</th><th>Khách hàng</th><th>SĐT</th><th>Ngày</th><th>SP</th><th>Trạng thái</th><th class="r">Tổng</th></tr>
          </thead>
          <tbody>
            @for (o of orders(); track o.id) {
              <tr class="row" [routerLink]="['/quan-tri/don-hang', o.id]">
                <td><strong>{{ o.orderNumber }}</strong></td>
                <td>{{ o.customerName }}</td>
                <td class="mono">{{ o.customerPhone }}</td>
                <td>{{ o.orderDate | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ o.itemCount }}</td>
                <td><span class="status" [class]="'st-' + o.status.toLowerCase()">{{ label(o.status) }}</span></td>
                <td class="r price">{{ o.total | vnd }}</td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="empty muted">Không có đơn hàng.</td></tr>
            }
          </tbody>
        </table>
        <mat-paginator [length]="total()" [pageSize]="pageSize" [pageIndex]="page() - 1"
                       [pageSizeOptions]="[10, 20, 50]" (page)="onPage($event)" />
      }
    </div>
  `,
  styles: [`
    .head { margin-bottom: 1.5rem; }
    .toolbar { display: flex; gap: .5rem; padding: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .toolbar input { flex: 1; min-width: 200px; padding: .6rem .8rem; border: 1px solid var(--line); border-radius: var(--radius); font-family: inherit; }
    .toolbar select { padding: .6rem .8rem; border: 1px solid var(--line); border-radius: var(--radius); font-family: inherit; background: #fff; }
    .tbl-wrap { padding: .5rem 1rem 1rem; overflow-x: auto; }
    .tbl { width: 100%; border-collapse: collapse; min-width: 760px; }
    .tbl th { text-align: left; font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-soft); padding: .75rem .5rem; border-bottom: 1px solid var(--line); }
    .tbl td { padding: .8rem .5rem; border-bottom: 1px solid var(--line); font-size: .9rem; }
    .row { cursor: pointer; }
    .row:hover td { background: var(--cream-deep); }
    .mono { font-family: ui-monospace, monospace; font-size: .84rem; }
    .r { text-align: right; }
    .status { padding: .2rem .6rem; border-radius: 999px; font-size: .74rem; background: var(--accent-tint); color: var(--accent-dark); white-space: nowrap; }
    .st-cancelled { background: #f6dede; color: var(--sale); }
    .st-delivered { background: #dcecdf; color: var(--success); }
    .empty { text-align: center; padding: 2rem; }
  `],
})
export class OrderAdminListComponent {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<OrderListItem[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly pageSize = 20;
  readonly statuses = ORDER_STATUSES;

  search = '';
  status: OrderStatus | null = null;

  constructor() {
    this.load();
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  onPage(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.load();
  }

  label(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }

  private load(): void {
    this.loading.set(true);
    this.orderService
      .getPaged({
        page: this.page(),
        pageSize: this.pageSize,
        search: this.search || undefined,
        status: this.status ?? undefined,
      })
      .subscribe({
        next: (result) => {
          this.orders.set(result.items);
          this.total.set(result.totalCount);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
