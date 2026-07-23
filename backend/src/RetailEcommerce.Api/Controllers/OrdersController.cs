using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.DTOs.Orders;
using RetailEcommerce.Application.Interfaces;
using RetailEcommerce.Application.Interfaces.Services;

namespace RetailEcommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _service;
    private readonly ICurrentUserService _currentUser;

    public OrdersController(IOrderService service, ICurrentUserService currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    /// <summary>Đặt hàng (COD). Cho phép cả khách vãng lai và khách đã đăng nhập.</summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<OrderDto>> Checkout(CreateOrderDto input, CancellationToken ct)
    {
        var order = await _service.CreateAsync(input, _currentUser.UserId, ct);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    /// <summary>Danh sách đơn hàng (quản trị).</summary>
    [HttpGet]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<PagedResult<OrderListItemDto>>> Get([FromQuery] OrderQuery query, CancellationToken ct)
        => Ok(await _service.GetPagedAsync(query, ct));

    /// <summary>Đơn hàng của khách đang đăng nhập.</summary>
    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<PagedResult<OrderListItemDto>>> My([FromQuery] OrderQuery query, CancellationToken ct)
    {
        if (_currentUser.UserId is not { } userId)
            return Unauthorized();
        query.CustomerId = userId;
        return Ok(await _service.GetPagedAsync(query, ct));
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<ActionResult<OrderDto>> GetById(int id, CancellationToken ct)
    {
        var order = await _service.GetByIdAsync(id, ct);
        // Customers may only view their own orders; admins can view any.
        if (!_currentUser.IsInRole(AppRoles.Admin) && order.CustomerId != _currentUser.UserId)
            return Forbid();
        return Ok(order);
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<OrderDto>> UpdateStatus(int id, UpdateOrderStatusDto input, CancellationToken ct)
        => Ok(await _service.UpdateStatusAsync(id, input.Status, ct));
}
