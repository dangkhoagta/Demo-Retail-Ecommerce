using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.DTOs.Products;
using RetailEcommerce.Application.Interfaces.Services;

namespace RetailEcommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service) => _service = service;

    /// <summary>Danh sách sản phẩm có phân trang, lọc theo danh mục/thương hiệu/giá và tìm kiếm.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<ProductListItemDto>>> Get([FromQuery] ProductQuery query, CancellationToken ct)
        => Ok(await _service.GetPagedAsync(query, ct));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductDto>> GetById(int id, CancellationToken ct)
        => Ok(await _service.GetByIdAsync(id, ct));

    [HttpGet("slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductDto>> GetBySlug(string slug, CancellationToken ct)
        => Ok(await _service.GetBySlugAsync(slug, ct));

    [HttpPost]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<ProductDto>> Create(ProductCreateDto input, CancellationToken ct)
    {
        var created = await _service.CreateAsync(input, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<ProductDto>> Update(int id, ProductUpdateDto input, CancellationToken ct)
        => Ok(await _service.UpdateAsync(id, input, ct));

    [HttpDelete("{id:int}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
