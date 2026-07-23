using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.DTOs.Products;

namespace RetailEcommerce.Application.Interfaces.Services;

public interface IProductService
{
    Task<PagedResult<ProductListItemDto>> GetPagedAsync(ProductQuery query, CancellationToken ct = default);
    Task<ProductDto> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ProductDto> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<ProductDto> CreateAsync(ProductCreateDto input, CancellationToken ct = default);
    Task<ProductDto> UpdateAsync(int id, ProductUpdateDto input, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
