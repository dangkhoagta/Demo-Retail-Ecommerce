import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { CreateOrder } from '../../../core/models/order.model';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OrderService } from '../../../core/services/order.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, RouterLink, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <p class="eyebrow">Thanh toán</p>
      <h1>Hoàn tất đơn hàng</h1>

      @if (cart.isEmpty()) {
        <div class="empty surface">
          <p>Giỏ hàng trống, không thể thanh toán.</p>
          <a class="btn btn-accent" routerLink="/san-pham">Mua sắm ngay</a>
        </div>
      } @else {
        <form class="layout" [formGroup]="form" (ngSubmit)="submit()">
          <section class="form-col">
            <div class="surface block">
              <h3>Thông tin giao hàng</h3>
              <div class="field-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Họ và tên</mat-label>
                  <input matInput formControlName="customerName" />
                  @if (invalid('customerName')) { <mat-error>Vui lòng nhập họ tên.</mat-error> }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Số điện thoại</mat-label>
                  <input matInput formControlName="customerPhone" />
                  @if (invalid('customerPhone')) { <mat-error>Số điện thoại không hợp lệ.</mat-error> }
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline">
                <mat-label>Email (không bắt buộc)</mat-label>
                <input matInput type="email" formControlName="customerEmail" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Địa chỉ</mat-label>
                <input matInput formControlName="shippingAddress" placeholder="Số nhà, tên đường" />
                @if (invalid('shippingAddress')) { <mat-error>Vui lòng nhập địa chỉ.</mat-error> }
              </mat-form-field>
              <div class="field-grid three">
                <mat-form-field appearance="outline">
                  <mat-label>Tỉnh / Thành phố</mat-label>
                  <input matInput formControlName="shippingCity" />
                  @if (invalid('shippingCity')) { <mat-error>Bắt buộc.</mat-error> }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Quận / Huyện</mat-label>
                  <input matInput formControlName="shippingDistrict" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Phường / Xã</mat-label>
                  <input matInput formControlName="shippingWard" />
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline">
                <mat-label>Ghi chú (không bắt buộc)</mat-label>
                <textarea matInput rows="3" formControlName="notes"></textarea>
              </mat-form-field>
            </div>

            <div class="surface block">
              <h3>Phương thức thanh toán</h3>
              <div class="pay-method selected">
                <span class="dot"></span>
                <div>
                  <strong>Thanh toán khi nhận hàng (COD)</strong>
                  <p class="muted">Bạn thanh toán bằng tiền mặt khi nhận được hàng.</p>
                </div>
              </div>
            </div>
          </section>

          <aside class="summary surface">
            <h3>Đơn hàng</h3>
            <div class="items">
              @for (item of cart.items(); track item.variantId) {
                <div class="s-item">
                  <span class="s-qty">{{ item.quantity }}×</span>
                  <span class="s-name">{{ item.productName }}<br /><em class="muted">{{ item.variantName }}</em></span>
                  <span class="price">{{ item.price * item.quantity | vnd }}</span>
                </div>
              }
            </div>
            <div class="row"><span>Tạm tính</span><span>{{ cart.subtotal() | vnd }}</span></div>
            <div class="row"><span>Giao hàng</span><span>{{ cart.shippingFee() === 0 ? 'Miễn phí' : (cart.shippingFee() | vnd) }}</span></div>
            <div class="row total"><span>Tổng cộng</span><span class="price">{{ cart.total() | vnd }}</span></div>
            <button type="submit" class="btn btn-accent btn-block" [disabled]="submitting()">
              {{ submitting() ? 'Đang xử lý…' : 'Đặt hàng' }}
            </button>
          </aside>
        </form>
      }
    </div>
  `,
  styles: [`
    .page { padding-block: 2.5rem 4rem; }
    h1 { margin-bottom: 2rem; }
    .empty { padding: 3.5rem; text-align: center; display: flex; flex-direction: column; gap: 1.25rem; align-items: center; }
    .layout { display: grid; grid-template-columns: 1fr 360px; gap: 2rem; align-items: start; }
    .form-col { display: flex; flex-direction: column; gap: 1.5rem; }
    .block { padding: 1.75rem; }
    .block h3 { margin-bottom: 1.25rem; }
    .field-grid.three { grid-template-columns: repeat(3, 1fr); }
    .pay-method { display: flex; gap: .9rem; padding: 1.1rem; border: 1px solid var(--accent); border-radius: var(--radius); background: var(--accent-tint); }
    .pay-method .dot { width: 16px; height: 16px; border-radius: 50%; border: 4px solid var(--accent); margin-top: 3px; flex: none; }
    .pay-method p { margin: .25rem 0 0; font-size: .88rem; }
    .summary { position: sticky; top: 96px; padding: 1.75rem; display: flex; flex-direction: column; gap: .4rem; }
    .summary h3 { margin-bottom: 1rem; }
    .items { display: flex; flex-direction: column; gap: .75rem; max-height: 320px; overflow-y: auto; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--line); }
    .s-item { display: grid; grid-template-columns: auto 1fr auto; gap: .6rem; align-items: start; font-size: .9rem; }
    .s-qty { color: var(--ink-soft); }
    .s-name em { font-style: normal; font-size: .8rem; }
    .row { display: flex; justify-content: space-between; padding: .4rem 0; color: var(--ink-soft); }
    .row.total { border-top: 1px solid var(--line); margin-top: .4rem; padding-top: .9rem; color: var(--ink); font-size: 1.05rem; }
    .row.total .price { font-size: 1.25rem; }
    .summary .btn { margin-top: 1rem; }
    @media (max-width: 880px) { .layout { grid-template-columns: 1fr; } .field-grid.three { grid-template-columns: 1fr; } }
  `],
})
export class CheckoutComponent {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly cart = inject(CartService);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.maxLength(150)]],
    customerPhone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{8,20}$/)]],
    customerEmail: ['', [Validators.email]],
    shippingAddress: ['', [Validators.required, Validators.maxLength(300)]],
    shippingCity: ['', [Validators.required, Validators.maxLength(100)]],
    shippingDistrict: [''],
    shippingWard: [''],
    notes: [''],
  });

  constructor() {
    const user = this.auth.user();
    if (user) {
      this.form.patchValue({ customerName: user.fullName, customerEmail: user.email ?? '' });
      if (user.phoneNumber) this.form.patchValue({ customerPhone: user.phoneNumber });
    }
  }

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.cart.isEmpty()) return;

    const value = this.form.getRawValue();
    const order: CreateOrder = {
      ...value,
      items: this.cart.items().map((i) => ({ productVariantId: i.variantId, quantity: i.quantity })),
    };

    this.submitting.set(true);
    this.orderService.checkout(order).subscribe({
      next: (created) => {
        this.cart.clear();
        this.notify.success(`Đặt hàng thành công! Mã đơn: ${created.orderNumber}`);
        this.router.navigate(['/dat-hang-thanh-cong', created.id], { state: { order: created } });
      },
      error: () => this.submitting.set(false),
    });
  }
}
