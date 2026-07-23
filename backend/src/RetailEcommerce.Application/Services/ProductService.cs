using AutoMapper;
using RetailEcommerce.Application.Common;
using RetailEcommerce.Application.Common.Exceptions;
using RetailEcommerce.Application.DTOs.Products;
using RetailEcommerce.Application.Interfaces;
using RetailEcommerce.Application.Interfaces.Repositories;
using RetailEcommerce.Application.Interfaces.Services;
using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly IBrandRepository _brandRepo;
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public ProductService(
        IProductRepository repo,
        ICategoryRepository categoryRepo,
        IBrandRepository brandRepo,
        IUnitOfWork uow,
        IMapper mapper,
        ICurrentUserService currentUser)
    {
        _repo = repo;
        _categoryRepo = categoryRepo;
        _brandRepo = brandRepo;
        _uow = uow;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<ProductListItemDto>> GetPagedAsync(ProductQuery query, CancellationToken ct = default)
    {
        var page = await _repo.GetPagedAsync(query, ct);
        return page.Map(p => _mapper.Map<ProductListItemDto>(p));
    }

    public async Task<ProductDto> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var product = await _repo.GetByIdWithDetailsAsync(id, ct)
            ?? throw new NotFoundException(nameof(Product), id);
        return _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var product = await _repo.GetBySlugWithDetailsAsync(slug, ct)
            ?? throw new NotFoundException($"Sản phẩm với slug '{slug}' không tồn tại.");
        return _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto> CreateAsync(ProductCreateDto input, CancellationToken ct = default)
    {
        await EnsureCategoryAndBrandAsync(input.CategoryId, input.BrandId, ct);

        if (await _repo.SkuExistsAsync(input.Sku.Trim(), null, ct))
            throw new ConflictException($"SKU '{input.Sku}' đã tồn tại.");

        var product = new Product
        {
            Name = input.Name.Trim(),
            Slug = await EnsureUniqueSlugAsync(input.Slug, input.Name, null, ct),
            Sku = input.Sku.Trim(),
            ShortDescription = input.ShortDescription,
            Description = input.Description,
            BasePrice = input.BasePrice,
            CompareAtPrice = input.CompareAtPrice,
            Currency = string.IsNullOrWhiteSpace(input.Currency) ? "VND" : input.Currency,
            IsActive = input.IsActive,
            IsFeatured = input.IsFeatured,
            CategoryId = input.CategoryId,
            BrandId = input.BrandId
        };

        foreach (var img in input.Images)
            product.Images.Add(NewImage(img));
        foreach (var variant in input.Variants)
            product.Variants.Add(NewVariant(variant));
        foreach (var attr in input.Attributes)
            product.Attributes.Add(NewAttribute(attr));

        // Seed the price history with the opening price.
        product.PriceHistories.Add(new PriceHistory
        {
            OldPrice = input.BasePrice,
            NewPrice = input.BasePrice,
            ChangedAt = DateTime.UtcNow,
            ChangedBy = _currentUser.UserName ?? _currentUser.Email,
            Reason = "Giá khởi tạo"
        });

        await _repo.AddAsync(product, ct);
        await _uow.SaveChangesAsync(ct);
        return await GetByIdAsync(product.Id, ct);
    }

    public async Task<ProductDto> UpdateAsync(int id, ProductUpdateDto input, CancellationToken ct = default)
    {
        var product = await _repo.GetByIdWithDetailsAsync(id, ct)
            ?? throw new NotFoundException(nameof(Product), id);

        await EnsureCategoryAndBrandAsync(input.CategoryId, input.BrandId, ct);

        // Record a price-history entry when the base price actually changes.
        if (product.BasePrice != input.BasePrice)
        {
            product.PriceHistories.Add(new PriceHistory
            {
                ProductId = product.Id,
                OldPrice = product.BasePrice,
                NewPrice = input.BasePrice,
                ChangedAt = DateTime.UtcNow,
                ChangedBy = _currentUser.UserName ?? _currentUser.Email,
                Reason = string.IsNullOrWhiteSpace(input.PriceChangeReason) ? "Cập nhật giá" : input.PriceChangeReason
            });
        }

        product.Name = input.Name.Trim();
        product.Slug = await EnsureUniqueSlugAsync(input.Slug, input.Name, id, ct);
        product.ShortDescription = input.ShortDescription;
        product.Description = input.Description;
        product.BasePrice = input.BasePrice;
        product.CompareAtPrice = input.CompareAtPrice;
        product.Currency = string.IsNullOrWhiteSpace(input.Currency) ? "VND" : input.Currency;
        product.IsActive = input.IsActive;
        product.IsFeatured = input.IsFeatured;
        product.CategoryId = input.CategoryId;
        product.BrandId = input.BrandId;

        SyncImages(product, input.Images);
        SyncAttributes(product, input.Attributes);
        SyncVariants(product, input.Variants);

        _repo.Update(product);
        await _uow.SaveChangesAsync(ct);
        return await GetByIdAsync(product.Id, ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var product = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Product), id);
        _repo.Remove(product);
        await _uow.SaveChangesAsync(ct);
    }

    // ---------- collection sync helpers ----------

    private static void SyncImages(Product product, List<ProductImageInputDto> incoming)
    {
        var keepIds = incoming.Where(i => i.Id is > 0).Select(i => i.Id!.Value).ToHashSet();
        foreach (var existing in product.Images.Where(i => !keepIds.Contains(i.Id)).ToList())
            product.Images.Remove(existing);

        foreach (var dto in incoming)
        {
            var target = dto.Id is > 0 ? product.Images.FirstOrDefault(i => i.Id == dto.Id) : null;
            if (target is null)
                product.Images.Add(NewImage(dto));
            else
            {
                target.Url = dto.Url;
                target.AltText = dto.AltText;
                target.IsPrimary = dto.IsPrimary;
                target.SortOrder = dto.SortOrder;
            }
        }
    }

    private static void SyncAttributes(Product product, List<ProductAttributeInputDto> incoming)
    {
        var keepIds = incoming.Where(a => a.Id is > 0).Select(a => a.Id!.Value).ToHashSet();
        foreach (var existing in product.Attributes.Where(a => !keepIds.Contains(a.Id)).ToList())
            product.Attributes.Remove(existing);

        foreach (var dto in incoming)
        {
            var target = dto.Id is > 0 ? product.Attributes.FirstOrDefault(a => a.Id == dto.Id) : null;
            if (target is null)
                product.Attributes.Add(NewAttribute(dto));
            else
            {
                target.Name = dto.Name;
                target.Value = dto.Value;
                target.DisplayOrder = dto.DisplayOrder;
            }
        }
    }

    private static void SyncVariants(Product product, List<ProductVariantInputDto> incoming)
    {
        var keepIds = incoming.Where(v => v.Id is > 0).Select(v => v.Id!.Value).ToHashSet();
        foreach (var existing in product.Variants.Where(v => !keepIds.Contains(v.Id)).ToList())
            product.Variants.Remove(existing);

        foreach (var dto in incoming)
        {
            var target = dto.Id is > 0 ? product.Variants.FirstOrDefault(v => v.Id == dto.Id) : null;
            if (target is null)
            {
                product.Variants.Add(NewVariant(dto));
            }
            else
            {
                target.Sku = dto.Sku;
                target.Name = dto.Name;
                target.Price = dto.Price;
                target.CompareAtPrice = dto.CompareAtPrice;
                target.IsActive = dto.IsActive;
                target.Color = dto.Color;
                target.Size = dto.Size;
                target.Inventory ??= new Inventory();
                target.Inventory.QuantityOnHand = dto.QuantityOnHand;
                target.Inventory.ReorderThreshold = dto.ReorderThreshold;
            }
        }
    }

    private static ProductImage NewImage(ProductImageInputDto dto) => new()
    {
        Url = dto.Url,
        AltText = dto.AltText,
        IsPrimary = dto.IsPrimary,
        SortOrder = dto.SortOrder
    };

    private static ProductAttribute NewAttribute(ProductAttributeInputDto dto) => new()
    {
        Name = dto.Name,
        Value = dto.Value,
        DisplayOrder = dto.DisplayOrder
    };

    private static ProductVariant NewVariant(ProductVariantInputDto dto) => new()
    {
        Sku = dto.Sku,
        Name = dto.Name,
        Price = dto.Price,
        CompareAtPrice = dto.CompareAtPrice,
        IsActive = dto.IsActive,
        Color = dto.Color,
        Size = dto.Size,
        Inventory = new Inventory
        {
            QuantityOnHand = dto.QuantityOnHand,
            ReorderThreshold = dto.ReorderThreshold
        }
    };

    // ---------- validation helpers ----------

    private async Task EnsureCategoryAndBrandAsync(int categoryId, int brandId, CancellationToken ct)
    {
        if (await _categoryRepo.GetByIdAsync(categoryId, ct) is null)
            throw new NotFoundException(nameof(Category), categoryId);
        if (await _brandRepo.GetByIdAsync(brandId, ct) is null)
            throw new NotFoundException(nameof(Brand), brandId);
    }

    private async Task<string> EnsureUniqueSlugAsync(string? slug, string name, int? excludeId, CancellationToken ct)
    {
        var baseSlug = SlugGenerator.Generate(string.IsNullOrWhiteSpace(slug) ? name : slug);
        if (string.IsNullOrEmpty(baseSlug)) baseSlug = "san-pham";
        var candidate = baseSlug;
        var suffix = 1;
        while (await _repo.AnyAsync(p => p.Slug == candidate && (excludeId == null || p.Id != excludeId), ct))
            candidate = $"{baseSlug}-{++suffix}";
        return candidate;
    }
}
