using FluentValidation;
using RetailEcommerce.Application.DTOs.Products;

namespace RetailEcommerce.Application.Validators;

public class ProductImageInputDtoValidator : AbstractValidator<ProductImageInputDto>
{
    public ProductImageInputDtoValidator()
    {
        RuleFor(x => x.Url).NotEmpty().WithMessage("URL ảnh là bắt buộc.").MaximumLength(500);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }
}

public class ProductVariantInputDtoValidator : AbstractValidator<ProductVariantInputDto>
{
    public ProductVariantInputDtoValidator()
    {
        RuleFor(x => x.Sku).NotEmpty().WithMessage("SKU biến thể là bắt buộc.").MaximumLength(80);
        RuleFor(x => x.Name).NotEmpty().WithMessage("Tên biến thể là bắt buộc.").MaximumLength(150);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.QuantityOnHand).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ReorderThreshold).GreaterThanOrEqualTo(0);
    }
}

public class ProductAttributeInputDtoValidator : AbstractValidator<ProductAttributeInputDto>
{
    public ProductAttributeInputDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Tên thuộc tính là bắt buộc.").MaximumLength(120);
        RuleFor(x => x.Value).NotEmpty().WithMessage("Giá trị thuộc tính là bắt buộc.").MaximumLength(300);
    }
}

public class ProductCreateDtoValidator : AbstractValidator<ProductCreateDto>
{
    public ProductCreateDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Tên sản phẩm là bắt buộc.").MaximumLength(200);
        RuleFor(x => x.Sku).NotEmpty().WithMessage("SKU là bắt buộc.").MaximumLength(80);
        RuleFor(x => x.BasePrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CompareAtPrice).GreaterThan(x => x.BasePrice)
            .When(x => x.CompareAtPrice.HasValue)
            .WithMessage("Giá gốc phải lớn hơn giá bán.");
        RuleFor(x => x.CategoryId).GreaterThan(0).WithMessage("Vui lòng chọn danh mục.");
        RuleFor(x => x.BrandId).GreaterThan(0).WithMessage("Vui lòng chọn thương hiệu.");
        RuleFor(x => x.Variants).NotEmpty().WithMessage("Sản phẩm phải có ít nhất một biến thể.");
        RuleForEach(x => x.Images).SetValidator(new ProductImageInputDtoValidator());
        RuleForEach(x => x.Variants).SetValidator(new ProductVariantInputDtoValidator());
        RuleForEach(x => x.Attributes).SetValidator(new ProductAttributeInputDtoValidator());
    }
}

public class ProductUpdateDtoValidator : AbstractValidator<ProductUpdateDto>
{
    public ProductUpdateDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Tên sản phẩm là bắt buộc.").MaximumLength(200);
        RuleFor(x => x.BasePrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CompareAtPrice).GreaterThan(x => x.BasePrice)
            .When(x => x.CompareAtPrice.HasValue)
            .WithMessage("Giá gốc phải lớn hơn giá bán.");
        RuleFor(x => x.CategoryId).GreaterThan(0).WithMessage("Vui lòng chọn danh mục.");
        RuleFor(x => x.BrandId).GreaterThan(0).WithMessage("Vui lòng chọn thương hiệu.");
        RuleFor(x => x.Variants).NotEmpty().WithMessage("Sản phẩm phải có ít nhất một biến thể.");
        RuleForEach(x => x.Images).SetValidator(new ProductImageInputDtoValidator());
        RuleForEach(x => x.Variants).SetValidator(new ProductVariantInputDtoValidator());
        RuleForEach(x => x.Attributes).SetValidator(new ProductAttributeInputDtoValidator());
    }
}
