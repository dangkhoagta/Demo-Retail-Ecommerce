using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.DTOs.Orders;
using RetailEcommerce.Domain.Enums;

namespace RetailEcommerce.Application.Interfaces.Services;

public interface IOrderService
{
    /// <summary>Places an order (COD). <paramref name="customerId"/> is null for guest checkout.</summary>
    Task<OrderDto> CreateAsync(CreateOrderDto input, Guid? customerId, CancellationToken ct = default);
    Task<PagedResult<OrderListItemDto>> GetPagedAsync(OrderQuery query, CancellationToken ct = default);
    Task<OrderDto> GetByIdAsync(int id, CancellationToken ct = default);
    Task<OrderDto> UpdateStatusAsync(int id, OrderStatus status, CancellationToken ct = default);
}
