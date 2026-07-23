namespace RetailEcommerce.Application.DTOs.Products;

/// <summary>Create payload for a product together with its images, variants and attributes.</summary>
public class ProductCreateDto
{
    public string Name { get; set; } = null!;
    public string? Slug { get; set; }
    public string Sku { get; set; } = null!;
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public string Currency { get; set; } = "VND";
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public int CategoryId { get; set; }
    public int BrandId { get; set; }

    public List<ProductImageInputDto> Images { get; set; } = new();
    public List<ProductVariantInputDto> Variants { get; set; } = new();
    public List<ProductAttributeInputDto> Attributes { get; set; } = new();
}

/// <summary>
/// Update payload. Scalar fields are patched; the Images/Variants/Attributes collections
/// are synced (rows with Id are updated, rows without Id are added, missing rows removed).
/// Changing <see cref="BasePrice"/> records a <c>PriceHistory</c> entry.
/// </summary>
public class ProductUpdateDto
{
    public string Name { get; set; } = null!;
    public string? Slug { get; set; }
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public string Currency { get; set; } = "VND";
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public int CategoryId { get; set; }
    public int BrandId { get; set; }
    public string? PriceChangeReason { get; set; }

    public List<ProductImageInputDto> Images { get; set; } = new();
    public List<ProductVariantInputDto> Variants { get; set; } = new();
    public List<ProductAttributeInputDto> Attributes { get; set; } = new();
}

public class ProductImageInputDto
{
    public int? Id { get; set; }
    public string Url { get; set; } = null!;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public class ProductVariantInputDto
{
    public int? Id { get; set; }
    public string Sku { get; set; } = null!;
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Color { get; set; }
    public string? Size { get; set; }
    public int QuantityOnHand { get; set; }
    public int ReorderThreshold { get; set; }
}

public class ProductAttributeInputDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = null!;
    public string Value { get; set; } = null!;
    public int DisplayOrder { get; set; }
}
