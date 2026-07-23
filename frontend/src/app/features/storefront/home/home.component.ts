import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category, ProductListItem } from '../../../core/models/catalog.model';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <div class="hero-media"></div>
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <p class="eyebrow hero-eyebrow">Bộ sưu tập 2026</p>
        <h1>Phong cách sống<br />hiện đại bắt đầu từ đây</h1>
        <p class="hero-sub">Khám phá sản phẩm chính hãng, giao hàng toàn quốc, thanh toán khi nhận hàng.</p>
        <a class="btn btn-accent" routerLink="/san-pham">Mua sắm ngay</a>
      </div>
    </section>

    <section class="section values">
      <div class="container values-grid">
        <div class="value"><span class="v-title">Thanh toán COD</span><span class="muted">Nhận hàng rồi mới trả tiền</span></div>
        <div class="value"><span class="v-title">Miễn phí giao hàng</span><span class="muted">Cho đơn hàng từ 500.000₫</span></div>
        <div class="value"><span class="v-title">Đổi trả 7 ngày</span><span class="muted">Yên tâm mua sắm</span></div>
        <div class="value"><span class="v-title">Chính hãng 100%</span><span class="muted">Cam kết nguồn gốc rõ ràng</span></div>
      </div>
    </section>

    @if (categories().length) {
      <section class="section categories">
        <div class="container">
          <p class="eyebrow text-center">Danh mục</p>
          <h2 class="text-center section-title">Mua theo danh mục</h2>
          <div class="cat-grid">
            @for (cat of categories(); track cat.id) {
              <a class="cat" [routerLink]="['/san-pham']" [queryParams]="{ categoryId: cat.id }">
                <div class="cat-media" [style.background-image]="cat.imageUrl ? 'url(' + cat.imageUrl + ')' : null"></div>
                <span class="cat-name">{{ cat.name }}</span>
                <span class="cat-count muted">{{ cat.productCount }} sản phẩm</span>
              </a>
            }
          </div>
        </div>
      </section>
    }

    <section class="section featured">
      <div class="container">
        <p class="eyebrow text-center">Nổi bật</p>
        <h2 class="text-center section-title">Sản phẩm được yêu thích</h2>

        @if (loading()) {
          <div class="full-bleed-loading"><span class="muted">Đang tải…</span></div>
        } @else if (featured().length) {
          <div class="product-grid">
            @for (product of featured(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>
          <div class="text-center more"><a class="btn btn-outline" routerLink="/san-pham">Xem tất cả sản phẩm</a></div>
        } @else {
          <p class="text-center muted">Chưa có sản phẩm nào.</p>
        }
      </div>
    </section>
  `,
  styles: [`
    .hero { position: relative; min-height: 78vh; display: flex; align-items: center; color: #fff; overflow: hidden; }
    .hero-media { position: absolute; inset: 0; background: url('https://picsum.photos/seed/livora-hero/1600/1000') center/cover no-repeat; transform: scale(1.02); }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(20,16,12,.72), rgba(20,16,12,.25)); }
    .hero-content { position: relative; max-width: 620px; }
    .hero-eyebrow { color: #e7c8a8; }
    .hero h1 { color: #fff; font-size: clamp(2.4rem, 5vw, 4.2rem); margin-bottom: 1rem; }
    .hero-sub { font-size: 1.1rem; max-width: 42ch; margin-bottom: 2rem; color: rgba(255,255,255,.9); }
    .section-title { margin-bottom: 2.5rem; }
    .values { background: var(--surface); border-block: 1px solid var(--line); padding-block: 2.5rem; }
    .values-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
    .value { display: flex; flex-direction: column; gap: .2rem; text-align: center; }
    .v-title { font-family: var(--font-display); font-size: 1.1rem; }
    .cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    .cat { display: flex; flex-direction: column; }
    .cat-media { aspect-ratio: 16 / 10; background: var(--cream-deep) center/cover no-repeat; border-radius: var(--radius-lg); margin-bottom: .8rem; transition: transform .3s; }
    .cat:hover .cat-media { transform: translateY(-4px); box-shadow: var(--shadow-md); }
    .cat-name { font-family: var(--font-display); font-size: 1.15rem; }
    .cat-count { font-size: .85rem; }
    .product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
    .more { margin-top: 3rem; }
    @media (max-width: 980px) { .product-grid, .cat-grid { grid-template-columns: repeat(2, 1fr); } .values-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 560px) { .product-grid { grid-template-columns: 1fr; } }
  `],
})
export class HomeComponent {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  readonly featured = signal<ProductListItem[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.productService.getPaged({ isFeatured: true, pageSize: 8, isActive: true }).subscribe({
      next: (page) => {
        this.featured.set(page.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.categoryService.getAll().subscribe((cats) =>
      this.categories.set(cats.filter((c) => c.isActive).slice(0, 6)),
    );
  }
}
