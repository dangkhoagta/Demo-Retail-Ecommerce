using AutoMapper;
using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.Common.Exceptions;
using RetailEcommerce.Application.DTOs.Brands;
using RetailEcommerce.Application.Interfaces.Repositories;
using RetailEcommerce.Application.Interfaces.Services;
using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Application.Services;

public class BrandService : IBrandService
{
    private readonly IBrandRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public BrandService(IBrandRepository repo, IUnitOfWork uow, IMapper mapper)
    {
        _repo = repo;
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<BrandDto>> GetAllAsync(CancellationToken ct = default)
    {
        var brands = await _repo.ListAllAsync(ct);
        var counts = await _repo.GetProductCountsAsync(ct);
        return brands
            .OrderBy(b => b.Name)
            .Select(b => ToDto(b, counts))
            .ToList();
    }

    public async Task<BrandDto> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var brand = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Brand), id);
        var counts = await _repo.GetProductCountsAsync(ct);
        return ToDto(brand, counts);
    }

    public async Task<BrandDto> CreateAsync(BrandInputDto input, CancellationToken ct = default)
    {
        var brand = new Brand
        {
            Name = input.Name.Trim(),
            Slug = await EnsureUniqueSlugAsync(input.Slug, input.Name, null, ct),
            Description = input.Description,
            LogoUrl = input.LogoUrl,
            Website = input.Website,
            IsActive = input.IsActive
        };
        await _repo.AddAsync(brand, ct);
        await _uow.SaveChangesAsync(ct);
        return await GetByIdAsync(brand.Id, ct);
    }

    public async Task<BrandDto> UpdateAsync(int id, BrandInputDto input, CancellationToken ct = default)
    {
        var brand = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Brand), id);

        brand.Name = input.Name.Trim();
        brand.Slug = await EnsureUniqueSlugAsync(input.Slug, input.Name, id, ct);
        brand.Description = input.Description;
        brand.LogoUrl = input.LogoUrl;
        brand.Website = input.Website;
        brand.IsActive = input.IsActive;

        _repo.Update(brand);
        await _uow.SaveChangesAsync(ct);
        return await GetByIdAsync(brand.Id, ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var brand = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Brand), id);
        if (await _repo.HasProductsAsync(id, ct))
            throw new ConflictException("Không thể xoá thương hiệu đang có sản phẩm.");

        _repo.Remove(brand);
        await _uow.SaveChangesAsync(ct);
    }

    private BrandDto ToDto(Brand brand, IReadOnlyDictionary<int, int> counts)
    {
        var dto = _mapper.Map<BrandDto>(brand);
        dto.ProductCount = counts.GetValueOrDefault(brand.Id);
        return dto;
    }

    private async Task<string> EnsureUniqueSlugAsync(string? slug, string name, int? excludeId, CancellationToken ct)
    {
        var baseSlug = SlugGenerator.Generate(string.IsNullOrWhiteSpace(slug) ? name : slug);
        if (string.IsNullOrEmpty(baseSlug)) baseSlug = "thuong-hieu";
        var candidate = baseSlug;
        var suffix = 1;
        while (await _repo.SlugExistsAsync(candidate, excludeId, ct))
            candidate = $"{baseSlug}-{++suffix}";
        return candidate;
    }
}
