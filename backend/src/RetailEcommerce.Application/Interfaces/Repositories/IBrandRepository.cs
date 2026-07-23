using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Application.Interfaces.Repositories;

public interface IBrandRepository : IRepository<Brand>
{
    Task<Brand?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken ct = default);
    Task<bool> HasProductsAsync(int brandId, CancellationToken ct = default);

    /// <summary>Map of brand id → active product count (single GROUP BY query).</summary>
    Task<IReadOnlyDictionary<int, int>> GetProductCountsAsync(CancellationToken ct = default);
}
