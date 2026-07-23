# Livora — Technical Description

A full-stack retail e-commerce demo: customer storefront + admin panel.

- **Backend:** ASP.NET Core 10 Web API · Clean Architecture · EF Core 10 · PostgreSQL · Identity + JWT · FluentValidation · AutoMapper · Swagger
- **Frontend:** Angular 20 · Standalone Components · Signals · Angular Material (M3) · Reactive Forms · RxJS

This document explains the design decisions behind the codebase, organized by the evaluation criteria.

---

## 1. Backend

### 1.1. Approach the Requirement — development process

The backend was built in deliberate, verifiable steps:

1. **Analyze the domain and scope.** Break the requirement into a domain model first: Products, Categories (hierarchical), Brands, Variants, Inventory, Attributes, Price History, Orders, Order Items, Users/Roles. Decide the explicit demo boundaries up front (COD-only checkout, flat shipping fee with free-shipping threshold, URL-based product images) so effort goes to architecture instead of gateway integrations.
2. **Choose the architecture before writing code.** Clean Architecture with a strict inward dependency rule: `Api → Infrastructure → Application → Domain`. `Domain` has zero dependencies; `Application` holds DTOs, service logic, validators, and repository *interfaces*; `Infrastructure` implements persistence, Identity, and JWT; `Api` is a thin HTTP shell (controllers, filters, middleware, DI wiring).
3. **Model the database via code-first entities** with a shared `AuditableEntity` base (audit + soft-delete fields), then generate EF Core migrations. Keep identity concerns (`ApplicationUser`) in Infrastructure — the `Order` references the customer only by `CustomerId (Guid)`, so the Domain stays persistence- and framework-pure.
4. **Build vertical slices per resource** (entity → repository → service → DTOs → validators → controller), starting with the catalog (read-heavy), then orders (transactional), then auth/users (cross-cutting).
5. **Make the app self-bootstrapping.** On startup the API applies migrations automatically and seeds roles, an admin account, categories, brands, and sample products — a reviewer can run it with one command and a connection string.
6. **Harden the edges last:** global exception middleware (RFC 7807), FluentValidation action filter, CORS policy for the Angular origin, Swagger with a JWT bearer scheme for manual API testing.

### 1.2. Database Design — SQL, and why

**Choice: PostgreSQL (relational/SQL), accessed through EF Core 10.**

Why SQL rather than NoSQL for this domain:

- **The data is inherently relational.** A product belongs to a category and a brand; a variant belongs to a product and has exactly one inventory row; an order item references a variant. Foreign keys, unique indexes (`Product.Slug`, `Product.Sku`, `Order.OrderNumber`, `Inventory.ProductVariantId`), and cascades enforce integrity at the database level instead of in application code.
- **Orders and stock need ACID transactions.** Placing an order writes the order, its items, and decrements inventory as one atomic unit of work — a natural fit for a transactional RDBMS, and awkward to guarantee with an eventual-consistency document store.
- **The query patterns are relational:** filtered/sorted/paged listings, joins across category/brand/variant/inventory, aggregate dashboards. PostgreSQL handles these with indexes and `ILIKE` search out of the box.
- PostgreSQL specifically: open-source, first-class EF Core provider (Npgsql), case-insensitive search via `ILIKE`, and room to grow (JSONB, full-text search) without changing the platform.

**Schema shape (simplified):**

```
Category (self-referencing ParentId — hierarchy)
Brand
Product ──< ProductImage
        ──< ProductVariant ──1:1── Inventory (QuantityOnHand / QuantityReserved / ReorderThreshold)
        ──< ProductAttribute (Name/Value pairs)
        ──< PriceHistory
Order ──< OrderItem >── ProductVariant
Users / Roles (ASP.NET Core Identity, separate aggregate; Order → CustomerId only)
```

Every domain table inherits audit columns (`CreatedAt/By`, `UpdatedAt/By`) and soft-delete markers (`IsDeleted`, `DeletedAt`).

**How the design supports new product features or attributes:**

