using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.DTOs.Users;
using RetailEcommerce.Application.Interfaces.Services;

namespace RetailEcommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = AppRoles.Admin)]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<PagedResult<UserListItemDto>>> Get([FromQuery] UserQuery query, CancellationToken ct)
        => Ok(await _service.GetPagedAsync(query, ct));

    [HttpGet("roles")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetRoles(CancellationToken ct)
        => Ok(await _service.GetAllRolesAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserListItemDto>> GetById(Guid id, CancellationToken ct)
        => Ok(await _service.GetByIdAsync(id, ct));

    [HttpPut("{id:guid}/roles")]
    public async Task<ActionResult<UserListItemDto>> UpdateRoles(Guid id, UpdateUserRolesDto input, CancellationToken ct)
        => Ok(await _service.UpdateRolesAsync(id, input.Roles, ct));

    [HttpPut("{id:guid}/lockout")]
    public async Task<IActionResult> SetLockout(Guid id, SetLockoutDto input, CancellationToken ct)
    {
        await _service.SetLockoutAsync(id, input.Locked, ct);
        return NoContent();
    }
}
