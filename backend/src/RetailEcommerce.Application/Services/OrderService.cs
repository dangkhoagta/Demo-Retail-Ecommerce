using AutoMapper;
using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.Common.Exceptions;
using RetailEcommerce.Application.DTOs.Orders;
using RetailEcommerce.Application.Interfaces.Repositories;
using RetailEcommerce.Application.Interfaces.Services;
using RetailEcommerce.Domain.Entities;
using RetailEcommerce.Domain.Enums;

namespace RetailEcommerce.Application.Services;

public class OrderService : IOrderService
{
    // Simple flat-rate shipping for the COD demo.
    private const decimal ShippingFeeFlat = 30_000m;
    private const decimal FreeShippingThreshold = 500_000m;

    private readonly IOrderRepository _repo;
    private readonly IProductRepository _productRepo;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public OrderService(IOrderRepository repo, IProductRepository productRepo, IUnitOfWork uow, IMapper mapper)
    {
        _repo = repo;
        _productRepo = productRepo;
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<OrderDto> CreateAsync(CreateOrderDto input, Guid? customerId, CancellationToken ct = default)
    {
        if (input.Items is null || input.Items.Count == 0)
            throw new ConflictException("Đơn hàng phải có ít nhất một sản phẩm.");

        var now = DateTime.UtcNow;
        var order = new Order
        {
            CustomerId = customerId,
            CustomerName = input.CustomerName.Trim(),
            CustomerPhone = input.CustomerPhone.Trim(),
            CustomerEmail = input.CustomerEmail,
            ShippingAddress = input.ShippingAddress.Trim(),
            ShippingCity = input.ShippingCity.Trim(),
            ShippingDistrict = input.ShippingDistrict,
            ShippingWard = input.ShippingWard,
            Notes = input.Notes,
            Status = OrderStatus.Pending,
            PaymentMethod = PaymentMethod.CashOnDelivery,
            OrderDate = now
        };

        decimal subtotal = 0m;
        // Merge duplicate variant lines so stock is checked once per variant.
        var lines = input.Items
            .GroupBy(i => i.ProductVariantId)
            .Select(g => (VariantId: g.Key, Quantity: g.Sum(x => x.Quantity)));

        foreach (var line in lines)
        {
            if (line.Quantity <= 0)
                throw new ConflictException("Số lượng sản phẩm phải lớn hơn 0.");

            var variant = await _productRepo.GetVariantWithInventoryAsync(line.VariantId, ct)
                ?? throw new NotFoundException(nameof(ProductVariant), line.VariantId);

            if (!variant.IsActive)
                throw new ConflictException($"Sản phẩm '{variant.Name}' hiện không còn kinh doanh.");

            var available = variant.Inventory?.QuantityAvailable ?? 0;
            if (available < line.Quantity)
                throw new ConflictException($"Sản phẩm '{variant.Name}' chỉ còn {available} trong kho.");

            // COD: reduce on-hand stock at order time.
            variant.Inventory!.QuantityOnHand -= line.Quantity;

            var lineTotal = variant.Price * line.Quantity;
            subtotal += lineTotal;

            order.Items.Add(new OrderItem
            {
                ProductVariantId = variant.Id,
                ProductName = variant.Product?.Name is { } pn ? $"{pn} - {variant.Name}" : variant.Name,
                Sku = variant.Sku,
                UnitPrice = variant.Price,
                Quantity = line.Quantity,
                LineTotal = lineTotal
            });
        }

        order.Subtotal = subtotal;
        order.ShippingFee = subtotal >= FreeShippingThreshold ? 0m : ShippingFeeFlat;
        order.Total = order.Subtotal + order.ShippingFee;
        order.OrderNumber = await GenerateOrderNumberAsync(now, ct);

        await _repo.AddAsync(order, ct);
        await _uow.SaveChangesAsync(ct);
        return await GetByIdAsync(order.Id, ct);
    }

    public async Task<PagedResult<OrderListItemDto>> GetPagedAsync(OrderQuery query, CancellationToken ct = default)
    {
        var page = await _repo.GetPagedAsync(query, ct);
        return page.Map(o => _mapper.Map<OrderListItemDto>(o));
    }

    public async Task<OrderDto> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var order = await _repo.GetByIdWithItemsAsync(id, ct)
            ?? throw new NotFoundException(nameof(Order), id);
        return _mapper.Map<OrderDto>(order);
    }

    public async Task<OrderDto> UpdateStatusAsync(int id, OrderStatus status, CancellationToken ct = default)
    {
        var order = await _repo.GetByIdWithItemsAsync(id, ct)
            ?? throw new NotFoundException(nameof(Order), id);

        if (order.Status == OrderStatus.Cancelled && status != OrderStatus.Cancelled)
            throw new ConflictException("Đơn đã huỷ không thể chuyển sang trạng thái khác.");

        order.Status = status;
        _repo.Update(order);
        await _uow.SaveChangesAsync(ct);
        return _mapper.Map<OrderDto>(order);
    }

    private async Task<string> GenerateOrderNumberAsync(DateTime date, CancellationToken ct)
    {
        var day = DateOnly.FromDateTime(date);
        var seq = await _repo.CountForDateAsync(day, ct) + 1;
        return $"OD{day:yyyyMMdd}-{seq:D4}";
    }
}
