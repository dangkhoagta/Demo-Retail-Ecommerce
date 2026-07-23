import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductListItem } from '../../../core/models/catalog.model';
import { VndPipe } from '../../pipes/vnd.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, VndPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card">
      <a class="media" [routerLink]="['/san-pham', product().slug]">
        @if (product().primaryImageUrl) {
          <img [src]="product().primaryImageUrl" [alt]="product().name" loading="lazy" />
        } @else {
          <div class="media-fallback">{{ product().name.charAt(0) }}</div>
        }
        @if (discount() > 0) {
          <span class="badge badge-sale card-badge">-{{ discount() }}%</span>
        }
        @if (product().totalStock === 0) {
          <span class="badge badge-out card-badge card-badge--right">Hết hàng</span>
        }
      </a>
      <div class="body">
        <span class="brand">{{ product().brandName }}</span>
        <a class="name" [routerLink]="['/san-pham', product().slug]">{{ product().name }}</a>
        <div class="prices">
          <span class="price">{{ product().basePrice | vnd }}</span>
          @if (product().compareAtPrice) {
            <span class="price--old">{{ product().compareAtPrice | vnd }}</span>
          }
        </div>
      </div>
    </article>
  `,
  styles: [`
    .card { display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; transition: box-shadow .25s ease, transform .25s ease; height: 100%; }
    .card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
    .media { position: relative; aspect-ratio: 1 / 1; background: var(--cream-deep); display: block; overflow: hidden; }
    .media img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
    .card:hover .media img { transform: scale(1.05); }
    .media-fallback { width: 100%; height: 100%; display: grid; place-items: center; font-family: var(--font-display); font-size: 3rem; color: var(--ink-soft); }
    .card-badge { position: absolute; top: 12px; left: 12px; }
    .card-badge--right { left: auto; right: 12px; }
    .body { padding: 1rem 1.1rem 1.3rem; display: flex; flex-direction: column; gap: .35rem; }
    .brand { font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; color: var(--accent); }
    .name { font-family: var(--font-display); font-size: 1.05rem; line-height: 1.3; color: var(--ink); }
    .name:hover { color: var(--accent); }
    .prices { margin-top: .3rem; }
  `],
})
export class ProductCardComponent {
  readonly product = input.required<ProductListItem>();

  readonly discount = computed(() => {
    const p = this.product();
    if (!p.compareAtPrice || p.compareAtPrice <= p.basePrice) return 0;
    return Math.round((1 - p.basePrice / p.compareAtPrice) * 100);
  });
}
