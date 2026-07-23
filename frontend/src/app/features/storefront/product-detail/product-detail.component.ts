import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { Product, ProductImage, ProductVariant } from '../../../core/models/catalog.model';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductService } from '../../../core/services/product.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, MatTabsModule, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="full-bleed-loading"><span class="muted">Đang tải sản phẩm…</span></div>
    } @else if (product(); as p) {
      <div class="container crumbs">
        <a routerLink="/">Trang chủ</a> / <a routerLink="/san-pham">Sản phẩm</a> / <span>{{ p.name }}</span>
      </div>

      <div class="container detail">
        <div class="gallery">
          <div class="main-img">
            @if (activeImage()) {
              <img [src]="activeImage()!.url" [alt]="activeImage()!.altText || p.name" />
            } @else {
              <div class="media-fallback">{{ p.name.charAt(0) }}</div>
            }
            @if (discount() > 0) { <span class="badge badge-sale gallery-badge">-{{ discount() }}%</span> }
          </div>
          @if (p.images.length > 1) {
            <div class="thumbs">
              @for (img of p.images; track img.id) {
                <button class="thumb" [class.active]="img.id === activeImage()?.id" (click)="activeImage.set(img)">
                  <img [src]="img.url" [alt]="img.altText || p.name" />
                </button>
              }
            </div>
          }
        </div>

        <div class="info">
          <span class="brand">{{ p.brandName }}</span>
          <h1>{{ p.name }}</h1>

          <div class="price-row">
            <span class="price big">{{ currentPrice() | vnd }}</span>
            @if (p.compareAtPrice) { <span class="price--old">{{ p.compareAtPrice | vnd }}</span> }
          </div>

          @if (p.shortDescription) { <p class="short">{{ p.shortDescription }}</p> }

          @if (p.variants.length) {
            <div class="variants">
              <span class="label">Phân loại</span>
              <div class="variant-buttons">
                @for (v of p.variants; track v.id) {
                  <button class="variant" [class.active]="v.id === selectedVariant()?.id"
                          [disabled]="v.quantityAvailable === 0"
                          (click)="selectVariant(v)">
                    {{ v.name }}
                  </button>
                }
              </div>
            </div>
          }

          <div class="buy-row">
            <div class="qty">
              <button (click)="changeQty(-1)" [disabled]="quantity() <= 1" aria-label="Giảm">−</button>
              <span>{{ quantity() }}</span>
              <button (click)="changeQty(1)" [disabled]="quantity() >= maxQty()" aria-label="Tăng">+</button>
            </div>
            <button class="btn btn-accent add" [disabled]="!canBuy()" (click)="addToCart()">
              Thêm vào giỏ
            </button>
          </div>

          <div class="stock">
            @if (maxQty() > 0) {
              <span class="chip">● Còn {{ maxQty() }} sản phẩm</span>
            } @else {
              <span class="chip out">Hết hàng</span>
            }
            <span class="sku muted">SKU: {{ selectedVariant()?.sku || p.sku }}</span>
          </div>

          <ul class="perks">
            <li>Thanh toán khi nhận hàng (COD)</li>
            <li>Miễn phí giao hàng cho đơn từ 500.000₫</li>
            <li>Đổi trả trong 7 ngày</li>
          </ul>
        </div>
      </div>

      <div class="container tabs-wrap">
        <mat-tab-group>
          <mat-tab label="Mô tả">
            <div class="tab-body"><p>{{ p.description || p.shortDescription || 'Đang cập nhật.' }}</p></div>
          </mat-tab>
          <mat-tab label="Thông số">
            <div class="tab-body">
              @if (p.attributes.length) {
                <table class="spec">
                  @for (a of p.attributes; track a.id) {
                    <tr><th>{{ a.name }}</th><td>{{ a.value }}</td></tr>
                  }
                </table>
              } @else { <p class="muted">Chưa có thông số.</p> }
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    } @else {
      <div class="container empty-state">
        <h2>Không tìm thấy sản phẩm</h2>
        <a class="btn btn-outline" routerLink="/san-pham">Quay lại cửa hàng</a>
      </div>
    }
  `,
  styles: [`
    .crumbs { padding-block: 1.5rem; font-size: .85rem; color: var(--ink-soft); }
    .crumbs a:hover { color: var(--accent); }
    .detail { display: grid; grid-template-columns: 1fr 1fr; gap: 3.5rem; padding-bottom: 3rem; }
    .main-img { position: relative; aspect-ratio: 1/1; background: var(--cream-deep); border-radius: var(--radius-lg); overflow: hidden; }
    .main-img img { width: 100%; height: 100%; object-fit: cover; }
    .media-fallback { display: grid; place-items: center; height: 100%; font-family: var(--font-display); font-size: 5rem; color: var(--ink-soft); }
    .gallery-badge { position: absolute; top: 16px; left: 16px; }
    .thumbs { display: flex; gap: .75rem; margin-top: 1rem; }
    .thumb { width: 76px; height: 76px; border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; padding: 0; cursor: pointer; background: #fff; }
    .thumb.active { border-color: var(--accent); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .info { padding-top: 1rem; }
    .brand { font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; color: var(--accent); }
    .info h1 { margin: .5rem 0 1rem; }
    .price-row { display: flex; align-items: baseline; gap: .25rem; margin-bottom: 1.25rem; }
    .price.big { font-size: 1.9rem; }
    .short { color: var(--ink-soft); margin-bottom: 1.5rem; }
    .label { display: block; font-size: .72rem; letter-spacing: .16em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: .6rem; }
    .variant-buttons { display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: 1.75rem; }
    .variant { padding: .6rem 1.1rem; border: 1px solid var(--line); background: #fff; border-radius: var(--radius); cursor: pointer; font-family: inherit; font-size: .9rem; transition: all .2s; }
    .variant:hover:not(:disabled) { border-color: var(--ink); }
    .variant.active { border-color: var(--accent); background: var(--accent-tint); color: var(--accent-dark); }
    .variant:disabled { opacity: .4; cursor: not-allowed; text-decoration: line-through; }
    .buy-row { display: flex; gap: 1rem; margin-bottom: 1.25rem; }
    .qty { display: flex; align-items: center; border: 1px solid var(--line); border-radius: var(--radius); background: #fff; }
    .qty button { width: 44px; height: 48px; border: none; background: none; font-size: 1.2rem; cursor: pointer; color: var(--ink); }
    .qty button:disabled { opacity: .3; cursor: not-allowed; }
    .qty span { min-width: 40px; text-align: center; font-weight: 500; }
    .add { flex: 1; height: 48px; }
    .stock { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .chip { color: var(--success); border-color: var(--success); }
    .chip.out { color: var(--sale); border-color: var(--sale); }
    .sku { font-size: .85rem; }
    .perks { list-style: none; padding: 1.25rem 0 0; margin: 0; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: .5rem; color: var(--ink-soft); font-size: .9rem; }
    .perks li::before { content: '✓'; color: var(--accent); margin-right: .5rem; }
    .tabs-wrap { padding-bottom: 4rem; }
    .tab-body { padding: 1.75rem 0; color: var(--ink-soft); line-height: 1.8; max-width: 70ch; }
    .spec { width: 100%; max-width: 520px; border-collapse: collapse; }
    .spec th { text-align: left; width: 40%; padding: .7rem 0; color: var(--ink-soft); font-weight: 500; border-bottom: 1px solid var(--line); }
    .spec td { padding: .7rem 0; color: var(--ink); border-bottom: 1px solid var(--line); }
    .empty-state { padding: 5rem 0; text-align: center; display: flex; flex-direction: column; gap: 1.5rem; align-items: center; }
    @media (max-width: 880px) { .detail { grid-template-columns: 1fr; gap: 1.5rem; } }
  `],
})
export class ProductDetailComponent {
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly notify = inject(NotificationService);

  readonly slug = input.required<string>();

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly activeImage = signal<ProductImage | null>(null);
  readonly selectedVariant = signal<ProductVariant | null>(null);
  readonly quantity = signal(1);

  readonly currentPrice = computed(() => this.selectedVariant()?.price ?? this.product()?.basePrice ?? 0);
  readonly maxQty = computed(() => this.selectedVariant()?.quantityAvailable ?? 0);
  readonly canBuy = computed(() => !!this.selectedVariant() && this.maxQty() > 0);
  readonly discount = computed(() => {
    const p = this.product();
    if (!p?.compareAtPrice || p.compareAtPrice <= this.currentPrice()) return 0;
    return Math.round((1 - this.currentPrice() / p.compareAtPrice) * 100);
  });

  constructor() {
    effect(() => {
      const slug = this.slug();
      if (!slug) return;
      this.loading.set(true);
      this.productService.getBySlug(slug).subscribe({
        next: (p) => this.hydrate(p),
        error: () => {
          this.product.set(null);
          this.loading.set(false);
        },
      });
    });
  }

  selectVariant(v: ProductVariant): void {
    this.selectedVariant.set(v);
    this.quantity.set(v.quantityAvailable > 0 ? 1 : 0);
  }

  changeQty(delta: number): void {
    const next = this.quantity() + delta;
    if (next >= 1 && next <= this.maxQty()) this.quantity.set(next);
  }

  addToCart(): void {
    const p = this.product();
    const v = this.selectedVariant();
    if (!p || !v) return;
    this.cart.add(
      {
        productId: p.id,
        slug: p.slug,
        variantId: v.id,
        productName: p.name,
        variantName: v.name,
        sku: v.sku,
        price: v.price,
        imageUrl: this.activeImage()?.url ?? p.images[0]?.url,
        maxStock: v.quantityAvailable,
      },
      this.quantity(),
    );
    this.notify.success(`Đã thêm "${p.name} - ${v.name}" vào giỏ.`);
  }

  private hydrate(p: Product): void {
    this.product.set(p);
    this.activeImage.set(p.images.find((i) => i.isPrimary) ?? p.images[0] ?? null);
    const firstAvailable = p.variants.find((v) => v.quantityAvailable > 0) ?? p.variants[0] ?? null;
    this.selectedVariant.set(firstAvailable);
    this.quantity.set(firstAvailable && firstAvailable.quantityAvailable > 0 ? 1 : 0);
    this.loading.set(false);
  }
}
