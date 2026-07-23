using RetailEcommerce.Domain.Common;

namespace RetailEcommerce.Domain.Entities;

/// <summary>
/// A sellable product. Purchasable stock is tracked per <see cref="ProductVariant"/>;
/// the product itself holds the catalogue-level information and a base/list price.
/// </summary>
public class Product : AuditableEntity
{
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Sku { get; set; } = null!;
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }

    public decimal BasePrice { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public string Currency { get; set; } = "VND";

    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }

    // Relationships
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public int BrandId { get; set; }
    public Brand Brand { get; set; } = null!;

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductAttribute> Attributes { get; set; } = new List<ProductAttribute>();
    public ICollection<PriceHistory> PriceHistories { get; set; } = new List<PriceHistory>();
}
