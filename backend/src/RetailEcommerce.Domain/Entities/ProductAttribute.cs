using RetailEcommerce.Domain.Common;

namespace RetailEcommerce.Domain.Entities;

/// <summary>
/// A name/value specification attached to a product
/// (e.g. "Chất liệu" = "Cotton 100%", "Xuất xứ" = "Việt Nam").
/// </summary>
public class ProductAttribute : AuditableEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string Name { get; set; } = null!;
    public string Value { get; set; } = null!;
    public int DisplayOrder { get; set; }
}
