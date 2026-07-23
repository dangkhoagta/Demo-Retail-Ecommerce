using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RetailEcommerce.Application.Common;
using RetailEcommerce.Domain.Entities;
using RetailEcommerce.Infrastructure.Identity;

namespace RetailEcommerce.Infrastructure.Persistence.Seed;

/// <summary>Applies migrations and seeds roles, the admin account and demo catalogue data.</summary>
public static class DbSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IConfiguration config,
        ILogger logger)
    {
        await db.Database.MigrateAsync();
        await SeedRolesAsync(roleManager);
        await SeedUsersAsync(userManager, config, logger);
        await SeedCatalogAsync(db, logger);
    }

    private static async Task SeedRolesAsync(RoleManager<ApplicationRole> roleManager)
    {
        foreach (var role in AppRoles.All)
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new ApplicationRole(role));
    }

    private static async Task SeedUsersAsync(UserManager<ApplicationUser> userManager, IConfiguration config, ILogger logger)
    {
        var adminEmail = config["Seed:AdminEmail"] ?? "admin@retail.local";
        var adminPassword = config["Seed:AdminPassword"] ?? "Admin@123";

        if (await userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "Quản trị viên",
                PhoneNumber = "0900000000",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };
            var result = await userManager.CreateAsync(admin, adminPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRolesAsync(admin, new[] { AppRoles.Admin, AppRoles.Customer });
                logger.LogInformation("Seeded admin user {Email}", adminEmail);
            }
            else
            {
                logger.LogError("Failed to seed admin: {Errors}",
                    string.Join("; ", result.Errors.Select(e => e.Description)));
            }
        }

        const string customerEmail = "khachhang@retail.local";
        if (await userManager.FindByEmailAsync(customerEmail) is null)
        {
            var customer = new ApplicationUser
            {
                UserName = customerEmail,
                Email = customerEmail,
                FullName = "Nguyễn Văn A",
                PhoneNumber = "0912345678",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };
            if ((await userManager.CreateAsync(customer, "Customer@123")).Succeeded)
                await userManager.AddToRoleAsync(customer, AppRoles.Customer);
        }
    }

    private static async Task SeedCatalogAsync(ApplicationDbContext db, ILogger logger)
    {
        if (await db.Categories.AnyAsync())
            return;

        var now = DateTime.UtcNow;

        // ----- Categories -----
        var fashion = Cat("Thời trang", "thoi-trang", 1);
        var men = Cat("Thời trang nam", "thoi-trang-nam", 2, fashion);
        var women = Cat("Thời trang nữ", "thoi-trang-nu", 3, fashion);
        var electronics = Cat("Điện tử", "dien-tu", 4);
        var home = Cat("Đồ gia dụng", "do-gia-dung", 5);
        var footwear = Cat("Giày dép", "giay-dep", 6);
        db.Categories.AddRange(fashion, men, women, electronics, home, footwear);

        // ----- Brands -----
        var uniqlo = Brand("Uniqlo", "uniqlo");
        var routine = Brand("Routine", "routine");
        var samsung = Brand("Samsung", "samsung");
        var anker = Brand("Anker", "anker");
        var lock2 = Brand("Lock&Lock", "lock-and-lock");
        var bitis = Brand("Biti's", "bitis");
        db.Brands.AddRange(uniqlo, routine, samsung, anker, lock2, bitis);

        var products = new List<Product>
        {
            P("Áo thun cotton nam", "ao-thun-cotton-nam", "TS-COT-NAM", men, uniqlo, 199_000, 249_000,
                "Áo thun nam chất cotton 100% thoáng mát.",
                attrs: new[] { ("Chất liệu", "Cotton 100%"), ("Xuất xứ", "Việt Nam"), ("Kiểu dáng", "Regular fit") },
                variants: new[]
                {
                    V("TS-COT-NAM-DEN-M", "Đen / M", 199_000, "Đen", "M", 50),
                    V("TS-COT-NAM-DEN-L", "Đen / L", 199_000, "Đen", "L", 40),
                    V("TS-COT-NAM-TRG-M", "Trắng / M", 199_000, "Trắng", "M", 35),
                }, featured: true),

            P("Áo sơ mi nam dài tay", "ao-so-mi-nam-dai-tay", "SM-NAM-DT", men, routine, 359_000, 429_000,
                "Sơ mi nam dài tay lịch sự, dễ phối đồ.",
                attrs: new[] { ("Chất liệu", "Kate lụa"), ("Phong cách", "Công sở") },
                variants: new[]
                {
                    V("SM-NAM-DT-XANH-M", "Xanh / M", 359_000, "Xanh", "M", 25),
                    V("SM-NAM-DT-XANH-L", "Xanh / L", 359_000, "Xanh", "L", 20),
                }),

            P("Váy liền nữ công sở", "vay-lien-nu-cong-so", "VAY-NU-CS", women, routine, 459_000, null,
                "Váy liền thân thanh lịch cho nữ công sở.",
                attrs: new[] { ("Chất liệu", "Thô mềm"), ("Chiều dài", "Qua gối") },
                variants: new[]
                {
                    V("VAY-NU-CS-DO-S", "Đỏ / S", 459_000, "Đỏ", "S", 15),
                    V("VAY-NU-CS-DO-M", "Đỏ / M", 459_000, "Đỏ", "M", 18),
                }, featured: true),

            P("Áo khoác nữ dáng dài", "ao-khoac-nu-dang-dai", "AK-NU-DD", women, uniqlo, 799_000, 999_000,
                "Áo khoác nữ dáng dài giữ ấm tốt.",
                attrs: new[] { ("Chất liệu", "Nỉ bông"), ("Mùa", "Thu đông") },
                variants: new[]
                {
                    V("AK-NU-DD-BE-M", "Be / M", 799_000, "Be", "M", 12),
                    V("AK-NU-DD-BE-L", "Be / L", 799_000, "Be", "L", 10),
                }),

            P("Điện thoại Samsung Galaxy A55", "samsung-galaxy-a55", "SS-A55", electronics, samsung, 8_990_000, 9_990_000,
                "Galaxy A55 màn hình Super AMOLED 6.6 inch, camera 50MP.",
                attrs: new[] { ("Màn hình", "6.6\" Super AMOLED"), ("RAM", "8GB"), ("Bộ nhớ", "256GB"), ("Pin", "5000mAh") },
                variants: new[]
                {
                    V("SS-A55-XANH", "Xanh navy", 8_990_000, "Xanh navy", null, 30),
                    V("SS-A55-TIM", "Tím", 8_990_000, "Tím", null, 22),
                }, featured: true),

            P("Sạc dự phòng Anker 20.000mAh", "sac-du-phong-anker-20000", "ANK-PB-20K", electronics, anker, 690_000, 890_000,
                "Pin sạc dự phòng Anker 20.000mAh sạc nhanh PD 20W.",
                attrs: new[] { ("Dung lượng", "20.000mAh"), ("Cổng", "USB-C + USB-A"), ("Công suất", "20W PD") },
                variants: new[]
                {
                    V("ANK-PB-20K-DEN", "Đen", 690_000, "Đen", null, 60),
                    V("ANK-PB-20K-TRG", "Trắng", 690_000, "Trắng", null, 45),
                }),

            P("Tai nghe Bluetooth Anker Soundcore", "tai-nghe-anker-soundcore", "ANK-SC-BT", electronics, anker, 1_290_000, 1_590_000,
                "Tai nghe true wireless chống ồn chủ động.",
                attrs: new[] { ("Kết nối", "Bluetooth 5.3"), ("Thời lượng pin", "40 giờ"), ("Chống ồn", "ANC") },
                variants: new[]
                {
                    V("ANK-SC-BT-DEN", "Đen", 1_290_000, "Đen", null, 28),
                }, featured: true),

            P("Bộ hộp đựng thực phẩm Lock&Lock 3 món", "hop-thuc-pham-locklock-3-mon", "LL-HTP-3", home, lock2, 259_000, 320_000,
                "Bộ 3 hộp nhựa kín khí an toàn thực phẩm.",
                attrs: new[] { ("Chất liệu", "Nhựa PP"), ("Số món", "3"), ("An toàn", "BPA free") },
                variants: new[]
                {
                    V("LL-HTP-3-CLR", "Trong suốt", 259_000, "Trong suốt", null, 80),
                }),

            P("Bình giữ nhiệt Lock&Lock 500ml", "binh-giu-nhiet-locklock-500", "LL-BGN-500", home, lock2, 189_000, null,
                "Bình giữ nhiệt inox 304 giữ nóng/lạnh 12 giờ.",
                attrs: new[] { ("Dung tích", "500ml"), ("Chất liệu", "Inox 304") },
                variants: new[]
                {
                    V("LL-BGN-500-BAC", "Bạc", 189_000, "Bạc", null, 55),
                    V("LL-BGN-500-HONG", "Hồng", 189_000, "Hồng", null, 33),
                }),

            P("Giày sneaker Biti's Hunter", "giay-sneaker-bitis-hunter", "BT-HUNTER", footwear, bitis, 899_000, 1_090_000,
                "Giày thể thao Biti's Hunter nhẹ, êm chân.",
                attrs: new[] { ("Chất liệu", "Vải dệt"), ("Đế", "Phylon siêu nhẹ") },
                variants: new[]
                {
                    V("BT-HUNTER-DEN-40", "Đen / 40", 899_000, "Đen", "40", 20),
                    V("BT-HUNTER-DEN-41", "Đen / 41", 899_000, "Đen", "41", 25),
                    V("BT-HUNTER-DEN-42", "Đen / 42", 899_000, "Đen", "42", 18),
                }, featured: true),

            P("Dép sandal Biti's nam", "dep-sandal-bitis-nam", "BT-SANDAL", footwear, bitis, 329_000, null,
                "Sandal nam quai dù chắc chắn, chống trượt.",
                attrs: new[] { ("Chất liệu", "EVA + quai dù") },
                variants: new[]
                {
                    V("BT-SANDAL-NAU-40", "Nâu / 40", 329_000, "Nâu", "40", 30),
                    V("BT-SANDAL-NAU-42", "Nâu / 42", 329_000, "Nâu", "42", 27),
                }),

            P("Quần jeans nam slim fit", "quan-jeans-nam-slim-fit", "QJ-NAM-SLIM", men, routine, 549_000, 649_000,
                "Quần jeans nam co giãn nhẹ, form slim fit.",
                attrs: new[] { ("Chất liệu", "Denim co giãn"), ("Form", "Slim fit") },
                variants: new[]
                {
                    V("QJ-NAM-SLIM-29", "Xanh đậm / 29", 549_000, "Xanh đậm", "29", 22),
                    V("QJ-NAM-SLIM-30", "Xanh đậm / 30", 549_000, "Xanh đậm", "30", 26),
                    V("QJ-NAM-SLIM-31", "Xanh đậm / 31", 549_000, "Xanh đậm", "31", 19),
                }),
        };

        db.Products.AddRange(products);
        await db.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} products across the demo catalogue.", products.Count);

        // ----- helpers -----
        Category Cat(string name, string slug, int order, Category? parent = null) => new()
        {
            Name = name, Slug = slug, DisplayOrder = order, IsActive = true, ParentCategory = parent,
            Description = $"Danh mục {name}", ImageUrl = $"https://picsum.photos/seed/{slug}/400/300"
        };

        Brand Brand(string name, string slug) => new()
        {
            Name = name, Slug = slug, IsActive = true,
            Description = $"Thương hiệu {name}", LogoUrl = $"https://picsum.photos/seed/{slug}-logo/200/200"
        };

        Product P(string name, string slug, string sku, Category category, Brand brand,
            decimal price, decimal? compareAt, string desc,
            (string Name, string Value)[] attrs, ProductVariant[] variants, bool featured = false)
        {
            var product = new Product
            {
                Name = name, Slug = slug, Sku = sku, Category = category, Brand = brand,
                BasePrice = price, CompareAtPrice = compareAt, Currency = "VND",
                ShortDescription = desc, Description = desc + " Sản phẩm chính hãng, bảo hành theo nhà sản xuất.",
                IsActive = true, IsFeatured = featured
            };
            product.Images.Add(new ProductImage { Url = $"https://picsum.photos/seed/{slug}/700/700", AltText = name, IsPrimary = true, SortOrder = 0 });
            product.Images.Add(new ProductImage { Url = $"https://picsum.photos/seed/{slug}-2/700/700", AltText = name, IsPrimary = false, SortOrder = 1 });
            for (var i = 0; i < attrs.Length; i++)
                product.Attributes.Add(new ProductAttribute { Name = attrs[i].Name, Value = attrs[i].Value, DisplayOrder = i });
            foreach (var v in variants)
                product.Variants.Add(v);
            product.PriceHistories.Add(new PriceHistory
            {
                OldPrice = price, NewPrice = price, ChangedAt = now, ChangedBy = "system", Reason = "Giá khởi tạo"
            });
            return product;
        }

        ProductVariant V(string sku, string name, decimal price, string? color, string? size, int stock) => new()
        {
            Sku = sku, Name = name, Price = price, Color = color, Size = size, IsActive = true,
            Inventory = new Inventory { QuantityOnHand = stock, ReorderThreshold = 5 }
        };
    }
}
