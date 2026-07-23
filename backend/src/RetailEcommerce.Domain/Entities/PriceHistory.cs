using RetailEcommerce.Domain.Common;

namespace RetailEcommerce.Domain.Entities;

/// <summary>
/// Records each change to a product's base price. A new row is written by the
/// product service whenever <see cref="Product.BasePrice"/> is updated.
/// </summary>
public class PriceHistory : AuditableEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public decimal OldPrice { get; set; }
    public decimal NewPrice { get; set; }
    public DateTime ChangedAt { get; set; }
    public string? ChangedBy { get; set; }
    public string? Reason { get; set; }
}
