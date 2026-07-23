using System.ComponentModel.DataAnnotations.Schema;
using RetailEcommerce.Domain.Common;

namespace RetailEcommerce.Domain.Entities;

/// <summary>Stock level for a single <see cref="ProductVariant"/> (1:1).</summary>
public class Inventory : AuditableEntity
{
    public int ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;

    public int QuantityOnHand { get; set; }
    public int QuantityReserved { get; set; }
    public int ReorderThreshold { get; set; }

    /// <summary>Sellable quantity = on hand minus reserved. Not persisted.</summary>
    [NotMapped]
    public int QuantityAvailable => QuantityOnHand - QuantityReserved;
}
