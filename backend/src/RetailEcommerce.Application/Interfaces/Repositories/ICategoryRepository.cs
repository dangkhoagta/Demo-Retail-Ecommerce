using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Application.Interfaces.Repositories;

public interface ICategoryRepository : IRepository<Category>
{
    Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<IReadOnlyList<Category>> GetTreeAsync(CancellationToken ct = default);
    Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken ct = default);
    Task<bool> HasProductsAsync(int categoryId, CancellationToken ct = default);
    Task<bool> HasChildrenAsync(int categoryId, CancellationToken ct = default);

    /// <summary>Map of category id → active product count (single GROUP BY query).</summary>
    Task<IReadOnlyDictionary<int, int>> GetProductCountsAsync(CancellationToken ct = default);
}
