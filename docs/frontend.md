# Frontend Report — Livora (Demo Retail E-commerce)

Short report covering the implementation approach, technology stack, versions, limitations, and proposed improvements of the **Angular storefront + admin** frontend.

- 📋 Overall implementation report: [`REPORT.md`](REPORT.md)
- 🛠 Backend report: [`backend.md`](backend.md)
- 🚀 Setup & run guide: [`README.en.md`](../README.en.md) ([Tiếng Việt](../README.md))

---

## 1. Implementation Approach

The frontend is a **single-page application (SPA)** that consumes the ASP.NET Core Web API. It serves two audiences from one codebase, separated by layout and route guards:

- **Storefront** (`/`) — public shop: browse, search, filter products; cart; checkout (COD); order history.
- **Admin** (`/quan-tri`) — role-protected back office: dashboard, product/order/user management.

### Guiding principles

| Principle | How it is applied |
|---|---|
| **Modern Angular, no legacy patterns** | 100% standalone components (no NgModules), functional guards & interceptors, `inject()` instead of constructor injection where idiomatic. |
| **Signals-first state** | Local/app state is held in Angular **Signals** (`signal`, `computed`, `effect`) — e.g. `CartService` derives `count`, `subtotal`, `shippingFee`, `total` as `computed` values and persists to `localStorage` via an `effect`. RxJS is kept for what it does best: HTTP and event streams. |
| **Lazy loading by default** | Every route uses `loadComponent` dynamic imports, so storefront visitors never download admin code and vice versa. |
| **Thin components, smart services** | HTTP access, auth session, cart logic, and notifications live in `core/services`; components consume signals and render. |
| **Cross-cutting concerns centralized** | `authInterceptor` attaches the JWT to outgoing requests; `errorInterceptor` maps HTTP failures globally (401 → sign-out + redirect to login with `returnUrl`, network errors / 5xx → toast, 400 → handled inline by forms). |
| **Consistent UX language** | Angular Material components + a shared `VndPipe` for Vietnamese currency formatting; Vietnamese route slugs (`/san-pham`, `/gio-hang`, `/thanh-toan`). |

### Project structure

```
frontend/src/app/
  core/          # config, models, services (signals), interceptors, guards, utils
  layout/        # storefront-layout, admin-layout (each an <router-outlet> shell)
  features/
    storefront/  # home, product-list, product-detail, cart, checkout,
                 # order-confirmation, login, register, my-orders, about
    admin/       # dashboard, product-admin (list/form), order-admin, user-admin
  shared/        # product-card component, vnd pipe
```

### Key flows

- **Auth:** JWT issued by the API is stored in `localStorage`; on app start, `AuthService` restores the session and re-fetches `/auth/me`. `authGuard` protects customer pages, `adminGuard` gates the whole admin area on the `Admin` role.
- **Cart:** kept client-side in signals + `localStorage` (survives refresh, works pre-login). Shipping-fee rule (flat 30,000₫, free from 500,000₫) is mirrored from the backend so totals always agree.
- **Router config:** `withComponentInputBinding()` (route params bind directly to component inputs) and `withInMemoryScrolling()` (scroll restoration + anchor scrolling).

---

## 2. Technology Stack & Versions

| Layer | Technology | Version |
|---|---|---|
| Framework | **Angular** | **20.3** (core 20.3.26) |
| Tooling | Angular CLI / `@angular/build` (esbuild + Vite) | 20.3.32 |
| Language | TypeScript | 5.9.2 |
| UI kit | Angular Material + CDK | 20.2.14 |
| Reactivity | Angular Signals + RxJS | RxJS 7.8 |
| Change detection | zone.js (event coalescing enabled) | 0.15 |
| Unit-test harness | Jasmine / Karma (CLI scaffold) | Jasmine 5.9, Karma 6.4 |
| Formatting | Prettier (100 cols, single quotes, Angular HTML parser) | — |
| Runtime | Node.js | 20+ (developed on 24.x) |

Backend counterpart: ASP.NET Core 10 Web API · EF Core 10 · PostgreSQL · Identity + JWT (see root `README.md`).

---

## 3. Limitations

Known constraints of the current implementation — deliberate scope cuts for a demo, listed honestly:

1. **No server-side rendering (SSR/hydration).** The app is client-rendered only; SEO and first-paint for a public storefront are weaker than an SSR setup.
2. **JWT in `localStorage`, no refresh token.** Vulnerable to token theft via XSS (mitigated only by Angular's built-in sanitization); when the token expires (8 h) the user is signed out abruptly on the next 401 instead of being silently refreshed.
3. **Hard-coded API endpoint.** `API_BASE_URL` lives in `core/config.ts`; there are no `environment.*.ts` files or runtime configuration, so pointing at another backend requires a code change and rebuild.
4. **Client-only cart.** The cart never syncs to the server — it is lost when switching devices/browsers, and stock (`maxStock`) is captured at add-to-cart time, so availability can drift until checkout validates it.
5. **No automated tests.** Karma/Jasmine are scaffolded but no unit specs or e2e suites were written.
6. **No i18n framework.** UI copy is hard-coded in Vietnamese; adding a language means touching every template.
7. **No image upload.** Product images are URL strings (seeded from `picsum.photos`); the admin form cannot upload files.
8. **COD only.** Checkout records the order without any payment-gateway integration.
9. **No caching layer for server state.** Every navigation re-fetches from the API; there is no request de-duplication or stale-while-revalidate strategy.
10. **Accessibility & performance not audited.** Material gives a solid a11y baseline, but no WCAG review, Lighthouse budget, or bundle-size budget has been enforced.

---

## 4. Future Improvements

Ordered roughly by value-for-effort:

1. **Environment configuration** — introduce `environment.ts` / runtime `config.json` so dev/staging/prod builds target different APIs without code changes. *(smallest effort, immediate payoff)*
2. **Refresh-token flow + hardened storage** — short-lived access token with silent refresh (HttpOnly cookie for the refresh token), removing the abrupt-logout problem and shrinking the XSS window.
3. **Testing pyramid** — component/service unit tests (migrate Karma → Vitest, Angular's forward direction), plus Playwright e2e for the golden paths: browse → add to cart → checkout; admin product CRUD.
4. **Server-synced cart** — merge the local cart into a server cart on login; enables cross-device continuity and live stock validation.
5. **SSR + incremental hydration** (`@angular/ssr`) — better SEO, social-link previews, and Core Web Vitals for the storefront.
6. **Payment gateway integration** — VNPay / MoMo / Stripe checkout flow with payment-status webhooks reflected in order state.
7. **i18n** — `@angular/localize` or Transloco; extract all copy, ship vi/en.
8. **Server-state caching** — TanStack Query (Angular adapter) or a lightweight signals store for de-duplicated, cached, invalidation-aware API data.
9. **Zoneless change detection** — drop zone.js once on Angular ≥ 20's zoneless mode; the codebase is already signals-based, making migration cheap.
10. **Product-image upload** — file upload to backend storage (or S3-compatible/CDN), with drag-and-drop in the admin form.
11. **Real-time updates** — SignalR for live order-status changes on the admin dashboard and "my orders" page.
12. **PWA** — offline shell, installability, and web-push for order-status notifications.

---

*Prepared July 2026 · Frontend source: `frontend/` · How to run: see root `README.md` §3.*
