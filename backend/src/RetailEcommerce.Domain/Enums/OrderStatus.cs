namespace RetailEcommerce.Domain.Enums;

/// <summary>Lifecycle of a customer order (COD flow).</summary>
public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Processing = 2,
    Shipped = 3,
    Delivered = 4,
    Cancelled = 5
}
