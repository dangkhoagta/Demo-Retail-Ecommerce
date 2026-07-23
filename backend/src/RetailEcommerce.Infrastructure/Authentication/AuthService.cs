using Microsoft.AspNetCore.Identity;
using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.Common.Exceptions;
using RetailEcommerce.Application.DTOs.Auth;
using RetailEcommerce.Application.Interfaces;
using RetailEcommerce.Infrastructure.Identity;

namespace RetailEcommerce.Infrastructure.Authentication;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public AuthService(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await _userManager.FindByEmailAsync(email) is not null)
            throw new ConflictException("Email này đã được đăng ký.");

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            throw new ConflictException(string.Join(" ", result.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, AppRoles.Customer);
        return await BuildAuthResponseAsync(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        if (await _userManager.IsLockedOutAsync(user))
            throw new UnauthorizedAccessException("Tài khoản đã bị khoá.");

        return await BuildAuthResponseAsync(user);
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException("Người dùng", userId);
        var roles = await _userManager.GetRolesAsync(user);
        return ToDto(user, roles);
    }

    private async Task<AuthResponse> BuildAuthResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var (token, expires) = _tokenService.CreateToken(user.Id, user.UserName!, user.Email!, roles);
        return new AuthResponse
        {
            Token = token,
            ExpiresAtUtc = expires,
            User = ToDto(user, roles)
        };
    }

    private static UserDto ToDto(ApplicationUser user, IList<string> roles) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email!,
        PhoneNumber = user.PhoneNumber,
        Roles = roles.ToList(),
        CreatedAt = user.CreatedAt
    };
}
