import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterLink } from '@angular/router';
import { Order, ORDER_STATUS_LABELS, OrderListItem, OrderStatus } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-my-orders',
  imports: [RouterLink, MatExpansionModule, DatePipe, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <p class="eyebrow">Tài khoản</p>
      <h1>Đơn hàng của tôi</h1>

      @if (loading()) {
        <div class="full-bleed-loading"><span class="muted">Đang tải…</span></div>
      } @else if (orders().length === 0) {
        <div class="empty surface">
          <p>Bạn chưa có đơn hàng nào.</p>
          <a class="btn btn-accent" routerLink="/san-pham">Mua sắm ngay</a>
        </div>
      } @else {
        <mat-accordion class="list">
          @for (order of orders(); track order.id) {
            <mat-expansion-panel (opened)="loadDetail(order.id)">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <strong>{{ order.orderNumber }}</strong>
                </mat-panel-title>
                <mat-panel-description class="head-desc">
                  <span class="status" [class]="'st-' + order.status.toLowerCase()">{{ label(order.status) }}</span>
                  <span>{{ order.orderDate | date: 'dd/MM/yyyy' }}</span>
                  <span class="price">{{ order.total | vnd }}</span>
                </mat-panel-description>
              </mat-expansion-panel-header>

              @if (details()[order.id]; as d) {
                <div class="detail">
                  @for (item of d.items; track item.id) {
                    <div class="d-item">
                      <span>{{ item.quantity }}× {{ item.productName }}</span>
                      <span class="price">{{ item.lineTotal | vnd }}</span>
                    </div>
                  }
                  <div class="d-row"><span>Giao đến</span><span>{{ d.shippingAddress }}, {{ d.shippingCity }}</span></div>
                  <div class="d-row"><span>Thanh toán</span><span>COD</span></div>
                  <div class="d-row total"><span>Tổng cộng</span><span class="price">{{ d.total | vnd }}</span></div>
                </div>
              } @else {
                <p class="muted">Đang tải chi tiết…</p>
              }
            </mat-expansion-panel>
          }
        </mat-accordion>
      }
    </div>
  `,
  styles: [`
    .page { padding-block: 2.5rem 4rem; max-width: 860px; }
    h1 { margin-bottom: 2rem; }
    .empty { padding: 3.5rem; text-align: center; display: flex; flex-direction: column; gap: 1.25rem; align-items: center; }
    .list { display: block; }
    .head-desc { display: flex; gap: 1.5rem; align-items: center; justify-content: flex-end; }
    .status { padding: .2rem .7rem; border-radius: 999px; font-size: .78rem; font-weight: 500; background: var(--accent-tint); color: var(--accent-dark); }
    .st-cancelled { background: #f6dede; color: var(--sale); }
    .st-delivered { background: #dcecdf; color: var(--success); }
    .detail { padding: .5rem 0 .5rem; display: flex; flex-direction: column; gap: .5rem; }
    .d-item { display: flex; justify-content: space-between; font-size: .92rem; }
    .d-row { display: flex; justify-content: space-between; color: var(--ink-soft); border-top: 1px solid var(--line); padding-top: .5rem; }
    .d-row.total { color: var(--ink); font-weight: 500; }
  `],
})
export class MyOrdersComponent {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<OrderListItem[]>([]);
  readonly details = signal<Record<number, Order>>({});
  readonly loading = signal(true);

  constructor() {
    this.orderService.getMy({ pageSize: 50, sortBy: 'date', sortDescending: false }).subscribe({
      next: (page) => {
        this.orders.set(page.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadDetail(id: number): void {
    if (this.details()[id]) return;
    this.orderService.getById(id).subscribe((order) =>
      this.details.update((map) => ({ ...map, [id]: order })),
    );
  }

  label(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }
}
