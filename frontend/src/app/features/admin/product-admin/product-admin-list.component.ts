import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { ProductListItem } from '../../../core/models/catalog.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductService } from '../../../core/services/product.service';
import { VndPipe } from '../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-product-admin-list',
  imports: [RouterLink, FormsModule, MatPaginatorModule, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="head">
      <div><h1>Sản phẩm</h1><p class="muted">{{ total() }} sản phẩm</p></div>
      <a class="btn btn-accent" routerLink="/quan-tri/san-pham/moi">+ Thêm sản phẩm</a>
    </header>

    <div class="toolbar surface">
      <input type="text" placeholder="Tìm theo tên hoặc SKU…" [(ngModel)]="search" (keyup.enter)="applySearch()" />
      <button class="btn btn-dark btn-sm" (click)="applySearch()">Tìm</button>
    </div>

    <div class="surface tbl-wrap">
      @if (loading()) {
        <div class="full-bleed-loading"><span class="muted">Đang tải…</span></div>
      } @else {
        <table class="tbl">
          <thead>
            <tr><th></th><th>Tên</th><th>SKU</th><th>Danh mục</th><th>Thương hiệu</th>
                <th class="r">Giá</th><th class="r">Tồn</th><th>Trạng thái</th><th></th></tr>
          </thead>
          <tbody>
            @for (p of products(); track p.id) {
              <tr>
                <td class="thumb-cell">
                  @if (p.primaryImageUrl) { <img [src]="p.primaryImageUrl" [alt]="p.name" /> }
                </td>
                <td><strong>{{ p.name }}</strong></td>
                <td class="mono">{{ p.sku }}</td>
                <td>{{ p.categoryName }}</td>
                <td>{{ p.brandName }}</td>
                <td class="r price">{{ p.basePrice | vnd }}</td>
                <td class="r" [class.low]="p.totalStock === 0">{{ p.totalStock }}</td>
                <td><span class="badge2" [class.on]="p.isActive">{{ p.isActive ? 'Đang bán' : 'Ẩn' }}</span></td>
                <td class="actions">
                  <a [routerLink]="['/quan-tri/san-pham', p.id]" class="act">Sửa</a>
                  <button class="act del" (click)="remove(p)">Xoá</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="9" class="empty muted">Không có sản phẩm.</td></tr>
            }
          </tbody>
        </table>
        <mat-paginator [length]="total()" [pageSize]="pageSize" [pageIndex]="page() - 1"
                       [pageSizeOptions]="[10, 20, 50]" (page)="onPage($event)" />
      }
    </div>
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .toolbar { display: flex; gap: .5rem; padding: 1rem; margin-bottom: 1.25rem; }
    .toolbar input { flex: 1; padding: .6rem .8rem; border: 1px solid var(--line); border-radius: var(--radius); font-family: inherit; }
    .tbl-wrap { padding: .5rem 1rem 1rem; overflow-x: auto; }
    .tbl { width: 100%; border-collapse: collapse; min-width: 820px; }
    .tbl th { text-align: left; font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-soft); padding: .75rem .5rem; border-bottom: 1px solid var(--line); }
    .tbl td { padding: .7rem .5rem; border-bottom: 1px solid var(--line); font-size: .9rem; vertical-align: middle; }
    .thumb-cell img { width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius); }
    .mono { font-family: ui-monospace, monospace; font-size: .82rem; color: var(--ink-soft); }
    .r { text-align: right; }
    .low { color: var(--sale); font-weight: 600; }
    .badge2 { padding: .2rem .6rem; border-radius: 999px; font-size: .74rem; background: #eee; color: var(--ink-soft); }
    .badge2.on { background: #dcecdf; color: var(--success); }
    .actions { white-space: nowrap; text-align: right; }
    .act { border: none; background: none; cursor: pointer; color: var(--accent); font-family: inherit; font-size: .85rem; padding: .2rem .5rem; }
    .act.del { color: var(--sale); }
    .empty { text-align: center; padding: 2rem; }
  `],
})
export class ProductAdminListComponent {
  private readonly productService = inject(ProductService);
  private readonly notify = inject(NotificationService);

  readonly products = signal<ProductListItem[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly pageSize = 10;
  search = '';

  constructor() {
    this.load();
  }

  applySearch(): void {
    this.page.set(1);
    this.load();
  }

  onPage(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.load();
  }

  remove(p: ProductListItem): void {
    if (!confirm(`Xoá sản phẩm "${p.name}"?`)) return;
    this.productService.delete(p.id).subscribe(() => {
      this.notify.success('Đã xoá sản phẩm.');
      this.load();
    });
  }

  private load(): void {
    this.loading.set(true);
    this.productService
      .getPaged({ page: this.page(), pageSize: this.pageSize, search: this.search || undefined })
      .subscribe({
        next: (result) => {
          this.products.set(result.items);
          this.total.set(result.totalCount);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
