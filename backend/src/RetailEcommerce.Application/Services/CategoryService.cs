using AutoMapper;
using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.Common.Exceptions;
using RetailEcommerce.Application.DTOs.Categories;
using RetailEcommerce.Application.Interfaces.Repositories;
using RetailEcommerce.Application.Interfaces.Services;
using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CategoryService(ICategoryRepository repo, IUnitOfWork uow, IMapper mapper)
    {
        _repo = repo;
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken ct = default)
    {
        var categories = await _repo.GetTreeAsync(ct);   // flat, ordered, ParentCategory loaded
        var counts = await _repo.GetProductCountsAsync(ct);
        return categories
            .Select(c => ToDto(c, counts))
            .ToList();
    }

    public async Task<IReadOnlyList<CategoryDto>> GetTreeAsync(CancellationToken ct = default)
    {
        var categories = await _repo.GetTreeAsync(ct);
        var counts = await _repo.GetProductCountsAsync(ct);

        var lookup = categories.ToDictionary(c => c.Id, c => ToDto(c, counts));
        var roots = new List<CategoryDto>();
        foreach (var category in categories)
        {
            var dto = lookup[category.Id];
            if (category.ParentCategoryId is { } parentId && lookup.TryGetValue(parentId, out var parent))
                parent.Children.Add(dto);
            else
                roots.Add(dto);
        }
        return roots;
    }

    public async Task<CategoryDto> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var category = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Category), id);
        var counts = await _repo.GetProductCountsAsync(ct);
        return ToDto(category, counts);
    }

    public async Task<CategoryDto> CreateAsync(CategoryInputDto input, CancellationToken ct = default)
    {
        var slug = await EnsureUniqueSlugAsync(input.Slug, input.Name, null, ct);
        await ValidateParentAsync(input.ParentCategoryId, null, ct);

        var category = new Category
        {
            Name = input.Name.Trim(),
            Slug = slug,
            Description = input.Description,
            ImageUrl = input.ImageUrl,
            IsActive = input.IsActive,
            DisplayOrder = input.DisplayOrder,
            ParentCategoryId = input.ParentCategoryId
        };

        await _repo.AddAsync(category, ct);
        await _uow.SaveChangesAsync(ct);
        return await GetByIdAsync(category.Id, ct);
    }

    public async Task<CategoryDto> UpdateAsync(int id, CategoryInputDto input, CancellationToken ct = default)
    {
        var category = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Category), id);

        if (input.ParentCategoryId == id)
            throw new ConflictException("Danh mục không thể là danh mục cha của chính nó.");

        category.Name = input.Name.Trim();
        category.Slug = await EnsureUniqueSlugAsync(input.Slug, input.Name, id, ct);
        category.Description = input.Description;
        category.ImageUrl = input.ImageUrl;
        category.IsActive = input.IsActive;
        category.DisplayOrder = input.DisplayOrder;
        category.ParentCategoryId = input.ParentCategoryId;

        await ValidateParentAsync(input.ParentCategoryId, id, ct);

        _repo.Update(category);
        await _uow.SaveChangesAsync(ct);
        return await GetByIdAsync(category.Id, ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var category = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Category), id);

        if (await _repo.HasChildrenAsync(id, ct))
            throw new ConflictException("Không thể xoá danh mục đang có danh mục con.");
        if (await _repo.HasProductsAsync(id, ct))
            throw new ConflictException("Không thể xoá danh mục đang có sản phẩm.");

        _repo.Remove(category);
        await _uow.SaveChangesAsync(ct);
    }

    private CategoryDto ToDto(Category category, IReadOnlyDictionary<int, int> counts)
    {
        var dto = _mapper.Map<CategoryDto>(category);
        dto.Children = new List<CategoryDto>();   // hierarchy assembled by caller when needed
        dto.ProductCount = counts.GetValueOrDefault(category.Id);
        return dto;
    }

    private async Task<string> EnsureUniqueSlugAsync(string? slug, string name, int? excludeId, CancellationToken ct)
    {
        var baseSlug = string.IsNullOrWhiteSpace(slug) ? SlugGenerator.Generate(name) : SlugGenerator.Generate(slug);
        if (string.IsNullOrEmpty(baseSlug))
            baseSlug = "danh-muc";

        var candidate = baseSlug;
        var suffix = 1;
        while (await _repo.SlugExistsAsync(candidate, excludeId, ct))
            candidate = $"{baseSlug}-{++suffix}";
        return candidate;
    }

    private async Task ValidateParentAsync(int? parentId, int? selfId, CancellationToken ct)
    {
        if (parentId is null) return;
        var parent = await _repo.GetByIdAsync(parentId.Value, ct)
            ?? throw new NotFoundException(nameof(Category), parentId.Value);
        if (selfId is not null && parent.ParentCategoryId == selfId)
            throw new ConflictException("Quan hệ danh mục cha/con không hợp lệ (vòng lặp).");
    }
}
