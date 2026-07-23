using Microsoft.AspNetCore.Identity;

namespace RetailEcommerce.Infrastructure.Identity;

/// <summary>Application role (GUID keyed) — e.g. Admin, Customer.</summary>
public class ApplicationRole : IdentityRole<Guid>
{
    public ApplicationRole() { }
    public ApplicationRole(string roleName) : base(roleName) { }
}
