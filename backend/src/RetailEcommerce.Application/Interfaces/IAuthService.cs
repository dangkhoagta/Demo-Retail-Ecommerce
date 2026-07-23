using RetailEcommerce.Application.DTOs.Auth;

namespace RetailEcommerce.Application.Interfaces;

/// <summary>Registration / login flows built on ASP.NET Core Identity.</summary>
public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
}
