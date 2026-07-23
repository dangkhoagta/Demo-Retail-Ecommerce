import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/storefront-layout/storefront-layout.component').then(
        (m) => m.StorefrontLayoutComponent,
      ),
    children: [
      {
        path: '',
        title: 'Livora — Cửa hàng bán lẻ',
        loadComponent: () =>
          import('./features/storefront/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'san-pham',
        title: 'Sản phẩm — Livora',
        loadComponent: () =>
          import('./features/storefront/product-list/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
      },
      {
        path: 'san-pham/:slug',
        loadComponent: () =>
          import('./features/storefront/product-detail/product-detail.component').then(
            (m) => m.ProductDetailComponent,
          ),
      },
      {
        path: 'gio-hang',
        title: 'Giỏ hàng — Livora',
        loadComponent: () =>
          import('./features/storefront/cart/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'thanh-toan',
        title: 'Thanh toán — Livora',
        loadComponent: () =>
          import('./features/storefront/checkout/checkout.component').then(
            (m) => m.CheckoutComponent,
          ),
      },
      {
        path: 'dat-hang-thanh-cong/:id',
        title: 'Đặt hàng thành công — Livora',
        loadComponent: () =>
          import('./features/storefront/order-confirmation/order-confirmation.component').then(
            (m) => m.OrderConfirmationComponent,
          ),
      },
      {
        path: 'gioi-thieu',
        title: 'Giới thiệu — Livora',
        loadComponent: () =>
          import('./features/storefront/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'dang-nhap',
        title: 'Đăng nhập — Livora',
        loadComponent: () =>
          import('./features/storefront/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'dang-ky',
        title: 'Đăng ký — Livora',
        loadComponent: () =>
          import('./features/storefront/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: 'don-hang-cua-toi',
        title: 'Đơn hàng của tôi — Livora',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/storefront/my-orders/my-orders.component').then(
            (m) => m.MyOrdersComponent,
          ),
      },
    ],
  },
  {
    path: 'quan-tri',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tong-quan' },
      {
        path: 'tong-quan',
        title: 'Tổng quan — Quản trị',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'san-pham',
        title: 'Sản phẩm — Quản trị',
        loadComponent: () =>
          import('./features/admin/product-admin/product-admin-list.component').then(
            (m) => m.ProductAdminListComponent,
          ),
      },
      {
        path: 'san-pham/moi',
        title: 'Thêm sản phẩm — Quản trị',
        loadComponent: () =>
          import('./features/admin/product-admin/product-admin-form.component').then(
            (m) => m.ProductAdminFormComponent,
          ),
      },
      {
        path: 'san-pham/:id',
        title: 'Sửa sản phẩm — Quản trị',
        loadComponent: () =>
          import('./features/admin/product-admin/product-admin-form.component').then(
            (m) => m.ProductAdminFormComponent,
          ),
      },
      {
        path: 'don-hang',
        title: 'Đơn hàng — Quản trị',
        loadComponent: () =>
          import('./features/admin/order-admin/order-admin-list.component').then(
            (m) => m.OrderAdminListComponent,
          ),
      },
      {
        path: 'don-hang/:id',
        title: 'Chi tiết đơn — Quản trị',
        loadComponent: () =>
          import('./features/admin/order-admin/order-admin-detail.component').then(
            (m) => m.OrderAdminDetailComponent,
          ),
      },
      {
        path: 'nguoi-dung',
        title: 'Người dùng — Quản trị',
        loadComponent: () =>
          import('./features/admin/user-admin/user-admin-list.component').then(
            (m) => m.UserAdminListComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
