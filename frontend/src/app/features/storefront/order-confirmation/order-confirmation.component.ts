import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Order, ORDER_STATUS_LABELS } from '../../../core/models/order.model';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      @if (order(); as o) {
        <div class="hero surface">
          <div class="check">✓</div>
          <h1>Cảm ơn bạn đã đặt hàng!</h1>
          <p class="muted">Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ để xác nhận sớm nhất.</p>
          <div class="order-no">Mã đơn hàng: <strong>{{ o.orderNumber }}</strong></div>
        </div>

        <div class="grid">
          <div class="surface block">
            <h3>Thông tin giao hàng</h3>
            <dl>
              <dt>Người nhận</dt><dd>{{ o.customerName }}</dd>
              <dt>Điện thoại</dt><dd>{{ o.customerPhone }}</dd>
              <dt>Địa chỉ</dt><dd>{{ fullAddress(o) }}</dd>
              <dt>Thanh toán</dt><dd>Khi nhận hàng (COD)</dd>
              <dt>Trạng thái</dt><dd>{{ statusLabel(o) }}</dd>
            </dl>
          </div>

          <div class="surface block">
            <h3>Sản phẩm</h3>
            <div class="items">
              @for (item of o.items; track item.id) {
                <div class="item">
                  <span>{{ item.quantity }}× {{ item.productName }}</span>
                  <span class="price">{{ item.lineTotal | vnd }}</span>
                </div>
              }
            </div>
            <div class="row"><span>Tạm tính</span><span>{{ o.subtotal | vnd }}</span></div>
            <div class="row"><span>Giao hàng</span><span>{{ o.shippingFee === 0 ? 'Miễn phí' : (o.shippingFee | vnd) }}</span></div>
            <div class="row total"><span>Tổng cộng</span><span class="price">{{ o.total | vnd }}</span></div>
          </div>
        </div>

        <div class="actions">
          <a class="btn btn-outline" routerLink="/san-pham">Tiếp tục mua sắm</a>
          @if (auth.isAuthenticated()) {
            <a class="btn btn-dark" routerLink="/don-hang-cua-toi">Xem đơn hàng của tôi</a>
          }
        </div>
      } @else {
        <div class="hero surface">
          <div class="check">✓</div>
          <h1>Đặt hàng thành công!</h1>
          <p class="muted">Cảm ơn bạn. Đơn hàng đã được ghi nhận.</p>
          <a class="btn btn-accent" routerLink="/san-pham">Tiếp tục mua sắm</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding-block: 3rem 4rem; max-width: 900px; }
    .hero { text-align: center; padding: 3rem 2rem; margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center; gap: .75rem; }
    .check { width: 64px; height: 64px; border-radius: 50%; background: var(--success); color: #fff; display: grid; place-items: center; font-size: 2rem; margin-bottom: .5rem; }
    .order-no { margin-top: .5rem; padding: .6rem 1.2rem; background: var(--accent-tint); border-radius: 999px; color: var(--accent-dark); }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .block { padding: 1.75rem; }
    .block h3 { margin-bottom: 1.25rem; }
    dl { display: grid; grid-template-columns: auto 1fr; gap: .6rem 1.25rem; margin: 0; }
    dt { color: var(--ink-soft); } dd { margin: 0; }
    .items { display: flex; flex-direction: column; gap: .6rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--line); }
    .item { display: flex; justify-content: space-between; font-size: .92rem; }
    .row { display: flex; justify-content: space-between; padding: .35rem 0; color: var(--ink-soft); }
    .row.total { border-top: 1px solid var(--line); margin-top: .35rem; padding-top: .8rem; color: var(--ink); }
    .actions { display: flex; gap: 1rem; justify-content: center; }
    @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
  `],
})
export class OrderConfirmationComponent {
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  readonly order = signal<Order | null>(null);

  constructor() {
    const state = this.router.getCurrentNavigation()?.extras.state ?? history.state;
    if (state && state.order) {
      this.order.set(state.order as Order);
    } else if (this.auth.isAuthenticated()) {
      const id = Number(this.router.url.split('/').pop());
      if (id) this.orderService.getById(id).subscribe({ next: (o) => this.order.set(o), error: () => {} });
    }
  }

  fullAddress(o: Order): string {
    return [o.shippingAddress, o.shippingWard, o.shippingDistrict, o.shippingCity].filter(Boolean).join(', ');
  }

  statusLabel(o: Order): string {
    return ORDER_STATUS_LABELS[o.status] ?? o.statusName;
  }
}
