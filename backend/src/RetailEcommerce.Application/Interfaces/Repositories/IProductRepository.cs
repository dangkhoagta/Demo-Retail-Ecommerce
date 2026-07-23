using RetailEcommerce.Application.Common;
using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Application.Interfaces.Repositories;

public interface IProductRepository : IRepository<Product>
{
    /// <summary>Loads a product with category, brand, images, variants (+ inventory), attributes and price history.</summary>
    Task<Product?> GetByIdWithDetailsAsync(int id, CancellationToken ct = default);
    Task<Product?> GetBySlugWithDetailsAsync(string slug, CancellationToken ct = default);

    Task<PagedResult<Product>> GetPagedAsync(ProductQuery query, CancellationToken ct = default);
    Task<bool> SkuExistsAsync(string sku, int? excludeId = null, CancellationToken ct = default);

    /// <summary>Loads a single variant together with its inventory (used at checkout).</summary>
    Task<ProductVariant?> GetVariantWithInventoryAsync(int variantId, CancellationToken ct = default);
}
