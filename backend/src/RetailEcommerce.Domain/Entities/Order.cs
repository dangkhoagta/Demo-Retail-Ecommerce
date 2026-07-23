using RetailEcommerce.Domain.Common;
using RetailEcommerce.Domain.Enums;

namespace RetailEcommerce.Domain.Entities;

/// <summary>
/// A customer order. The checkout only records the order (COD) — no payment is taken.
/// Contact/shipping details are stored as a snapshot so the order is self-contained
/// even if the customer later edits their profile.
/// </summary>
public class Order : AuditableEntity
{
    public string OrderNumber { get; set; } = null!;

    /// <summary>Identity user id of the buyer (null for a guest checkout).</summary>
    public Guid? CustomerId { get; set; }

    // Contact + shipping snapshot
    public string CustomerName { get; set; } = null!;
    public string CustomerPhone { get; set; } = null!;
    public string? CustomerEmail { get; set; }
    public string ShippingAddress { get; set; } = null!;
    public string ShippingCity { get; set; } = null!;
    public string? ShippingDistrict { get; set; }
    public string? ShippingWard { get; set; }
    public string? Notes { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CashOnDelivery;

    public decimal Subtotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal Total { get; set; }

    public DateTime OrderDate { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
