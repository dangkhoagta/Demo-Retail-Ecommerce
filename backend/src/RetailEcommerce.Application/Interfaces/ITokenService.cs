using RetailEcommerce.Application.DTOs.Auth;

namespace RetailEcommerce.Application.Interfaces;

/// <summary>Issues signed JWT access tokens for authenticated users.</summary>
public interface ITokenService
{
    /// <summary>Creates a JWT for the given user and returns the token plus its expiry.</summary>
    (string Token, DateTime ExpiresAtUtc) CreateToken(Guid userId, string userName, string email, IEnumerable<string> roles);
}
