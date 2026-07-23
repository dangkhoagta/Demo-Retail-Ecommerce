using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RetailEcommerce.Domain.Entities;

namespace RetailEcommerce.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> b)
    {
        b.ToTable("Categories");
        b.Property(c => c.Name).HasMaxLength(150).IsRequired();
        b.Property(c => c.Slug).HasMaxLength(180).IsRequired();
        b.Property(c => c.Description).HasMaxLength(1000);
        b.Property(c => c.ImageUrl).HasMaxLength(500);
        b.HasIndex(c => c.Slug).IsUnique();

        b.HasOne(c => c.ParentCategory)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> b)
    {
        b.ToTable("Brands");
        b.Property(x => x.Name).HasMaxLength(150).IsRequired();
        b.Property(x => x.Slug).HasMaxLength(180).IsRequired();
        b.Property(x => x.Description).HasMaxLength(1000);
        b.Property(x => x.LogoUrl).HasMaxLength(500);
        b.Property(x => x.Website).HasMaxLength(300);
        b.HasIndex(x => x.Slug).IsUnique();
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.ToTable("Products");
        b.Property(p => p.Name).HasMaxLength(200).IsRequired();
        b.Property(p => p.Slug).HasMaxLength(220).IsRequired();
        b.Property(p => p.Sku).HasMaxLength(80).IsRequired();
        b.Property(p => p.ShortDescription).HasMaxLength(500);
        b.Property(p => p.BasePrice).HasPrecision(18, 2);
        b.Property(p => p.CompareAtPrice).HasPrecision(18, 2);
        b.Property(p => p.Currency).HasMaxLength(3).IsRequired();

        b.HasIndex(p => p.Slug).IsUnique();
        b.HasIndex(p => p.Sku).IsUnique();
        b.HasIndex(p => p.CategoryId);
        b.HasIndex(p => p.BrandId);

        b.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(p => p.Brand)
            .WithMany(br => br.Products)
            .HasForeignKey(p => p.BrandId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasMany(p => p.Images).WithOne(i => i.Product)
            .HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(p => p.Variants).WithOne(v => v.Product)
            .HasForeignKey(v => v.ProductId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(p => p.Attributes).WithOne(a => a.Product)
            .HasForeignKey(a => a.ProductId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(p => p.PriceHistories).WithOne(ph => ph.Product)
            .HasForeignKey(ph => ph.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> b)
    {
        b.ToTable("ProductImages");
        b.Property(i => i.Url).HasMaxLength(500).IsRequired();
        b.Property(i => i.AltText).HasMaxLength(200);
        b.HasIndex(i => i.ProductId);
    }
}

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> b)
    {
        b.ToTable("ProductVariants");
        b.Property(v => v.Sku).HasMaxLength(80).IsRequired();
        b.Property(v => v.Name).HasMaxLength(150).IsRequired();
        b.Property(v => v.Price).HasPrecision(18, 2);
        b.Property(v => v.CompareAtPrice).HasPrecision(18, 2);
        b.Property(v => v.Color).HasMaxLength(60);
        b.Property(v => v.Size).HasMaxLength(60);
        b.HasIndex(v => v.ProductId);
        b.HasIndex(v => v.Sku);
    }
}

public class InventoryConfiguration : IEntityTypeConfiguration<Inventory>
{
    public void Configure(EntityTypeBuilder<Inventory> b)
    {
        b.ToTable("Inventories");
        b.Ignore(i => i.QuantityAvailable);

        b.HasOne(i => i.ProductVariant)
            .WithOne(v => v.Inventory)
            .HasForeignKey<Inventory>(i => i.ProductVariantId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(i => i.ProductVariantId).IsUnique();
    }
}

public class ProductAttributeConfiguration : IEntityTypeConfiguration<ProductAttribute>
{
    public void Configure(EntityTypeBuilder<ProductAttribute> b)
    {
        b.ToTable("ProductAttributes");
        b.Property(a => a.Name).HasMaxLength(120).IsRequired();
        b.Property(a => a.Value).HasMaxLength(500).IsRequired();
        b.HasIndex(a => a.ProductId);
    }
}

public class PriceHistoryConfiguration : IEntityTypeConfiguration<PriceHistory>
{
    public void Configure(EntityTypeBuilder<PriceHistory> b)
    {
        b.ToTable("PriceHistories");
        b.Property(p => p.OldPrice).HasPrecision(18, 2);
        b.Property(p => p.NewPrice).HasPrecision(18, 2);
        b.Property(p => p.ChangedBy).HasMaxLength(256);
        b.Property(p => p.Reason).HasMaxLength(300);
        b.HasIndex(p => p.ProductId);
    }
}
