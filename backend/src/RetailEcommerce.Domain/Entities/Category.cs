using RetailEcommerce.Domain.Common;

namespace RetailEcommerce.Domain.Entities;

/// <summary>Product category. Supports a self-referencing parent/child hierarchy.</summary>
public class Category : AuditableEntity
{
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }

    // Self reference (hierarchy)
    public int? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public ICollection<Category> Children { get; set; } = new List<Category>();

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
