import { Injectable, computed, effect, signal } from '@angular/core';
import { CART_STORAGE_KEY } from '../config';

export interface CartItem {
  productId: number;
  slug: string;
  variantId: number;
  productName: string;
  variantName: string;
  sku: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  maxStock: number;
}

const FREE_SHIPPING_THRESHOLD = 500_000;
const FLAT_SHIPPING_FEE = 30_000;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.load());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((sum, i) => sum + i.price * i.quantity, 0));
  readonly shippingFee = computed(() => {
    const sub = this.subtotal();
    return sub === 0 || sub >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  });
  readonly total = computed(() => this.subtotal() + this.shippingFee());
  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    effect(() => this.persist(this._items()));
  }

  add(item: Omit<CartItem, 'quantity'>, quantity = 1): void {
    this._items.update((items) => {
      const existing = items.find((i) => i.variantId === item.variantId);
      if (existing) {
        return items.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxStock) }
            : i,
        );
      }
      return [...items, { ...item, quantity: Math.min(quantity, item.maxStock) }];
    });
  }

  setQuantity(variantId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(variantId);
      return;
    }
    this._items.update((items) =>
      items.map((i) =>
        i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i,
      ),
    );
  }

  remove(variantId: number): void {
    this._items.update((items) => items.filter((i) => i.variantId !== variantId));
  }

  clear(): void {
    this._items.set([]);
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private persist(items: CartItem[]): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }
}