- **`ProductAttribute` is a name/value (EAV-style) child table.** Adding "Material = 100% Cotton" or any brand-new specification requires **no schema change** — it's just a new row, with `DisplayOrder` controlling presentation. The admin form already edits attributes as a dynamic list.
- **Variants are separated from the product.** Sellable configurations (color/size, own SKU, own price, own stock) live in `ProductVariant`, so adding a new purchasable variation never touches the `Product` row. New option axes can be added to the variant or normalized into option tables later without impacting orders — `OrderItem` snapshots the name/SKU/unit price at purchase time, so historical orders stay correct even when products change.
- **Price evolution is additive.** `PriceHistory` records changes instead of overwriting, enabling future features (price charts, promotions audit) with data that is already being collected.
- **Soft delete + audit** mean destructive operations are reversible and traceable, which keeps referential integrity for orders that point at "deleted" products.
- If attribute *querying* at scale becomes a requirement, the incremental path is PostgreSQL **JSONB** columns or promoting hot attributes to real columns — both are additive migrations, not redesigns.

### 1.3. Technology Stack Components

| Concern | Choice | Notes |
|---|---|---|
| ORM | **EF Core 10** (code-first, Npgsql provider) | Migrations checked in; `IEntityTypeConfiguration` classes per aggregate; auto-migrate + seed on startup |
| Validation | **FluentValidation** | One validator class per DTO, composed with `RuleForEach`/`SetValidator` for nested children (images, variants, attributes); wired through a global `IAsyncActionFilter` so controllers contain no validation code |
| Mapping | **AutoMapper** | Entity → DTO profiles in the Application layer; no entity ever leaves the API surface |
| AuthN/AuthZ | **ASP.NET Core Identity + JWT bearer** | Role-based (`Admin` / `Customer`), lockout policy, `[Authorize(Roles = ...)]` per endpoint |
| Repository / UoW | **Repository pattern + Unit of Work** | Interfaces in Application, implementations in Infrastructure; `ApplicationDbContext` itself implements `IUnitOfWork`, so a service's `SaveChangesAsync` is one atomic transaction |
| Cross-cutting persistence | **`SaveChangesInterceptor`** | Fills audit fields from `ICurrentUserService` and rewrites hard deletes into soft deletes — entities and services never set these by hand |
| API docs | **Swagger / OpenAPI** with bearer security scheme | Try-it-out with JWT directly from the browser |
| Error contract | **RFC 7807 ProblemDetails** | Produced by one exception-handling middleware |

### 1.4. API and Data Handling

**API design.** Resource-oriented REST controllers (`/api/products`, `/api/categories`, `/api/brands`, `/api/orders`, `/api/users`, `/api/auth`):

- Proper verbs and status codes: `GET` (list/detail), `POST` → `201 CreatedAtAction`, `PUT` → `200`, `DELETE` → `204`; `400` validation, `401/403` auth, `404` not found, `409` business conflict.
- List endpoints accept a typed query object (`ProductQuery`: page, page size, category, brand, price range, active/featured flags, search term, sort field + direction) and return a generic `PagedResult<T>` envelope (`items`, `page`, `pageSize`, `totalCount`, `totalPages`, `hasNext/hasPrevious`) so every grid on the frontend paginates the same way.
- Public catalog endpoints are `[AllowAnonymous]`; all mutations require the `Admin` role; order endpoints scope data to the authenticated customer.

**Input processing.** A request flows through: model binding (with enum-as-string JSON converter) → **FluentValidation filter** (any invalid DTO short-circuits to `400 ValidationProblemDetails` with per-field errors, before an action ever runs) → controller delegates to an Application **service**, which owns business rules (SKU uniqueness, stock availability, order status transitions) → repository + UoW persist.

**Output shaping.** Services return **DTOs only**, mapped via AutoMapper — internal columns (soft-delete flags, audit internals) and lazy navigation graphs never leak. Errors are normalized by the exception middleware: domain exceptions (`NotFoundException`, `ConflictException`) map to 404/409 with a safe message; unexpected exceptions log the full stack trace server-side and return an opaque 500 ProblemDetails with a `traceId` for correlation — never internal details.

**Correctness details worth noting:** checkout merges duplicate cart lines per variant before stock checks; order numbers are generated per-day (`OD20260723-0001`) and protected by a unique index; cancelled orders can't transition to other statuses; `CancellationToken` is propagated from controller to database call on every async path.

### 1.5. Performance — caching and concurrency

**Query performance first.** The biggest wins are in how data is read:

- **`AsNoTracking`** on read paths — no change-tracker overhead for catalog browsing.
- **`AsSplitQuery`** on multi-`Include` product queries — avoids the cartesian-explosion problem of joining images × variants × inventory in one result set.
- **All filtering, searching (`ILIKE`), sorting, and paging execute in SQL** (`Skip/Take` + separate `CountAsync`) — the API never materializes a table to filter in memory.
- **Indexes** on every FK plus unique indexes on slugs/SKUs/order numbers back the common lookups.

