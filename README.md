# Livora — Demo Retail E-commerce

🌐 [English](README.en.md) | Tiếng Việt

📄 [Báo cáo triển khai](docs/REPORT.md) · 📦 [Postman collection](docs/RetailEcommerce.postman_collection.json)

Ứng dụng thương mại điện tử bán lẻ đầy đủ (full-stack) gồm cửa hàng cho khách và trang quản trị.

- **Backend:** ASP.NET Core 10 Web API · Clean Architecture · Repository Pattern · EF Core 10 · PostgreSQL · ASP.NET Core Identity + JWT · FluentValidation · AutoMapper · Swagger
- **Frontend:** Angular 20 · TypeScript · Angular Material · Signals · Reactive Forms · RxJS · Standalone Components · Router · HttpClient

---

## 1. Yêu cầu môi trường

| Công cụ | Phiên bản |
|---|---|
| .NET SDK | 10.0+ |
| Node.js | 20+ (khuyến nghị 22/24) |
| PostgreSQL | 13+ (mặc định cổng 5432) |

Cài công cụ dòng lệnh EF Core (nếu chạy migration thủ công):

```bash
dotnet tool install --global dotnet-ef --version 10.0.10
```

---

## 2. Chạy Backend

### 2.1. Cấu hình

Mở `backend/src/RetailEcommerce.Api/appsettings.json` và cập nhật:

```jsonc
"ConnectionStrings": {
  // Cập nhật Username/Password theo PostgreSQL của bạn.
  // Database "DemoEcommerce" sẽ được tạo tự động ở lần chạy đầu.
  "DefaultConnection": "Host=localhost;Port=5432;Database=DemoEcommerce;Username=postgres;Password=CHANGE_ME"
},
"Jwt": {
  // Thay bằng chuỗi bí mật >= 32 ký tự trong môi trường thật.
  "Key": "CHANGE_ME_super_secret_jwt_signing_key_min_32_chars_2026"
}
```

### 2.2. Chạy

```bash
cd backend/src/RetailEcommerce.Api
dotnet run
```

Khi khởi động, ứng dụng sẽ **tự động áp dụng migration** (tạo database + bảng) và **seed dữ liệu mẫu** (tài khoản admin, danh mục, thương hiệu, sản phẩm).

- API: <http://localhost:5080>
- Swagger UI: <http://localhost:5080/swagger>

> Muốn chạy migration thủ công thay vì tự động:
> ```bash
> cd backend
> dotnet ef database update \
>   --project src/RetailEcommerce.Infrastructure \
>   --startup-project src/RetailEcommerce.Api
> ```

---

## 3. Chạy Frontend

```bash
cd frontend
npm install
npm start
```

- Ứng dụng: <http://localhost:4200>
- Frontend gọi API tại `http://localhost:5080/api` (cấu hình trong `frontend/src/app/core/config.ts`).

> Chạy backend **trước** frontend để CORS và API hoạt động.

---

## 4. Tài khoản demo

| Vai trò | Email | Mật khẩu | Ghi chú |
|---|---|---|---|
| **Admin** | `admin@retail.local` | `Admin@123` | Quản lý sản phẩm, đơn hàng, người dùng tại `/quan-tri` |
| **Khách hàng** | `khachhang@retail.local` | `Customer@123` | Tài khoản khách mẫu |

Bạn cũng có thể **đăng ký tài khoản mới** tại `/dang-ky`.

---

## 5. Tính năng

### Cửa hàng (Storefront)
- Trang chủ với sản phẩm nổi bật & danh mục
- Danh sách sản phẩm: lọc theo danh mục / thương hiệu, tìm kiếm, sắp xếp, phân trang
- Chi tiết sản phẩm: thư viện ảnh, chọn biến thể, số lượng, thêm vào giỏ
- Giỏ hàng (lưu ở `localStorage`, dùng Angular Signals)
- **Thanh toán đơn giản — chỉ lưu thông tin đơn hàng — ship COD** (không cổng thanh toán)
- Đăng ký / Đăng nhập (JWT)
- Đơn hàng của tôi

### Quản trị (Admin — chỉ vai trò Admin)
- Tổng quan: số liệu + đơn hàng gần đây
- Quản lý sản phẩm: tạo/sửa/xoá (kèm ảnh, biến thể, tồn kho, thuộc tính, lịch sử giá)
- Quản lý đơn hàng: xem chi tiết, cập nhật trạng thái
- Quản lý người dùng: đổi vai trò, khoá/mở khoá

### Miền dữ liệu (Domain)
Products · Categories (phân cấp) · Brands · Product Images · Product Variants · Inventory · Product Attributes · Price History · Orders · Order Items · Audit fields (CreatedAt/By, UpdatedAt/By) · Soft delete.

---

## 6. Cấu trúc dự án

```
backend/
  src/
    RetailEcommerce.Domain/          # Entities, enums, audit base (không phụ thuộc)
    RetailEcommerce.Application/      # DTOs, interfaces, services, validators, AutoMapper
    RetailEcommerce.Infrastructure/   # EF Core DbContext, repositories, Identity, JWT, seeder, migrations
    RetailEcommerce.Api/              # Controllers, DI, Swagger, middleware
frontend/
  src/app/
    core/          # models, services (signals), interceptors, guards
    layout/        # storefront-layout, admin-layout
    features/
      storefront/  # home, product-list, product-detail, cart, checkout, ...
      admin/        # dashboard, product-admin, order-admin, user-admin
    shared/        # product-card, vnd pipe
```

**Luồng phụ thuộc (Clean Architecture):** `Api → Infrastructure → Application → Domain`. Danh tính (`ApplicationUser`) đặt ở Infrastructure; `Order` chỉ tham chiếu khách hàng qua `CustomerId (Guid)` để giữ Domain thuần khiết.

---

## 7. Ghi chú

- **Thanh toán:** demo chỉ hỗ trợ **COD** (`PaymentMethod.CashOnDelivery`). Checkout chỉ lưu đơn, không tích hợp cổng thanh toán.
- **Phí giao hàng:** cố định 30.000₫, **miễn phí** cho đơn từ 500.000₫ (logic đồng bộ giữa backend và frontend).
- **Tồn kho:** trừ trực tiếp `QuantityOnHand` khi đặt hàng.
- **Cảnh báo NuGet `NU1903` (AutoMapper 13.0.1):** đây là phiên bản MIT cuối cùng của AutoMapper, được ghim theo yêu cầu dùng AutoMapper. Cảnh báo là advisory DoS gián tiếp, không ảnh hưởng phạm vi demo. Có thể nâng cấp nếu cần.
- **Ảnh sản phẩm:** dùng ảnh placeholder từ `picsum.photos` trong dữ liệu seed.
