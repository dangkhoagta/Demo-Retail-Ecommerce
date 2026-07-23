using RetailEcommerce.Application.Common;
using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Application.Interfaces.Repositories;

public interface IOrderRepository : IRepository<Order>
{
    Task<Order?> GetByIdWithItemsAsync(int id, CancellationToken ct = default);
    Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default);
    Task<PagedResult<Order>> GetPagedAsync(OrderQuery query, CancellationToken ct = default);
    Task<int> CountForDateAsync(DateOnly date, CancellationToken ct = default);
}
