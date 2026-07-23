namespace RetailEcommerce.Application.Common.Exceptions;

/// <summary>Thrown when a requested entity does not exist. Mapped to HTTP 404.</summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }

    public NotFoundException(string name, object key)
        : base($"{name} với định danh '{key}' không tồn tại.") { }
}
