export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  parentCategoryId?: number | null;
  parentCategoryName?: string | null;
  productCount: number;
  children: Category[];
}

export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  parentCategoryId?: number | null;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
  productCount: number;
}

export interface BrandInput {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  basePrice: number;
  compareAtPrice?: number | null;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  primaryImageUrl?: string | null;
  totalStock: number;
}

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  isActive: boolean;
  color?: string;
  size?: string;
  quantityAvailable: number;
}

export interface ProductAttribute {
  id: number;
  name: string;
  value: string;
  displayOrder: number;
}

export interface PriceHistory {
  id: number;
  oldPrice: number;
  newPrice: number;
  changedAt: string;
  changedBy?: string;
  reason?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  description?: string;
  basePrice: number;
  compareAtPrice?: number | null;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  createdAt: string;
  updatedAt?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  priceHistory: PriceHistory[];
}

export interface ProductImageInput {
  id?: number | null;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariantInput {
  id?: number | null;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  isActive: boolean;
  color?: string;
  size?: string;
  quantityOnHand: number;
  reorderThreshold: number;
}

export interface ProductAttributeInput {
  id?: number | null;
  name: string;
  value: string;
  displayOrder: number;
}

export interface ProductCreateInput {
  name: string;
  slug?: string;
  sku: string;
  shortDescription?: string;
  description?: string;
  basePrice: number;
  compareAtPrice?: number | null;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  brandId: number;
  images: ProductImageInput[];
  variants: ProductVariantInput[];
  attributes: ProductAttributeInput[];
}

export interface ProductUpdateInput extends Omit<ProductCreateInput, 'sku'> {
  priceChangeReason?: string;
}

export interface ProductQuery extends PagedQueryLike {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

interface PagedQueryLike {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
}
