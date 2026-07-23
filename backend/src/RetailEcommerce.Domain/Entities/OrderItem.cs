using RetailEcommerce.Domain.Common;

namespace RetailEcommerce.Domain.Entities;

/// <summary>
/// A line on an <see cref="Order"/>. Product name / SKU / unit price are captured as a
/// snapshot at purchase time so historical orders are unaffected by later catalogue edits.
/// </summary>
public class OrderItem : AuditableEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;

    // Snapshot fields
    public string ProductName { get; set; } = null!;
    public string Sku { get; set; } = null!;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}
