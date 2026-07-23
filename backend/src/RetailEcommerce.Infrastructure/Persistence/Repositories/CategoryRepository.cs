using Microsoft.EntityFrameworkCore;
using RetailEcommerce.Application.Interfaces.Repositories;
using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Infrastructure.Persistence.Repositories;

public class CategoryRepository : RepositoryBase<Category>, ICategoryRepository
{
    public CategoryRepository(ApplicationDbContext context) : base(context) { }

    public Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        Set.FirstOrDefaultAsync(c => c.Slug == slug, ct);

    public async Task<IReadOnlyList<Category>> GetTreeAsync(CancellationToken ct = default) =>
        await Set.Include(c => c.ParentCategory)
            .OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name)
            .AsNoTracking()
            .ToListAsync(ct);

    public Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken ct = default) =>
        Set.AnyAsync(c => c.Slug == slug && (excludeId == null || c.Id != excludeId), ct);

    public Task<bool> HasProductsAsync(int categoryId, CancellationToken ct = default) =>
        Context.Products.AnyAsync(p => p.CategoryId == categoryId, ct);

    public Task<bool> HasChildrenAsync(int categoryId, CancellationToken ct = default) =>
        Set.AnyAsync(c => c.ParentCategoryId == categoryId, ct);

    public async Task<IReadOnlyDictionary<int, int>> GetProductCountsAsync(CancellationToken ct = default)
    {
        var counts = await Context.Products
            .GroupBy(p => p.CategoryId)
            .Select(g => new { CategoryId = g.Key, Count = g.Count() })
            .ToListAsync(ct);
        return counts.ToDictionary(x => x.CategoryId, x => x.Count);
    }
}
