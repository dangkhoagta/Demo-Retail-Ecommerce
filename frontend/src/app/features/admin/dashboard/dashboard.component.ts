import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderListItem, ORDER_STATUS_LABELS, OrderStatus } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { UserService } from '../../../core/services/user.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DatePipe, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="head">
      <div>
        <h1>Tổng quan</h1>
        <p class="muted">Xin chào, đây là tình hình cửa hàng của bạn.</p>
      </div>
    </header>

    <div class="tiles">
      <div class="tile surface">
        <span class="tile-label">Sản phẩm</span>
        <span class="tile-value">{{ productCount() }}</span>
        <a routerLink="/quan-tri/san-pham" class="tile-link">Quản lý →</a>
      </div>
      <div class="tile surface">
        <span class="tile-label">Đơn hàng</span>
        <span class="tile-value">{{ orderCount() }}</span>
        <a routerLink="/quan-tri/don-hang" class="tile-link">Xem tất cả →</a>
      </div>
      <div class="tile surface">
        <span class="tile-label">Chờ xử lý</span>
        <span class="tile-value">{{ pendingCount() }}</span>
        <a routerLink="/quan-tri/don-hang" class="tile-link">Xử lý ngay →</a>
      </div>
      <div class="tile surface">
        <span class="tile-label">Người dùng</span>
        <span class="tile-value">{{ userCount() }}</span>
        <a routerLink="/quan-tri/nguoi-dung" class="tile-link">Quản lý →</a>
      </div>
    </div>

    <section class="recent surface">
      <div class="recent-head">
        <h3>Đơn hàng gần đây</h3>
        <a routerLink="/quan-tri/don-hang" class="btn btn-ghost btn-sm">Tất cả</a>
      </div>
      @if (recent().length) {
        <table class="tbl">
          <thead>
            <tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày</th><th>Trạng thái</th><th class="r">Tổng</th></tr>
          </thead>
          <tbody>
            @for (o of recent(); track o.id) {
              <tr [routerLink]="['/quan-tri/don-hang', o.id]" class="row">
                <td><strong>{{ o.orderNumber }}</strong></td>
                <td>{{ o.customerName }}</td>
                <td>{{ o.orderDate | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td><span class="status" [class]="'st-' + o.status.toLowerCase()">{{ label(o.status) }}</span></td>
                <td class="r price">{{ o.total | vnd }}</td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <p class="muted">Chưa có đơn hàng.</p>
      }
    </section>
  `,
  styles: [`
    .head { margin-bottom: 1.75rem; }
    .tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
    .tile { padding: 1.5rem; display: flex; flex-direction: column; gap: .35rem; }
    .tile-label { font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-soft); }
    .tile-value { font-family: var(--font-display); font-size: 2.4rem; line-height: 1; }
    .tile-link { font-size: .82rem; color: var(--accent); margin-top: .35rem; }
    .recent { padding: 1.5rem; }
    .recent-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .tbl { width: 100%; border-collapse: collapse; }
    .tbl th { text-align: left; font-size: .74rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-soft); padding: .6rem .5rem; border-bottom: 1px solid var(--line); }
    .tbl td { padding: .85rem .5rem; border-bottom: 1px solid var(--line); font-size: .92rem; }
    .row { cursor: pointer; }
    .row:hover td { background: var(--cream-deep); }
    .r { text-align: right; }
    .status { padding: .2rem .6rem; border-radius: 999px; font-size: .74rem; background: var(--accent-tint); color: var(--accent-dark); }
    .st-cancelled { background: #f6dede; color: var(--sale); }
    .st-delivered { background: #dcecdf; color: var(--success); }
    @media (max-width: 900px) { .tiles { grid-template-columns: repeat(2,1fr); } }
  `],
})
export class DashboardComponent {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly userService = inject(UserService);

  readonly productCount = signal(0);
  readonly orderCount = signal(0);
  readonly pendingCount = signal(0);
  readonly userCount = signal(0);
  readonly recent = signal<OrderListItem[]>([]);

  constructor() {
    this.productService.getPaged({ page: 1, pageSize: 1 }).subscribe((p) => this.productCount.set(p.totalCount));
    this.userService.getPaged({ page: 1, pageSize: 1 }).subscribe((p) => this.userCount.set(p.totalCount));
    this.orderService.getPaged({ page: 1, pageSize: 5 }).subscribe((p) => {
      this.orderCount.set(p.totalCount);
      this.recent.set(p.items);
    });
    this.orderService.getPaged({ page: 1, pageSize: 1, status: 'Pending' }).subscribe((p) =>
      this.pendingCount.set(p.totalCount),
    );
  }

  label(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }
}
