using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using RetailEcommerce.Application.Interfaces.Services;
using RetailEcommerce.Application.Services;

namespace RetailEcommerce.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddAutoMapper(assembly);
        services.AddValidatorsFromAssembly(assembly, includeInternalTypes: true);

        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IBrandService, BrandService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IOrderService, OrderService>();

        return services;
    }
}
