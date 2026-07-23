using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> b)
    {
        b.ToTable("Orders");
        b.Property(o => o.OrderNumber).HasMaxLength(30).IsRequired();
        b.Property(o => o.CustomerName).HasMaxLength(150).IsRequired();
        b.Property(o => o.CustomerPhone).HasMaxLength(20).IsRequired();
        b.Property(o => o.CustomerEmail).HasMaxLength(256);
        b.Property(o => o.ShippingAddress).HasMaxLength(300).IsRequired();
        b.Property(o => o.ShippingCity).HasMaxLength(100).IsRequired();
        b.Property(o => o.ShippingDistrict).HasMaxLength(100);
        b.Property(o => o.ShippingWard).HasMaxLength(100);
        b.Property(o => o.Notes).HasMaxLength(1000);

        b.Property(o => o.Subtotal).HasPrecision(18, 2);
        b.Property(o => o.ShippingFee).HasPrecision(18, 2);
        b.Property(o => o.Total).HasPrecision(18, 2);

        // Store enums as readable strings.
        b.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
        b.Property(o => o.PaymentMethod).HasConversion<string>().HasMaxLength(30);

        b.HasIndex(o => o.OrderNumber).IsUnique();
        b.HasIndex(o => o.CustomerId);
        b.HasIndex(o => o.Status);

        b.HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> b)
    {
        b.ToTable("OrderItems");
        b.Property(i => i.ProductName).HasMaxLength(250).IsRequired();
        b.Property(i => i.Sku).HasMaxLength(80).IsRequired();
        b.Property(i => i.UnitPrice).HasPrecision(18, 2);
        b.Property(i => i.LineTotal).HasPrecision(18, 2);
        b.HasIndex(i => i.OrderId);

        // Keep the variant reference but never cascade-delete a variant because of an order line.
        b.HasOne(i => i.ProductVariant)
            .WithMany(v => v.OrderItems)
            .HasForeignKey(i => i.ProductVariantId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