**Concurrency.**

- **Atomicity:** an order (order + items + inventory decrements) is a single `SaveChangesAsync` — EF Core wraps it in one database transaction, so a failure rolls back stock and order together.
- **Stock model:** `QuantityAvailable` is computed (`OnHand − Reserved`) and validated per line at checkout; quantities are re-read from the database at order time — the client's cart numbers are never trusted.
- **Identity concurrency** uses the built-in `ConcurrencyStamp` optimistic token.
- **Known limitation & upgrade path (deliberate for the demo):** two simultaneous checkouts of the last unit could race between the stock check and the save. The production fix is optimistic concurrency on `Inventory` via PostgreSQL's `xmin` system column as a concurrency token (or a conditional `UPDATE ... WHERE QuantityOnHand >= @qty`), retrying on `DbUpdateConcurrencyException`. This is a one-line EF configuration change; it was left out to keep the demo minimal but is designed for.

**Caching.**

- **Current state:** no server-side cache layer — for this dataset, indexed SQL with `AsNoTracking` responds in milliseconds, and adding a cache before measuring would be premature; correctness (fresh stock/prices) wins by default. The client keeps the cart in `localStorage`, which removes a whole class of per-user server chatter.
- **Designed-in upgrade path:** because every read goes through repository interfaces behind service interfaces, a cache is a decorator away — `IMemoryCache` for single-instance (categories/brands lists, product-by-slug with short TTL + invalidation on admin writes), Redis for multi-instance, plus HTTP `ETag`/`Cache-Control` on anonymous catalog GETs. No controller or service signature would change.

---

## 2. Frontend

### 2.1. Project structure — organizing and managing components

The app follows a **core / layout / features / shared** structure with 100% standalone components (no NgModules):

```
src/app/
  core/                    # Singletons — application plumbing
    config.ts              #   API base URL + storage keys (single source)
    models/                #   TypeScript interfaces mirroring backend DTOs
    services/              #   auth, product, category, brand, order, user, cart, notification
    interceptors/          #   auth (JWT), error (central HTTP error handling)
    guards/                #   authGuard, adminGuard (functional route guards)
    utils/                 #   e.g. typed HttpParams builder
  layout/                  # Shells: storefront-layout, admin-layout (header/nav/footer + <router-outlet>)
  features/                # One folder per page/flow — components are route-scoped
    storefront/            #   home, product-list, product-detail, cart, checkout,
                           #   order-confirmation, login, register, my-orders, about
    admin/                 #   dashboard, product-admin (list + form), order-admin (list + detail), user-admin
  shared/                  # Reusable presentational pieces: product-card component, vnd currency pipe
```

Principles: **smart pages, dumb shared components** (feature pages own data fetching and state; `shared/` components receive inputs and emit outputs), **services own all HTTP and cross-page state**, and **models are typed end-to-end** so a backend contract change surfaces as a compile error. Two router shells cleanly separate the customer storefront from the admin panel, each with its own navigation and guard boundary.

### 2.2. UI Layout — how the UI is built

- **Two layout shells** (`storefront-layout`, `admin-layout`) render the chrome (header, nav, footer / sidebar) around a `<router-outlet>`; every page is a routed child.
- **Angular Material (M3)** provides the interactive components — tables, dialogs, form fields, selects, snackbars — themed once in `styles.scss` via `mat.theme(...)`.
- **A small custom design-token system** (CSS variables: cream/ink/clay accent palette, `Marcellus` display + `Jost` body fonts) gives the storefront a distinct brand rather than a default-Material look; Material's system tokens are nudged to the same accent so both worlds stay coherent.
- Templates use the **modern Angular control flow** (`@for` with `track`, `@if`) and pipes (custom `vnd` pipe for currency) — presentation logic stays in the template layer, formatting stays in pipes.
- Layouts are responsive CSS grid/flex; page titles are set per-route via the Router `title` property.

### 2.3. Technology Stack Components

