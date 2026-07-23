import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { Brand, Category, Product, ProductCreateInput, ProductUpdateInput } from '../../../core/models/catalog.model';
import { BrandService } from '../../../core/services/brand.service';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-admin-form',
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="head">
      <div>
        <a routerLink="/quan-tri/san-pham" class="back">← Sản phẩm</a>
        <h1>{{ isEdit() ? 'Sửa sản phẩm' : 'Thêm sản phẩm' }}</h1>
      </div>
    </header>

    <form [formGroup]="form" (ngSubmit)="submit()" class="grid">
      <div class="col-main">
        <section class="surface block">
          <h3>Thông tin cơ bản</h3>
          <mat-form-field appearance="outline">
            <mat-label>Tên sản phẩm</mat-label>
            <input matInput formControlName="name" />
          </mat-form-field>
          <div class="field-grid">
            <mat-form-field appearance="outline">
              <mat-label>SKU</mat-label>
              <input matInput formControlName="sku" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Slug (tuỳ chọn)</mat-label>
              <input matInput formControlName="slug" />
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline">
            <mat-label>Mô tả ngắn</mat-label>
            <input matInput formControlName="shortDescription" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Mô tả chi tiết</mat-label>
            <textarea matInput rows="4" formControlName="description"></textarea>
          </mat-form-field>
        </section>

        <section class="surface block">
          <div class="block-head"><h3>Biến thể</h3><button type="button" class="btn btn-outline btn-sm" (click)="addVariant()">+ Thêm biến thể</button></div>
          <div formArrayName="variants" class="rows">
            @for (v of variants.controls; track $index; let i = $index) {
              <div class="row-card" [formGroupName]="i">
                <div class="field-grid">
                  <mat-form-field appearance="outline"><mat-label>Tên biến thể</mat-label><input matInput formControlName="name" /></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>SKU biến thể</mat-label><input matInput formControlName="sku" /></mat-form-field>
                </div>
                <div class="field-grid four">
                  <mat-form-field appearance="outline"><mat-label>Giá</mat-label><input matInput type="number" formControlName="price" /></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Màu</mat-label><input matInput formControlName="color" /></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Size</mat-label><input matInput formControlName="size" /></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Tồn kho</mat-label><input matInput type="number" formControlName="quantityOnHand" /></mat-form-field>
                </div>
                <button type="button" class="remove-row" (click)="removeVariant(i)">Xoá biến thể</button>
              </div>
            }
          </div>
        </section>

        <section class="surface block">
          <div class="block-head"><h3>Hình ảnh</h3><button type="button" class="btn btn-outline btn-sm" (click)="addImage()">+ Thêm ảnh</button></div>
          <div formArrayName="images" class="rows">
            @for (img of images.controls; track $index; let i = $index) {
              <div class="row-line" [formGroupName]="i">
                <mat-form-field appearance="outline" class="grow"><mat-label>URL ảnh</mat-label><input matInput formControlName="url" /></mat-form-field>
                <mat-checkbox formControlName="isPrimary">Ảnh chính</mat-checkbox>
                <button type="button" class="remove-row" (click)="removeImage(i)">✕</button>
              </div>
            }
          </div>
        </section>

        <section class="surface block">
          <div class="block-head"><h3>Thuộc tính</h3><button type="button" class="btn btn-outline btn-sm" (click)="addAttribute()">+ Thêm thuộc tính</button></div>
          <div formArrayName="attributes" class="rows">
            @for (a of attributes.controls; track $index; let i = $index) {
              <div class="row-line" [formGroupName]="i">
                <mat-form-field appearance="outline"><mat-label>Tên</mat-label><input matInput formControlName="name" /></mat-form-field>
                <mat-form-field appearance="outline" class="grow"><mat-label>Giá trị</mat-label><input matInput formControlName="value" /></mat-form-field>
                <button type="button" class="remove-row" (click)="removeAttribute(i)">✕</button>
              </div>
            }
          </div>
        </section>
      </div>

      <aside class="col-side">
        <section class="surface block">
          <h3>Phân loại & giá</h3>
          <mat-form-field appearance="outline">
            <mat-label>Danh mục</mat-label>
            <mat-select formControlName="categoryId">
              @for (c of categories(); track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Thương hiệu</mat-label>
            <mat-select formControlName="brandId">
              @for (b of brands(); track b.id) { <mat-option [value]="b.id">{{ b.name }}</mat-option> }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Giá niêm yết</mat-label>
            <input matInput type="number" formControlName="basePrice" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Giá gốc (gạch ngang)</mat-label>
            <input matInput type="number" formControlName="compareAtPrice" />
          </mat-form-field>
          @if (isEdit()) {
            <mat-form-field appearance="outline">
              <mat-label>Lý do đổi giá</mat-label>
              <input matInput formControlName="priceChangeReason" />
            </mat-form-field>
          }
          <div class="toggles">
            <mat-checkbox formControlName="isActive">Đang bán</mat-checkbox>
            <mat-checkbox formControlName="isFeatured">Nổi bật</mat-checkbox>
          </div>
        </section>

        <div class="actions surface">
          <button type="submit" class="btn btn-accent btn-block" [disabled]="submitting()">
            {{ submitting() ? 'Đang lưu…' : (isEdit() ? 'Cập nhật' : 'Tạo sản phẩm') }}
          </button>
          <a routerLink="/quan-tri/san-pham" class="btn btn-ghost btn-block">Huỷ</a>
        </div>
      </aside>
    </form>
  `,
  styles: [`
    .head { margin-bottom: 1.5rem; }
    .back { font-size: .85rem; color: var(--accent); }
    .grid { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; align-items: start; }
    .col-main, .col-side { display: flex; flex-direction: column; gap: 1.5rem; }
    .block { padding: 1.5rem; }
    .block h3 { margin-bottom: 1.1rem; }
    .block-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .field-grid.four { grid-template-columns: repeat(4, 1fr); gap: 0 .75rem; }
    .rows { display: flex; flex-direction: column; gap: 1rem; }
    .row-card { border: 1px solid var(--line); border-radius: var(--radius); padding: 1rem 1rem 0; position: relative; }
    .row-line { display: flex; gap: .75rem; align-items: center; }
    .row-line .grow { flex: 1; }
    .remove-row { border: none; background: none; color: var(--sale); cursor: pointer; font-family: inherit; font-size: .82rem; padding: .25rem .5rem; margin-bottom: 1rem; align-self: flex-start; }
    .row-line .remove-row { margin-bottom: 1.25rem; }
    .toggles { display: flex; gap: 1.5rem; margin-top: .5rem; }
    .col-side .actions { position: sticky; top: 90px; padding: 1.25rem; display: flex; flex-direction: column; gap: .5rem; }
    @media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } .field-grid.four { grid-template-columns: repeat(2,1fr); } }
  `],
})
export class ProductAdminFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly brandService = inject(BrandService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();
  readonly isEdit = computed(() => !!this.id());
  readonly submitting = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly brands = signal<Brand[]>([]);

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    sku: ['', [Validators.required]],
    slug: [''],
    shortDescription: [''],
    description: [''],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    compareAtPrice: [null as number | null],
    categoryId: [null as number | null, [Validators.required]],
    brandId: [null as number | null, [Validators.required]],
    isActive: [true],
    isFeatured: [false],
    priceChangeReason: [''],
    variants: this.fb.array<FormGroup>([]),
    images: this.fb.array<FormGroup>([]),
    attributes: this.fb.array<FormGroup>([]),
  });

  get variants(): FormArray { return this.form.get('variants') as FormArray; }
  get images(): FormArray { return this.form.get('images') as FormArray; }
  get attributes(): FormArray { return this.form.get('attributes') as FormArray; }

  constructor() {
    this.categoryService.getAll().subscribe((c) => this.categories.set(c));
    this.brandService.getAll().subscribe((b) => this.brands.set(b));

    effect(() => {
      const id = this.id();
      if (id) {
        this.productService.getById(Number(id)).subscribe((p) => this.patchFromProduct(p));
      } else if (this.variants.length === 0) {
        this.addVariant();
        this.addImage();
      }
    });
  }

  addVariant(v?: Partial<{ id: number; sku: string; name: string; price: number; color: string; size: string; quantityOnHand: number }>): void {
    this.variants.push(this.fb.group({
      id: [v?.id ?? null],
      sku: [v?.sku ?? '', [Validators.required]],
      name: [v?.name ?? '', [Validators.required]],
      price: [v?.price ?? 0, [Validators.required, Validators.min(0)]],
      compareAtPrice: [null as number | null],
      color: [v?.color ?? ''],
      size: [v?.size ?? ''],
      isActive: [true],
      quantityOnHand: [v?.quantityOnHand ?? 0, [Validators.min(0)]],
      reorderThreshold: [5, [Validators.min(0)]],
    }));
  }
  removeVariant(i: number): void { this.variants.removeAt(i); }

  addImage(img?: Partial<{ id: number; url: string; isPrimary: boolean; sortOrder: number }>): void {
    this.images.push(this.fb.group({
      id: [img?.id ?? null],
      url: [img?.url ?? '', [Validators.required]],
      altText: [''],
      isPrimary: [img?.isPrimary ?? this.images.length === 0],
      sortOrder: [img?.sortOrder ?? this.images.length],
    }));
  }
  removeImage(i: number): void { this.images.removeAt(i); }

  addAttribute(a?: Partial<{ id: number; name: string; value: string; displayOrder: number }>): void {
    this.attributes.push(this.fb.group({
      id: [a?.id ?? null],
      name: [a?.name ?? '', [Validators.required]],
      value: [a?.value ?? '', [Validators.required]],
      displayOrder: [a?.displayOrder ?? this.attributes.length],
    }));
  }
  removeAttribute(i: number): void { this.attributes.removeAt(i); }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.error('Vui lòng kiểm tra lại các trường bắt buộc.');
      return;
    }
    const raw = this.form.getRawValue();
    this.submitting.set(true);

    if (this.isEdit()) {
      const payload: ProductUpdateInput = {
        name: raw.name!, slug: raw.slug || undefined,
        shortDescription: raw.shortDescription || undefined, description: raw.description || undefined,
        basePrice: raw.basePrice!, compareAtPrice: raw.compareAtPrice ?? null, currency: 'VND',
        isActive: raw.isActive!, isFeatured: raw.isFeatured!,
        categoryId: raw.categoryId!, brandId: raw.brandId!,
        priceChangeReason: raw.priceChangeReason || undefined,
        images: this.mapImages(), variants: this.mapVariants(), attributes: this.mapAttributes(),
      };
      this.productService.update(Number(this.id()), payload).subscribe({
        next: () => this.done('Đã cập nhật sản phẩm.'),
        error: () => this.submitting.set(false),
      });
    } else {
      const payload: ProductCreateInput = {
        name: raw.name!, sku: raw.sku!, slug: raw.slug || undefined,
        shortDescription: raw.shortDescription || undefined, description: raw.description || undefined,
        basePrice: raw.basePrice!, compareAtPrice: raw.compareAtPrice ?? null, currency: 'VND',
        isActive: raw.isActive!, isFeatured: raw.isFeatured!,
        categoryId: raw.categoryId!, brandId: raw.brandId!,
        images: this.mapImages(), variants: this.mapVariants(), attributes: this.mapAttributes(),
      };
      this.productService.create(payload).subscribe({
        next: () => this.done('Đã tạo sản phẩm.'),
        error: () => this.submitting.set(false),
      });
    }
  }

  private mapVariants() {
    return this.variants.getRawValue().map((v: any) => ({
      id: v.id ?? undefined, sku: v.sku, name: v.name, price: Number(v.price),
      compareAtPrice: v.compareAtPrice ?? null, isActive: v.isActive,
      color: v.color || undefined, size: v.size || undefined,
      quantityOnHand: Number(v.quantityOnHand), reorderThreshold: Number(v.reorderThreshold),
    }));
  }
  private mapImages() {
    return this.images.getRawValue().map((img: any, i: number) => ({
      id: img.id ?? undefined, url: img.url, altText: img.altText || undefined,
      isPrimary: img.isPrimary, sortOrder: img.sortOrder ?? i,
    }));
  }
  private mapAttributes() {
    return this.attributes.getRawValue().map((a: any, i: number) => ({
      id: a.id ?? undefined, name: a.name, value: a.value, displayOrder: a.displayOrder ?? i,
    }));
  }

  private patchFromProduct(p: Product): void {
    this.form.patchValue({
      name: p.name, sku: p.sku, slug: p.slug,
      shortDescription: p.shortDescription ?? '', description: p.description ?? '',
      basePrice: p.basePrice, compareAtPrice: p.compareAtPrice ?? null,
      categoryId: p.categoryId, brandId: p.brandId,
      isActive: p.isActive, isFeatured: p.isFeatured,
    });
    this.form.get('sku')?.disable();
    this.variants.clear(); this.images.clear(); this.attributes.clear();
    p.variants.forEach((v) => this.addVariant({ id: v.id, sku: v.sku, name: v.name, price: v.price, color: v.color, size: v.size, quantityOnHand: v.quantityAvailable }));
    p.images.forEach((img) => this.addImage({ id: img.id, url: img.url, isPrimary: img.isPrimary, sortOrder: img.sortOrder }));
    p.attributes.forEach((a) => this.addAttribute({ id: a.id, name: a.name, value: a.value, displayOrder: a.displayOrder }));
    if (this.variants.length === 0) this.addVariant();
  }

  private done(message: string): void {
    this.notify.success(message);
    this.router.navigate(['/quan-tri/san-pham']);
  }
}
