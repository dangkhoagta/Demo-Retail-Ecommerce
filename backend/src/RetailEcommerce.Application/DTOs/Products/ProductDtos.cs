namespace RetailEcommerce.Application.DTOs.Products;

/// <summary>Lightweight product row for catalogue/admin listings.</summary>
public class ProductListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Sku { get; set; } = null!;
    public string? ShortDescription { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public string Currency { get; set; } = "VND";
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public int BrandId { get; set; }
    public string BrandName { get; set; } = null!;
    public string? PrimaryImageUrl { get; set; }
    public int TotalStock { get; set; }
}

/// <summary>Full product detail including images, variants, attributes and price history.</summary>
public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Sku { get; set; } = null!;
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public string Currency { get; set; } = "VND";
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public int BrandId { get; set; }
    public string BrandName { get; set; } = null!;

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public List<ProductImageDto> Images { get; set; } = new();
    public List<ProductVariantDto> Variants { get; set; } = new();
    public List<ProductAttributeDto> Attributes { get; set; } = new();
    public List<PriceHistoryDto> PriceHistory { get; set; } = new();
}

public class ProductImageDto
{
    public int Id { get; set; }
    public string Url { get; set; } = null!;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public class ProductVariantDto
{
    public int Id { get; set; }
    public string Sku { get; set; } = null!;
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public bool IsActive { get; set; }
    public string? Color { get; set; }
    public string? Size { get; set; }
    public int QuantityAvailable { get; set; }
}

public class ProductAttributeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Value { get; set; } = null!;
    public int DisplayOrder { get; set; }
}

public class PriceHistoryDto
{
    public int Id { get; set; }
    public decimal OldPrice { get; set; }
    public decimal NewPrice { get; set; }
    public DateTime ChangedAt { get; set; }
    public string? ChangedBy { get; set; }
    public string? Reason { get; set; }
}
