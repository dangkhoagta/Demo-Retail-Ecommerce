namespace RetailEcommerce.Domain.Enums;

/// <summary>
/// Supported payment methods. This demo only fulfils Cash on Delivery (COD):
/// the checkout simply records the order, no payment gateway is involved.
/// </summary>
public enum PaymentMethod
{
    CashOnDelivery = 0
}
