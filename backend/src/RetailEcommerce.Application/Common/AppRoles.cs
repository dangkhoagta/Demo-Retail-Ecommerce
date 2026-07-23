namespace RetailEcommerce.Application.Common;

/// <summary>Canonical role names used across authorization and seeding.</summary>
public static class AppRoles
{
    public const string Admin = "Admin";
    public const string Customer = "Customer";

    public static readonly IReadOnlyList<string> All = new[] { Admin, Customer };
}