| Concern | Choice | Rationale |
|---|---|---|
| State management | **Angular Signals** (`signal` / `computed` / `effect`) in `providedIn: 'root'` services | The right size for this app: `CartService` holds a private writable signal, exposes `asReadonly()` + derived `computed`s (count, subtotal, shipping fee, total), and one `effect` persists to `localStorage`. `AuthService` does the same for session (`isAuthenticated`, `isAdmin` are computeds). Fine-grained reactivity without the boilerplate of NgRx — which would be the natural upgrade if global state grew |
| API client | **`HttpClient`** with **functional interceptors** (`withInterceptors`) | One service per backend resource; interceptors handle cross-cutting JWT attachment and error handling |
| Forms | **Reactive Forms** | Typed `FormGroup`s; `FormArray` powers the dynamic product form (N images, N variants, N attributes added/removed at runtime) |
| File/image handling | **URL-based image entry** (no binary uploader) | A deliberate scope decision matching the backend (images are stored as URLs; seed data uses picsum placeholders). The admin form manages an image list — URL, primary flag, sort order — through a FormArray. A real uploader would slot in as a `<input type="file">` + `FormData` POST to a dedicated endpoint backed by object storage, replacing only the URL field |
| UI framework | **Angular Material** + custom SCSS tokens | Accessible, well-integrated components; custom theming for brand |
| Async | **RxJS** for HTTP streams, **Signals** for state | Observables at the I/O edge, signals for the UI state graph |

### 2.4. API and Data Handling

- **Typed contracts end-to-end.** Every request/response is typed against interfaces in `core/models` that mirror the backend DTOs (`PagedResult<T>`, `Product`, `OrderDetail`, ...). Query objects go through a `toHttpParams` utility so list filters serialize consistently.
- **Auth integration:** the auth interceptor attaches `Authorization: Bearer <jwt>` from the stored token; on app start the token is restored and `/auth/me` re-validates it (an invalid token logs the user out rather than trusting stale local state).
- **Input processing:** Reactive Forms validate before submission (required fields, patterns, min values — mirroring backend rules); invalid controls surface inline `mat-error`s. The cart clamps quantities against the variant's known stock (`maxStock`) at add/update time, and the backend re-validates stock authoritatively at checkout.
- **Response/error validation is centralized** in the error interceptor: `401` → clear session and redirect to login with a `returnUrl`; `0` (network) → "cannot reach server" toast; `400` validation problems are passed through to the form to render field errors inline; other statuses show the ProblemDetails `detail`/`title` in a snackbar. Components therefore never duplicate error plumbing.
- **Route guards** (`authGuard`, `adminGuard`) gate protected pages *and* the backend enforces the same rules — the frontend guard is UX, the API is the security boundary.

### 2.5. Performance

- **Code splitting by default:** every route — including the two layout shells — uses `loadComponent: () => import(...)`, so each page is its own lazy chunk; the admin bundle is never downloaded by a shopper, and vice versa.
- **Fine-grained change detection:** signal-driven state (`computed` totals, derived flags) updates only what changed; zone change detection runs with `eventCoalescing: true` to batch DOM events.
- **List rendering** uses `@for (...; track ...)` everywhere so Angular reuses DOM nodes on data refresh (pagination, cart updates).
- **Server-side pagination/filtering/sorting** for all grids — the client never downloads a full table; storefront filters map straight to the paged API query.
- **Error handling as a performance feature:** the central interceptor prevents duplicated retry/toast logic and guarantees failed calls degrade gracefully (empty states + notification) instead of breaking a page.
- **Lightweight client cache:** cart and session live in `localStorage` (restored via a signal `effect`/constructor), avoiding server round-trips for state that belongs to the device.
- **Lean styling:** design tokens + component-scoped SCSS instead of a heavyweight utility framework keeps the CSS payload small; Material is tree-shaken through standalone component imports (only the Material components actually used are bundled).
- **Router niceties:** `withInMemoryScrolling` (scroll restoration + anchor support) and `withComponentInputBinding` (route params bind directly to component inputs) reduce boilerplate and re-render work.

---

## 3. Summary of key decisions and tradeoffs

| Decision | Tradeoff accepted |
|---|---|
| PostgreSQL over NoSQL | Schema migrations required — but integrity + transactions for orders/stock outweigh flexible-schema benefits, and `ProductAttribute` (+ future JSONB) covers the flexibility need |
| Clean Architecture with 4 projects | More ceremony than a single project — pays off in testability and in swapping infrastructure (cache, storage) without touching business logic |
| Signals over NgRx | Less tooling (devtools/time-travel) — appropriate for this state size; services are already the single owners of state if a store is introduced later |
| COD-only, URL images, no cache layer | Deliberate scope: the seams for payment gateways, file storage, and Redis are designed in (interfaces + decorators), just not implemented in the demo |
