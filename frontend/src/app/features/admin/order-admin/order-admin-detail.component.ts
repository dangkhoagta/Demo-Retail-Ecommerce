import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Order, ORDER_STATUSES, ORDER_STATUS_LABELS, OrderStatus } from '../../../core/models/order.model';
import { NotificationService } from '../../../core/services/notification.service';
import { OrderService } from '../../../core/services/order.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-order-admin-detail',
  imports: [RouterLink, FormsModule, DatePipe, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/quan-tri/don-hang" class="back">← Đơn hàng</a>

    @if (order(); as o) {
      <header class="head">
        <div>
          <h1>{{ o.orderNumber }}</h1>
          <p class="muted">Đặt lúc {{ o.orderDate | date: 'HH:mm dd/MM/yyyy' }}</p>
        </div>
        <div class="status-box surface">
          <label>Trạng thái</label>
          <select [(ngModel)]="currentStatus" (ngModelChange)="changeStatus($event)" [disabled]="updating()">
            @for (s of statuses; track s) { <option [ngValue]="s">{{ label(s) }}</option> }
          </select>
        </div>
      </header>

      <div class="grid">
        <section class="surface block">
          <h3>Sản phẩm</h3>
          <table class="items">
            <thead><tr><th>Sản phẩm</th><th>SKU</th><th class="r">Đơn giá</th><th class="r">SL</th><th class="r">Thành tiền</th></tr></thead>
            <tbody>
              @for (item of o.items; track item.id) {
                <tr>
                  <td>{{ item.productName }}</td>
                  <td class="mono">{{ item.sku }}</td>
                  <td class="r">{{ item.unitPrice | vnd }}</td>
                  <td class="r">{{ item.quantity }}</td>
                  <td class="r price">{{ item.lineTotal | vnd }}</td>
                </tr>
              }
            </tbody>
          </table>
          <div class="totals">
            <div class="row"><span>Tạm tính</span><span>{{ o.subtotal | vnd }}</span></div>
            <div class="row"><span>Phí giao hàng</span><span>{{ o.shippingFee === 0 ? 'Miễn phí' : (o.shippingFee | vnd) }}</span></div>
            <div class="row total"><span>Tổng cộng</span><span class="price">{{ o.total | vnd }}</span></div>
          </div>
        </section>

        <aside class="col-side">
          <section class="surface block">
            <h3>Khách hàng</h3>
            <dl>
              <dt>Tên</dt><dd>{{ o.customerName }}</dd>
              <dt>Điện thoại</dt><dd>{{ o.customerPhone }}</dd>
              @if (o.customerEmail) { <dt>Email</dt><dd>{{ o.customerEmail }}</dd> }
              <dt>Loại</dt><dd>{{ o.customerId ? 'Thành viên' : 'Khách vãng lai' }}</dd>
            </dl>
          </section>
          <section class="surface block">
            <h3>Giao hàng</h3>
            <p>{{ fullAddress(o) }}</p>
            @if (o.notes) { <p class="muted note">Ghi chú: {{ o.notes }}</p> }
            <div class="pay">Thanh toán: <strong>COD</strong></div>
          </section>
        </aside>
      </div>
    } @else if (!loading()) {
      <p class="muted">Không tìm thấy đơn hàng.</p>
    }
  `,
  styles: [`
    .back { font-size: .85rem; color: var(--accent); }
    .head { display: flex; justify-content: space-between; align-items: flex-start; margin: 1rem 0 1.75rem; gap: 1rem; flex-wrap: wrap; }
    .status-box { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: .4rem; }
    .status-box label { font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-soft); }
    .status-box select { padding: .5rem .8rem; border: 1px solid var(--line); border-radius: var(--radius); font-family: inherit; background: #fff; }
    .grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start; }
    .col-side { display: flex; flex-direction: column; gap: 1.5rem; }
    .block { padding: 1.5rem; }
    .block h3 { margin-bottom: 1.1rem; }
    .items { width: 100%; border-collapse: collapse; }
    .items th { text-align: left; font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; color: var(--ink-soft); padding: .5rem .4rem; border-bottom: 1px solid var(--line); }
    .items td { padding: .7rem .4rem; border-bottom: 1px solid var(--line); font-size: .9rem; }
    .mono { font-family: ui-monospace, monospace; font-size: .82rem; color: var(--ink-soft); }
    .r { text-align: right; }
    .totals { margin-top: 1rem; margin-left: auto; max-width: 300px; }
    .row { display: flex; justify-content: space-between; padding: .4rem 0; color: var(--ink-soft); }
    .row.total { border-top: 1px solid var(--line); margin-top: .4rem; padding-top: .8rem; color: var(--ink); font-size: 1.05rem; }
    dl { display: grid; grid-template-columns: auto 1fr; gap: .5rem 1rem; margin: 0; }
    dt { color: var(--ink-soft); } dd { margin: 0; }
    .note { margin-top: .5rem; } .pay { margin-top: .75rem; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
  `],
})
export class OrderAdminDetailComponent {
  private readonly orderService = inject(OrderService);
  private readonly notify = inject(NotificationService);

  readonly id = input.required<string>();
  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly updating = signal(false);
  readonly statuses = ORDER_STATUSES;
  currentStatus: OrderStatus = 'Pending';

  constructor() {
    effect(() => {
      const id = Number(this.id());
      if (!id) return;
      this.loading.set(true);
      this.orderService.getById(id).subscribe({
        next: (o) => {
          this.order.set(o);
          this.currentStatus = o.status;
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });
  }

  changeStatus(status: OrderStatus): void {
    const current = this.order();
    if (!current || status === current.status) return;
    this.updating.set(true);
    this.orderService.updateStatus(current.id, status).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.currentStatus = updated.status;
        this.updating.set(false);
        this.notify.success(`Đã cập nhật trạng thái: ${this.label(updated.status)}`);
      },
      error: () => {
        this.currentStatus = current.status;
        this.updating.set(false);
      },
    });
  }

  label(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }

  fullAddress(o: Order): string {
    return [o.shippingAddress, o.shippingWard, o.shippingDistrict, o.shippingCity].filter(Boolean).join(', ');
  }
}
