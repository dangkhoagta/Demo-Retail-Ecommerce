import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <p class="eyebrow">Giỏ hàng</p>
      <h1>Giỏ hàng của bạn</h1>

      @if (cart.isEmpty()) {
        <div class="empty surface">
          <p>Giỏ hàng đang trống.</p>
          <a class="btn btn-accent" routerLink="/san-pham">Tiếp tục mua sắm</a>
        </div>
      } @else {
        <div class="layout">
          <div class="items">
            @for (item of cart.items(); track item.variantId) {
              <div class="item surface">
                <a class="thumb" [routerLink]="['/san-pham', item.slug]">
                  @if (item.imageUrl) { <img [src]="item.imageUrl" [alt]="item.productName" /> }
                </a>
                <div class="info">
                  <a class="name" [routerLink]="['/san-pham', item.slug]">{{ item.productName }}</a>
                  <span class="muted variant">{{ item.variantName }}</span>
                  <span class="muted sku">SKU: {{ item.sku }}</span>
                </div>
                <div class="qty">
                  <button (click)="cart.setQuantity(item.variantId, item.quantity - 1)" aria-label="Giảm">−</button>
                  <span>{{ item.quantity }}</span>
                  <button (click)="cart.setQuantity(item.variantId, item.quantity + 1)"
                          [disabled]="item.quantity >= item.maxStock" aria-label="Tăng">+</button>
                </div>
                <div class="line-total price">{{ item.price * item.quantity | vnd }}</div>
                <button class="remove" (click)="cart.remove(item.variantId)" aria-label="Xoá">✕</button>
              </div>
            }
          </div>

          <aside class="summary surface">
            <h3>Tóm tắt đơn hàng</h3>
            <div class="row"><span>Tạm tính</span><span>{{ cart.subtotal() | vnd }}</span></div>
            <div class="row"><span>Phí giao hàng</span>
              <span>{{ cart.shippingFee() === 0 ? 'Miễn phí' : (cart.shippingFee() | vnd) }}</span>
            </div>
            <div class="row total"><span>Tổng cộng</span><span class="price">{{ cart.total() | vnd }}</span></div>
            <a class="btn btn-accent btn-block" routerLink="/thanh-toan">Tiến hành thanh toán</a>
            <a class="btn btn-ghost btn-block" routerLink="/san-pham">Tiếp tục mua sắm</a>
            <p class="cod-note muted">Thanh toán khi nhận hàng (COD)</p>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding-block: 2.5rem 4rem; }
    h1 { margin-bottom: 2rem; }
    .empty { padding: 3.5rem; text-align: center; display: flex; flex-direction: column; gap: 1.25rem; align-items: center; }
    .layout { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; }
    .items { display: flex; flex-direction: column; gap: 1rem; }
    .item { display: grid; grid-template-columns: 90px 1fr auto auto auto; gap: 1.25rem; align-items: center; padding: 1rem; }
    .thumb { width: 90px; height: 90px; border-radius: var(--radius); overflow: hidden; background: var(--cream-deep); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .info { display: flex; flex-direction: column; gap: .2rem; }
    .name { font-family: var(--font-display); font-size: 1.1rem; }
    .name:hover { color: var(--accent); }
    .variant, .sku { font-size: .82rem; }
    .qty { display: flex; align-items: center; border: 1px solid var(--line); border-radius: var(--radius); }
    .qty button { width: 34px; height: 38px; border: none; background: none; cursor: pointer; font-size: 1.1rem; }
    .qty button:disabled { opacity: .3; }
    .qty span { min-width: 32px; text-align: center; }
    .line-total { min-width: 110px; text-align: right; }
    .remove { border: none; background: none; cursor: pointer; color: var(--ink-soft); font-size: 1rem; }
    .remove:hover { color: var(--sale); }
    .summary { position: sticky; top: 96px; padding: 1.75rem; display: flex; flex-direction: column; gap: .5rem; }
    .summary h3 { margin-bottom: 1rem; }
    .row { display: flex; justify-content: space-between; padding: .5rem 0; color: var(--ink-soft); }
    .row.total { border-top: 1px solid var(--line); margin-top: .5rem; padding-top: 1rem; color: var(--ink); font-size: 1.1rem; }
    .row.total .price { font-size: 1.3rem; }
    .summary .btn { margin-top: .5rem; }
    .cod-note { text-align: center; font-size: .82rem; margin: .75rem 0 0; }
    @media (max-width: 880px) {
      .layout { grid-template-columns: 1fr; }
      .item { grid-template-columns: 70px 1fr auto; grid-template-areas: 'thumb info remove' 'thumb qty total'; }
      .thumb { grid-area: thumb; width: 70px; height: 70px; }
      .info { grid-area: info; } .qty { grid-area: qty; } .line-total { grid-area: total; } .remove { grid-area: remove; justify-self: end; }
    }
  `],
})
export class CartComponent {
  readonly cart = inject(CartService);
}
