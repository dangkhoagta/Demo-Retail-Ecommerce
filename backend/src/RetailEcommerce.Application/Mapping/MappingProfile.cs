using AutoMapper;
using RetailEcommerce.Application.DTOs.Brands;
using RetailEcommerce.Application.DTOs.Categories;
using RetailEcommerce.Application.DTOs.Orders;
using RetailEcommerce.Application.DTOs.Products;
using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Application.Mapping;

/// <summary>Entity → DTO projections. Write-side (DTO → entity) is handled explicitly in services.</summary>
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ----- Category -----
        CreateMap<Category, CategoryDto>()
            .ForMember(d => d.ParentCategoryName, o => o.MapFrom(s => s.ParentCategory != null ? s.ParentCategory.Name : null))
            .ForMember(d => d.ProductCount, o => o.MapFrom(s => s.Products.Count))
            .ForMember(d => d.Children, o => o.MapFrom(s => s.Children));

        // ----- Brand -----
        CreateMap<Brand, BrandDto>()
            .ForMember(d => d.ProductCount, o => o.MapFrom(s => s.Products.Count));

        // ----- Product -----
        CreateMap<Product, ProductListItemDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category.Name))
            .ForMember(d => d.BrandName, o => o.MapFrom(s => s.Brand.Name))
            .ForMember(d => d.PrimaryImageUrl, o => o.MapFrom(s =>
                s.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
                ?? s.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).FirstOrDefault()))
            .ForMember(d => d.TotalStock, o => o.MapFrom(s =>
                s.Variants.Sum(v => v.Inventory != null ? v.Inventory.QuantityOnHand - v.Inventory.QuantityReserved : 0)));

        CreateMap<Product, ProductDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category.Name))
            .ForMember(d => d.BrandName, o => o.MapFrom(s => s.Brand.Name))
            .ForMember(d => d.Images, o => o.MapFrom(s => s.Images.OrderBy(i => i.SortOrder)))
            .ForMember(d => d.Variants, o => o.MapFrom(s => s.Variants))
            .ForMember(d => d.Attributes, o => o.MapFrom(s => s.Attributes.OrderBy(a => a.DisplayOrder)))
            .ForMember(d => d.PriceHistory, o => o.MapFrom(s => s.PriceHistories.OrderByDescending(p => p.ChangedAt)));

        CreateMap<ProductImage, ProductImageDto>();
        CreateMap<ProductVariant, ProductVariantDto>()
            .ForMember(d => d.QuantityAvailable, o => o.MapFrom(s =>
                s.Inventory != null ? s.Inventory.QuantityOnHand - s.Inventory.QuantityReserved : 0));
        CreateMap<ProductAttribute, ProductAttributeDto>();
        CreateMap<PriceHistory, PriceHistoryDto>();

        // ----- Order -----
        CreateMap<Order, OrderListItemDto>()
            .ForMember(d => d.ItemCount, o => o.MapFrom(s => s.Items.Count));
        CreateMap<Order, OrderDto>();
        CreateMap<OrderItem, OrderItemDto>();
    }
}
