using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.DTOs.Users;

namespace RetailEcommerce.Application.Interfaces.Services;

/// <summary>Admin user management. Backed by ASP.NET Core Identity (Infrastructure).</summary>
public interface IUserService
{
    Task<PagedResult<UserListItemDto>> GetPagedAsync(UserQuery query, CancellationToken ct = default);
    Task<UserListItemDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<UserListItemDto> UpdateRolesAsync(Guid id, IReadOnlyList<string> roles, CancellationToken ct = default);
    Task SetLockoutAsync(Guid id, bool locked, CancellationToken ct = default);
    Task<IReadOnlyList<string>> GetAllRolesAsync(CancellationToken ct = default);
}
