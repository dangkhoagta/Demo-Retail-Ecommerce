namespace RetailEcommerce.Application.Common.Exceptions;

/// <summary>Thrown on a business-rule conflict (e.g. duplicate SKU, insufficient stock). Mapped to HTTP 409.</summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}
