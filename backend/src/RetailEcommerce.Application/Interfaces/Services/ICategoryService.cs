using RetailEcommerce.Application.DTOs.Categories;

namespace RetailEcommerce.Application.Interfaces.Services;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<CategoryDto>> GetTreeAsync(CancellationToken ct = default);
    Task<CategoryDto> GetByIdAsync(int id, CancellationToken ct = default);
    Task<CategoryDto> CreateAsync(CategoryInputDto input, CancellationToken ct = default);
    Task<CategoryDto> UpdateAsync(int id, CategoryInputDto input, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
