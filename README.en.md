# Livora — Demo Retail E-commerce

🌐 English | [Tiếng Việt](README.md)

📄 [Implementation report](docs/REPORT.md) · 📦 [Postman collection](docs/RetailEcommerce.postman_collection.json)

A full-stack retail e-commerce application with a customer storefront and an admin panel.

- **Backend:** ASP.NET Core 10 Web API · Clean Architecture · Repository Pattern · EF Core 10 · PostgreSQL · ASP.NET Core Identity + JWT · FluentValidation · AutoMapper · Swagger
- **Frontend:** Angular 20 · TypeScript · Angular Material · Signals · Reactive Forms · RxJS · Standalone Components · Router · HttpClient

---

## 1. Prerequisites

| Tool | Version |
|---|---|
| .NET SDK | 10.0+ |
| Node.js | 20+ (22/24 recommended) |
| PostgreSQL | 13+ (default port 5432) |

Install the EF Core CLI tool (only needed for running migrations manually):

```bash
dotnet tool install --global dotnet-ef --version 10.0.10
```

---

## 2. Running the Backend

### 2.1. Configuration

Open `backend/src/RetailEcommerce.Api/appsettings.json` and update:

```jsonc
"ConnectionStrings": {
  // Update Username/Password to match your PostgreSQL setup.
  // The "DemoEcommerce" database is created automatically on first run.
  "DefaultConnection": "Host=localhost;Port=5432;Database=DemoEcommerce;Username=postgres;Password=CHANGE_ME"
},
"Jwt": {
  // Replace with a secret string >= 32 characters in a real environment.
  "Key": "CHANGE_ME_super_secret_jwt_signing_key_min_32_chars_2026"
}
```

### 2.2. Run

```bash
cd backend/src/RetailEcommerce.Api
dotnet run
```

On startup the app **automatically applies migrations** (creates the database + tables) and **seeds demo data** (admin account, categories, brands, products).

- API: <http://localhost:5080>
- Swagger UI: <http://localhost:5080/swagger>

> To run migrations manually instead of automatically:
> ```bash
> cd backend
> dotnet ef database update \
>   --project src/RetailEcommerce.Infrastructure \
>   --startup-project src/RetailEcommerce.Api
> ```

---

## 3. Running the Frontend

```bash
cd frontend
npm install
npm start
```

- App: <http://localhost:4200>
- The frontend calls the API at `http://localhost:5080/api` (configured in `frontend/src/app/core/config.ts`).

> Start the backend **before** the frontend so CORS and the API work.

---

## 4. Demo accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| **Admin** | `admin@retail.local` | `Admin@123` | Manage products, orders, and users at `/quan-tri` |
| **Customer** | `khachhang@retail.local` | `Customer@123` | Sample customer account |

You can also **register a new account** at `/dang-ky`.

---

## 5. Features

### Storefront
- Home page with featured products & categories
- Product list: filter by category / brand, search, sort, pagination
- Product detail: image gallery, variant selection, quantity, add to cart
- Shopping cart (stored in `localStorage`, built with Angular Signals)
- **Simple checkout — order info only — COD shipping** (no payment gateway)
- Register / Login (JWT)
- My orders

### Admin (Admin role only)
- Dashboard: metrics + recent orders
- Product management: create/edit/delete (with images, variants, inventory, attributes, price history)
- Order management: view details, update status
- User management: change roles, lock/unlock accounts

### Domain
Products · Categories (hierarchical) · Brands · Product Images · Product Variants · Inventory · Product Attributes · Price History · Orders · Order Items · Audit fields (CreatedAt/By, UpdatedAt/By) · Soft delete.

---

## 6. Project structure

```
backend/
  src/
    RetailEcommerce.Domain/          # Entities, enums, audit base (no dependencies)
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

**Dependency flow (Clean Architecture):** `Api → Infrastructure → Application → Domain`. Identity (`ApplicationUser`) lives in Infrastructure; `Order` references the customer only via `CustomerId (Guid)` to keep the Domain layer pure.

---

## 7. Notes

- **Payments:** the demo supports **COD only** (`PaymentMethod.CashOnDelivery`). Checkout only saves the order — no payment gateway integration.
- **Shipping fee:** flat 30,000₫, **free** for orders of 500,000₫ or more (logic kept in sync between backend and frontend).
- **Inventory:** `QuantityOnHand` is decremented directly when an order is placed.
- **NuGet warning `NU1903` (AutoMapper 13.0.1):** this is the last MIT-licensed version of AutoMapper, pinned per the requirement to use AutoMapper. The warning is an indirect DoS advisory and doesn't affect the demo's scope. Upgrade if needed.
- **Product images:** placeholder images from `picsum.photos` are used in the seed data.
