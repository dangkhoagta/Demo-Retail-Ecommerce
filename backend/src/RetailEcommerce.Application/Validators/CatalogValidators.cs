using FluentValidation;
using RetailEcommerce.Application.DTOs.Brands;
using RetailEcommerce.Application.DTOs.Categories;

namespace RetailEcommerce.Application.Validators;

public class CategoryInputDtoValidator : AbstractValidator<CategoryInputDto>
{
    public CategoryInputDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên danh mục là bắt buộc.")
            .MaximumLength(150);
        RuleFor(x => x.Slug).MaximumLength(180);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.DisplayOrder).GreaterThanOrEqualTo(0);
    }
}

public class BrandInputDtoValidator : AbstractValidator<BrandInputDto>
{
    public BrandInputDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên thương hiệu là bắt buộc.")
            .MaximumLength(150);
        RuleFor(x => x.Slug).MaximumLength(180);
        RuleFor(x => x.Website)
            .MaximumLength(300)
            .Matches(@"^https?://").When(x => !string.IsNullOrWhiteSpace(x.Website))
            .WithMessage("Website phải bắt đầu bằng http:// hoặc https://.");
    }
}
