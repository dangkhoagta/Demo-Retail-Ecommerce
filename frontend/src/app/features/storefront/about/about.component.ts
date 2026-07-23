import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <div class="container">
        <p class="eyebrow">Về chúng tôi</p>
        <h1>Livora — phong cách sống hiện đại</h1>
        <p class="lead">
          Livora là cửa hàng bán lẻ trực tuyến mang đến những sản phẩm chất lượng cho ngôi nhà và
          cuộc sống của bạn, với trải nghiệm mua sắm tối giản và dịch vụ giao hàng tận nơi.
        </p>
      </div>
    </section>

    <section class="section container values">
      <div class="value">
        <h3>Sản phẩm chọn lọc</h3>
        <p class="muted">Mỗi sản phẩm đều được tuyển chọn kỹ về chất lượng và nguồn gốc rõ ràng.</p>
      </div>
      <div class="value">
        <h3>Thanh toán COD</h3>
        <p class="muted">Nhận hàng, kiểm tra rồi mới thanh toán — an tâm tuyệt đối.</p>
      </div>
      <div class="value">
        <h3>Giao hàng toàn quốc</h3>
        <p class="muted">Miễn phí giao hàng cho đơn từ 500.000₫, phủ sóng 63 tỉnh thành.</p>
      </div>
      <div class="cta">
        <a class="btn btn-accent" routerLink="/san-pham">Bắt đầu mua sắm</a>
      </div>
    </section>
  `,
  styles: [`
    .hero { background: var(--surface); border-bottom: 1px solid var(--line); padding-block: 4rem; }
    .lead { max-width: 60ch; font-size: 1.15rem; color: var(--ink-soft); }
    .values { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
    .cta { grid-column: 1 / -1; text-align: center; margin-top: 1.5rem; }
    @media (max-width: 820px) { .values { grid-template-columns: 1fr; } }
  `],
})
export class AboutComponent {}
