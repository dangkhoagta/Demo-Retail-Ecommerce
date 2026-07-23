using RetailEcommerce.Domain.Common;

namespace RetailEcommerce.Domain.Entities;

/// <summary>An image belonging to a product. One image per product is flagged primary.</summary>
public class ProductImage : AuditableEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string Url { get; set; } = null!;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}
