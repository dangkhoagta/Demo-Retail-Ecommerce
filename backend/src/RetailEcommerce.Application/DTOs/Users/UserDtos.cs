using RetailEcommerce.Application.Common;

namespace RetailEcommerce.Application.DTOs.Users;

public class UserListItemDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public IReadOnlyList<string> Roles { get; set; } = Array.Empty<string>();
    public bool EmailConfirmed { get; set; }
    public bool IsLockedOut { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateUserRolesDto
{
    public List<string> Roles { get; set; } = new();
}

public class SetLockoutDto
{
    public bool Locked { get; set; }
}

public class UserQuery : PagedQuery
{
    public string? Role { get; set; }
}
