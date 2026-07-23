namespace RetailEcommerce.Infrastructure.Authentication;

/// <summary>Bound from the "Jwt" configuration section.</summary>
public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "RetailEcommerce";
    public string Audience { get; set; } = "RetailEcommerce.Client";
    public string Key { get; set; } = null!;
    public int ExpiryMinutes { get; set; } = 480;
}
