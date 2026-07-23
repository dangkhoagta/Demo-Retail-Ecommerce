using FluentValidation;
using RetailEcommerce.Application.DTOs.Orders;

namespace RetailEcommerce.Application.Validators;

public class CreateOrderItemDtoValidator : AbstractValidator<CreateOrderItemDto>
{
    public CreateOrderItemDtoValidator()
    {
        RuleFor(x => x.ProductVariantId).GreaterThan(0);
        RuleFor(x => x.Quantity).InclusiveBetween(1, 999).WithMessage("Số lượng phải từ 1 đến 999.");
    }
}

public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderDtoValidator()
    {
        RuleFor(x => x.CustomerName).NotEmpty().WithMessage("Vui lòng nhập tên người nhận.").MaximumLength(150);
        RuleFor(x => x.CustomerPhone)
            .NotEmpty().WithMessage("Vui lòng nhập số điện thoại.")
            .Matches(@"^[0-9+\-\s]{8,20}$").WithMessage("Số điện thoại không hợp lệ.");
        RuleFor(x => x.CustomerEmail)
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.CustomerEmail))
            .WithMessage("Email không hợp lệ.");
        RuleFor(x => x.ShippingAddress).NotEmpty().WithMessage("Vui lòng nhập địa chỉ giao hàng.").MaximumLength(300);
        RuleFor(x => x.ShippingCity).NotEmpty().WithMessage("Vui lòng nhập tỉnh/thành phố.").MaximumLength(100);
        RuleFor(x => x.Items).NotEmpty().WithMessage("Đơn hàng phải có ít nhất một sản phẩm.");
        RuleForEach(x => x.Items).SetValidator(new CreateOrderItemDtoValidator());
    }
}
