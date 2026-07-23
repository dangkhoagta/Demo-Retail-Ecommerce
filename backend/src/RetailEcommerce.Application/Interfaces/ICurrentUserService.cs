namespace RetailEcommerce.Application.Interfaces;

/// <summary>
/// Exposes the authenticated principal to the application layer. Implemented in the
/// API layer over <c>IHttpContextAccessor</c>. Used by the audit interceptor and services.
/// </summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? UserName { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
    bool IsInRole(string role);
}
