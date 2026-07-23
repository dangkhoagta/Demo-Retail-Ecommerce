using RetailEcommerce.Application.DTOs.Brands;

namespace RetailEcommerce.Application.Interfaces.Services;

public interface IBrandService
{
    Task<IReadOnlyList<BrandDto>> GetAllAsync(CancellationToken ct = default);
    Task<BrandDto> GetByIdAsync(int id, CancellationToken ct = default);
    Task<BrandDto> CreateAsync(BrandInputDto input, CancellationToken ct = default);
    Task<BrandDto> UpdateAsync(int id, BrandInputDto input, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
