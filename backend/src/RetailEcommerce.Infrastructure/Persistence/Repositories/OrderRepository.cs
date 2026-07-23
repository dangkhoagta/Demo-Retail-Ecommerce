using Microsoft.EntityFrameworkCore;
using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.Interfaces.Repositories;
using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Infrastructure.Persistence.Repositories;

public class OrderRepository : RepositoryBase<Order>, IOrderRepository
{
    public OrderRepository(ApplicationDbContext context) : base(context) { }

    public Task<Order?> GetByIdWithItemsAsync(int id, CancellationToken ct = default) =>
        Set.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id, ct);

    public Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default) =>
        Set.Include(o => o.Items).AsNoTracking().FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);

    public async Task<PagedResult<Order>> GetPagedAsync(OrderQuery query, CancellationToken ct = default)
    {
        var q = Set.Include(o => o.Items).AsNoTracking().AsQueryable();

        if (query.Status is { } status) q = q.Where(o => o.Status == status);
        if (query.CustomerId is { } customerId) q = q.Where(o => o.CustomerId == customerId);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            q = q.Where(o =>
                EF.Functions.ILike(o.OrderNumber, $"%{term}%") ||
                EF.Functions.ILike(o.CustomerName, $"%{term}%") ||
                EF.Functions.ILike(o.CustomerPhone, $"%{term}%"));
        }

        q = (query.SortBy?.ToLowerInvariant()) switch
        {
            "total" => query.SortDescending ? q.OrderByDescending(o => o.Total) : q.OrderBy(o => o.Total),
            "status" => query.SortDescending ? q.OrderByDescending(o => o.Status) : q.OrderBy(o => o.Status),
            _ => query.SortDescending ? q.OrderBy(o => o.OrderDate) : q.OrderByDescending(o => o.OrderDate),
        };

        var total = await q.CountAsync(ct);
        var items = await q.Skip(query.Skip).Take(query.PageSize).ToListAsync(ct);
        return new PagedResult<Order>(items, total, query.Page, query.PageSize);
    }

    public Task<int> CountForDateAsync(DateOnly date, CancellationToken ct = default)
    {
        var start = DateTime.SpecifyKind(date.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        var end = start.AddDays(1);
        // Ignore soft-delete filter so cancelled/removed orders don't cause number reuse.
        return Set.IgnoreQueryFilters().CountAsync(o => o.OrderDate >= start && o.OrderDate < end, ct);
    }
}
