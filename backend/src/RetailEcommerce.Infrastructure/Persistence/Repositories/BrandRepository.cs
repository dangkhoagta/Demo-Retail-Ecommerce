using Microsoft.EntityFrameworkCore;
using RetailEcommerce.Application.Interfaces.Repositories;
using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Infrastructure.Persistence.Repositories;

public class BrandRepository : RepositoryBase<Brand>, IBrandRepository
{
    public BrandRepository(ApplicationDbContext context) : base(context) { }

    public Task<Brand?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        Set.FirstOrDefaultAsync(b => b.Slug == slug, ct);

    public Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken ct = default) =>
        Set.AnyAsync(b => b.Slug == slug && (excludeId == null || b.Id != excludeId), ct);

    public Task<bool> HasProductsAsync(int brandId, CancellationToken ct = default) =>
        Context.Products.AnyAsync(p => p.BrandId == brandId, ct);

    public async Task<IReadOnlyDictionary<int, int>> GetProductCountsAsync(CancellationToken ct = default)
    {
        var counts = await Context.Products
            .GroupBy(p => p.BrandId)
            .Select(g => new { BrandId = g.Key, Count = g.Count() })
            .ToListAsync(ct);
        return counts.ToDictionary(x => x.BrandId, x => x.Count);
    }
}
