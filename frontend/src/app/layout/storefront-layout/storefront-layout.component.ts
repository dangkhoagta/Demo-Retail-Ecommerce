import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-storefront-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatMenuModule, MatBadgeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="announce">
      Miễn phí giao hàng cho đơn từ 500.000₫ &nbsp;•&nbsp; Thanh toán khi nhận hàng (COD)
    </div>

    <header class="header">
      <div class="container header-inner">
        <a class="logo" routerLink="/">LIVORA</a>

        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Trang chủ</a>
          <a routerLink="/san-pham" routerLinkActive="active">Sản phẩm</a>
          <a routerLink="/gioi-thieu" routerLinkActive="active">Giới thiệu</a>
        </nav>

        <div class="actions">
          <a class="icon-btn" routerLink="/san-pham" aria-label="Tìm kiếm"><mat-icon>search</mat-icon></a>

          @if (auth.isAuthenticated()) {
            <button class="icon-btn" [matMenuTriggerFor]="accountMenu" aria-label="Tài khoản">
              <mat-icon>person</mat-icon>
            </button>
            <mat-menu #accountMenu="matMenu">
              <div class="menu-head" mat-menu-item disabled>
                <span>Xin chào,<br /><strong>{{ auth.user()?.fullName }}</strong></span>
              </div>
              <a mat-menu-item routerLink="/don-hang-cua-toi"><mat-icon>receipt_long</mat-icon> Đơn hàng của tôi</a>
              @if (auth.isAdmin()) {
                <a mat-menu-item routerLink="/quan-tri"><mat-icon>dashboard</mat-icon> Trang quản trị</a>
              }
              <button mat-menu-item (click)="logout()"><mat-icon>logout</mat-icon> Đăng xuất</button>
            </mat-menu>
          } @else {
            <a class="icon-btn" routerLink="/dang-nhap" aria-label="Đăng nhập"><mat-icon>person</mat-icon></a>
          }

          <a class="icon-btn" routerLink="/gio-hang" aria-label="Giỏ hàng">
            <mat-icon [matBadge]="cart.count()" [matBadgeHidden]="cart.count() === 0"
                      matBadgeColor="warn" matBadgeSize="small">shopping_bag</mat-icon>
          </a>
        </div>
      </div>
    </header>

    <main class="page"><router-outlet /></main>

    <footer class="footer">
      <div class="container footer-grid">
        <div>
          <div class="logo footer-logo">LIVORA</div>
          <p class="footer-text">Cửa hàng bán lẻ trực tuyến — mang phong cách sống hiện đại đến ngôi nhà của bạn.</p>
        </div>
        <div>
          <h4>Mua sắm</h4>
          <a routerLink="/san-pham">Tất cả sản phẩm</a>
          <a routerLink="/gio-hang">Giỏ hàng</a>
          <a routerLink="/don-hang-cua-toi">Đơn hàng của tôi</a>
        </div>
        <div>
          <h4>Hỗ trợ</h4>
          <a routerLink="/gioi-thieu">Về Livora</a>
          <span>Đổi trả trong 7 ngày</span>
          <span>Thanh toán COD toàn quốc</span>
        </div>
        <div>
          <h4>Liên hệ</h4>
          <span>1900 1234</span>
          <span>hotro&#64;livora.vn</span>
          <span>TP. Hồ Chí Minh, Việt Nam</span>
        </div>
      </div>
      <div class="footer-bottom">© 2026 Livora. Demo Retail E-commerce.</div>
    </footer>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100%; }
    .announce { background: var(--ink); color: var(--cream); text-align: center; font-size: .78rem; letter-spacing: .04em; padding: .55rem 1rem; }
    .header { position: sticky; top: 0; z-index: 20; background: rgba(246,242,236,.92); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
    .header-inner { display: flex; align-items: center; gap: 2rem; height: 74px; }
    .logo { font-family: var(--font-display); font-size: 1.7rem; letter-spacing: .18em; color: var(--ink); }
    .nav { display: flex; gap: 1.75rem; }
    .nav a { font-size: .82rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-soft); padding-bottom: 2px; border-bottom: 1px solid transparent; transition: color .2s, border-color .2s; }
    .nav a:hover, .nav a.active { color: var(--ink); border-color: var(--accent); }
    .actions { margin-left: auto; display: flex; align-items: center; gap: .35rem; }
    .icon-btn { display: inline-grid; place-items: center; width: 42px; height: 42px; border: none; background: transparent; color: var(--ink); cursor: pointer; border-radius: 50%; transition: background .2s; }
    .icon-btn:hover { background: var(--cream-deep); color: var(--accent); }
    .menu-head { line-height: 1.3; font-size: .85rem; }
    .page { flex: 1 1 auto; }
    .footer { background: var(--footer-bg); color: var(--footer-ink); margin-top: 4rem; }
    .footer-grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 2rem; padding-block: 3.5rem 2.5rem; }
    .footer-logo { color: #fff; font-size: 1.5rem; letter-spacing: .18em; margin-bottom: 1rem; }
    .footer-text { max-width: 32ch; font-size: .9rem; color: var(--footer-ink); }
    .footer h4 { font-family: var(--font-body); font-size: .75rem; letter-spacing: .16em; text-transform: uppercase; color: #fff; margin-bottom: 1rem; }
    .footer a, .footer span { display: block; color: var(--footer-ink); font-size: .9rem; margin-bottom: .6rem; }
    .footer a:hover { color: #fff; }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,.1); text-align: center; padding: 1.4rem; font-size: .8rem; color: var(--footer-ink); }
    @media (max-width: 880px) {
      .nav { display: none; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
    }
  `],
})
export class StorefrontLayoutComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
