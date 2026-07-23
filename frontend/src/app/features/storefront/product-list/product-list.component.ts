import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Brand, Category, ProductListItem, ProductQuery } from '../../../core/models/catalog.model';
import { BrandService } from '../../../core/services/brand.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  imports: [FormsModule, MatPaginatorModule, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container list-head">
      <p class="eyebrow">Cửa hàng</p>
      <h1>Tất cả sản phẩm</h1>
    </div>

    <div class="container layout">
      <aside class="filters">
        <div class="filter-block">
          <div class="search">
            <input type="text" placeholder="Tìm sản phẩm…" [(ngModel)]="search"
                   (keyup.enter)="applyFilters()" />
            <button class="btn btn-dark btn-sm" (click)="applyFilters()">Tìm</button>
          </div>
        </div>

        <div class="filter-block">
          <h4>Danh mục</h4>
          <button class="filter-item" [class.active]="categoryId() === null" (click)="selectCategory(null)">Tất cả</button>
          @for (cat of categories(); track cat.id) {
            <button class="filter-item" [class.active]="categoryId() === cat.id" (click)="selectCategory(cat.id)">
              {{ cat.name }} <span class="count">{{ cat.productCount }}</span>
            </button>
          }
        </div>

        <div class="filter-block">
          <h4>Thương hiệu</h4>
          <button class="filter-item" [class.active]="brandId() === null" (click)="selectBrand(null)">Tất cả</button>
          @for (brand of brands(); track brand.id) {
            <button class="filter-item" [class.active]="brandId() === brand.id" (click)="selectBrand(brand.id)">
              {{ brand.name }} <span class="count">{{ brand.productCount }}</span>
            </button>
          }
        </div>
      </aside>

      <section class="results">
        <div class="results-bar">
          <span class="muted">{{ total() }} sản phẩm</span>
          <select [(ngModel)]="sort" (ngModelChange)="applyFilters()" class="sort">
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá: thấp → cao</option>
            <option value="price-desc">Giá: cao → thấp</option>
            <option value="name">Tên A → Z</option>
          </select>
        </div>

        @if (loading()) {
          <div class="full-bleed-loading"><span class="muted">Đang tải…</span></div>
        } @else if (products().length) {
          <div class="product-grid">
            @for (p of products(); track p.id) {
              <app-product-card [product]="p" />
            }
          </div>
          <mat-paginator [length]="total()" [pageSize]="pageSize" [pageIndex]="page() - 1"
                         [pageSizeOptions]="[12, 24, 48]" (page)="onPage($event)" />
        } @else {
          <div class="empty surface">
            <p>Không tìm thấy sản phẩm phù hợp.</p>
            <button class="btn btn-outline btn-sm" (click)="reset()">Xoá bộ lọc</button>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .list-head { padding-block: 2.5rem 1.5rem; }
    .layout { display: grid; grid-template-columns: 260px 1fr; gap: 2.5rem; padding-bottom: 4rem; align-items: start; }
    .filters { position: sticky; top: 96px; display: flex; flex-direction: column; gap: 1.75rem; }
    .filter-block h4 { font-family: var(--font-body); font-size: .74rem; letter-spacing: .16em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: .8rem; }
    .search { display: flex; gap: .5rem; }
    .search input { flex: 1; padding: .7rem .8rem; border: 1px solid var(--line); border-radius: var(--radius); font-family: inherit; background: #fff; }
    .filter-item { display: flex; justify-content: space-between; width: 100%; text-align: left; background: none; border: none; padding: .5rem 0; cursor: pointer; color: var(--ink-soft); font-family: inherit; font-size: .95rem; border-bottom: 1px solid transparent; }
    .filter-item:hover { color: var(--ink); }
    .filter-item.active { color: var(--accent); font-weight: 500; }
    .count { color: var(--ink-soft); font-size: .8rem; }
    .results-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .sort { padding: .6rem .8rem; border: 1px solid var(--line); border-radius: var(--radius); background: #fff; font-family: inherit; }
    .product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    .empty { padding: 3rem; text-align: center; display: flex; flex-direction: column; gap: 1rem; align-items: center; }
    mat-paginator { background: transparent; margin-top: 2rem; }
    @media (max-width: 980px) {
      .layout { grid-template-columns: 1fr; }
      .filters { position: static; flex-direction: row; flex-wrap: wrap; gap: 1rem; }
      .filter-block { flex: 1 1 200px; }
      .product-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) { .product-grid { grid-template-columns: 1fr; } }
  `],
})
export class ProductListComponent {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly brandService = inject(BrandService);
  private readonly route = inject(ActivatedRoute);

  readonly products = signal<ProductListItem[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly brands = signal<Brand[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly categoryId = signal<number | null>(null);
  readonly brandId = signal<number | null>(null);
  readonly loading = signal(true);

  search = '';
  sort = 'newest';
  readonly pageSize = 12;

  constructor() {
    this.categoryService.getAll().subscribe((c) => this.categories.set(c.filter((x) => x.isActive)));
    this.brandService.getAll().subscribe((b) => this.brands.set(b.filter((x) => x.isActive)));

    this.route.queryParamMap.subscribe((params) => {
      const cat = params.get('categoryId');
      this.categoryId.set(cat ? Number(cat) : null);
      this.page.set(1);
      this.load();
    });
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  selectCategory(id: number | null): void {
    this.categoryId.set(id);
    this.applyFilters();
  }

  selectBrand(id: number | null): void {
    this.brandId.set(id);
    this.applyFilters();
  }

  onPage(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.load();
  }

  reset(): void {
    this.search = '';
    this.sort = 'newest';
    this.categoryId.set(null);
    this.brandId.set(null);
    this.applyFilters();
  }

  private load(): void {
    this.loading.set(true);
    const query: ProductQuery = {
      page: this.page(),
      pageSize: this.pageSize,
      isActive: true,
      search: this.search || undefined,
      categoryId: this.categoryId() ?? undefined,
      brandId: this.brandId() ?? undefined,
      ...this.sortParams(),
    };
    this.productService.getPaged(query).subscribe({
      next: (result) => {
        this.products.set(result.items);
        this.total.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private sortParams(): Partial<ProductQuery> {
    switch (this.sort) {
      case 'price-asc':
        return { sortBy: 'price', sortDescending: false };
      case 'price-desc':
        return { sortBy: 'price', sortDescending: true };
      case 'name':
        return { sortBy: 'name', sortDescending: false };
      default:
        return { sortBy: 'createdAt', sortDescending: false };
    }
  }
}
