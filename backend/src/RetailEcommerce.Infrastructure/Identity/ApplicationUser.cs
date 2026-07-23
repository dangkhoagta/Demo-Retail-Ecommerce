using Microsoft.AspNetCore.Identity;

namespace RetailEcommerce.Infrastructure.Identity;

/// <summary>Application user backed by ASP.NET Core Identity (GUID keyed).</summary>
public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
