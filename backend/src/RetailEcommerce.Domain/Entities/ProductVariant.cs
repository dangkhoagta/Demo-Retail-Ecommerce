using RetailEcommerce.Domain.Common;

namespace RetailEcommerce.Domain.Entities;

/// <summary>
/// A concrete, purchasable variation of a product (e.g. a colour/size combination),
/// each with its own SKU, price and 1:1 <see cref="Inventory"/> record.
/// </summary>
public class ProductVariant : AuditableEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string Sku { get; set; } = null!;
    public string Name { get; set; } = null!;   // e.g. "Đen / Size L"

    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public bool IsActive { get; set; } = true;

    // Simple option pair kept flat for the demo
    public string? Color { get; set; }
    public string? Size { get; set; }

    public Inventory? Inventory { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
