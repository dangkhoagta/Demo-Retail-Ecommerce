using Microsoft.EntityFrameworkCore;
using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.Interfaces.Repositories;
using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Infrastructure.Persistence.Repositories;

public class ProductRepository : RepositoryBase<Product>, IProductRepository
{
    public ProductRepository(ApplicationDbContext context) : base(context) { }

    public Task<Product?> GetByIdWithDetailsAsync(int id, CancellationToken ct = default) =>
        DetailQuery().FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<Product?> GetBySlugWithDetailsAsync(string slug, CancellationToken ct = default) =>
        DetailQuery().AsNoTracking().FirstOrDefaultAsync(p => p.Slug == slug, ct);

    public async Task<PagedResult<Product>> GetPagedAsync(ProductQuery query, CancellationToken ct = default)
    {
        var q = Set
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Include(p => p.Variants).ThenInclude(v => v.Inventory)
            .AsNoTracking()
            .AsSplitQuery()
            .AsQueryable();

        if (query.CategoryId is { } catId) q = q.Where(p => p.CategoryId == catId);
        if (query.BrandId is { } brandId) q = q.Where(p => p.BrandId == brandId);
        if (query.MinPrice is { } min) q = q.Where(p => p.BasePrice >= min);
        if (query.MaxPrice is { } max) q = q.Where(p => p.BasePrice <= max);
        if (query.IsActive is { } active) q = q.Where(p => p.IsActive == active);
        if (query.IsFeatured is { } featured) q = q.Where(p => p.IsFeatured == featured);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            q = q.Where(p =>
                EF.Functions.ILike(p.Name, $"%{term}%") ||
                EF.Functions.ILike(p.Sku, $"%{term}%") ||
                (p.ShortDescription != null && EF.Functions.ILike(p.ShortDescription, $"%{term}%")));
        }

        q = (query.SortBy?.ToLowerInvariant()) switch
        {
            "name" => query.SortDescending ? q.OrderByDescending(p => p.Name) : q.OrderBy(p => p.Name),
            "price" => query.SortDescending ? q.OrderByDescending(p => p.BasePrice) : q.OrderBy(p => p.BasePrice),
            _ => query.SortDescending ? q.OrderBy(p => p.CreatedAt) : q.OrderByDescending(p => p.CreatedAt),
        };

        var total = await q.CountAsync(ct);
        var items = await q.Skip(query.Skip).Take(query.PageSize).ToListAsync(ct);
        return new PagedResult<Product>(items, total, query.Page, query.PageSize);
    }

    public Task<bool> SkuExistsAsync(string sku, int? excludeId = null, CancellationToken ct = default) =>
        Set.AnyAsync(p => p.Sku == sku && (excludeId == null || p.Id != excludeId), ct);

    public Task<ProductVariant?> GetVariantWithInventoryAsync(int variantId, CancellationToken ct = default) =>
        Context.ProductVariants
            .Include(v => v.Inventory)
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == variantId, ct);

    private IQueryable<Product> DetailQuery() =>
        Set.Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Include(p => p.Variants).ThenInclude(v => v.Inventory)
            .Include(p => p.Attributes)
            .Include(p => p.PriceHistories)
            .AsSplitQuery();
}
