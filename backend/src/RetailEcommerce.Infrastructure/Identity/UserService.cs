using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.Common.Exceptions;
using RetailEcommerce.Application.DTOs.Users;
using RetailEcommerce.Application.Interfaces.Services;

namespace RetailEcommerce.Infrastructure.Identity;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public UserService(UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<PagedResult<UserListItemDto>> GetPagedAsync(UserQuery query, CancellationToken ct = default)
    {
        var q = _userManager.Users.AsQueryable();
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(u => u.FullName.ToLower().Contains(term) || u.Email!.ToLower().Contains(term));
        }

        var users = await q.OrderBy(u => u.FullName).ToListAsync(ct);

        var dtos = new List<UserListItemDto>(users.Count);
        foreach (var user in users)
            dtos.Add(await ToDtoAsync(user));

        if (!string.IsNullOrWhiteSpace(query.Role))
            dtos = dtos.Where(d => d.Roles.Contains(query.Role)).ToList();

        var total = dtos.Count;
        var page = dtos.Skip(query.Skip).Take(query.PageSize).ToList();
        return new PagedResult<UserListItemDto>(page, total, query.Page, query.PageSize);
    }

    public async Task<UserListItemDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(id.ToString())
            ?? throw new NotFoundException("Người dùng", id);
        return await ToDtoAsync(user);
    }

    public async Task<UserListItemDto> UpdateRolesAsync(Guid id, IReadOnlyList<string> roles, CancellationToken ct = default)
    {
        var invalid = roles.Except(AppRoles.All).ToList();
        if (invalid.Count > 0)
            throw new ConflictException($"Vai trò không hợp lệ: {string.Join(", ", invalid)}.");

        var user = await _userManager.FindByIdAsync(id.ToString())
            ?? throw new NotFoundException("Người dùng", id);

        var current = await _userManager.GetRolesAsync(user);
        var toRemove = current.Except(roles).ToList();
        var toAdd = roles.Except(current).ToList();

        if (toRemove.Count > 0)
            await _userManager.RemoveFromRolesAsync(user, toRemove);
        if (toAdd.Count > 0)
            await _userManager.AddToRolesAsync(user, toAdd);

        return await ToDtoAsync(user);
    }

    public async Task SetLockoutAsync(Guid id, bool locked, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(id.ToString())
            ?? throw new NotFoundException("Người dùng", id);

        await _userManager.SetLockoutEnabledAsync(user, true);
        await _userManager.SetLockoutEndDateAsync(user, locked ? DateTimeOffset.UtcNow.AddYears(100) : null);
    }

    public async Task<IReadOnlyList<string>> GetAllRolesAsync(CancellationToken ct = default) =>
        await _roleManager.Roles.Select(r => r.Name!).ToListAsync(ct);

    private async Task<UserListItemDto> ToDtoAsync(ApplicationUser user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email!,
        PhoneNumber = user.PhoneNumber,
        Roles = (await _userManager.GetRolesAsync(user)).ToList(),
        EmailConfirmed = user.EmailConfirmed,
        IsLockedOut = await _userManager.IsLockedOutAsync(user),
        CreatedAt = user.CreatedAt
    };
}
