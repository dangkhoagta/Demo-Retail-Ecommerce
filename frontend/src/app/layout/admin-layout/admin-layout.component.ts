import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="brand">LIVORA <span>Admin</span></div>
        <nav class="nav">
          <a routerLink="/quan-tri/tong-quan" routerLinkActive="active"><mat-icon>dashboard</mat-icon> Tổng quan</a>
          <a routerLink="/quan-tri/san-pham" routerLinkActive="active"><mat-icon>inventory_2</mat-icon> Sản phẩm</a>
          <a routerLink="/quan-tri/don-hang" routerLinkActive="active"><mat-icon>receipt_long</mat-icon> Đơn hàng</a>
          <a routerLink="/quan-tri/nguoi-dung" routerLinkActive="active"><mat-icon>group</mat-icon> Người dùng</a>
        </nav>
        <a class="store-link" routerLink="/"><mat-icon>storefront</mat-icon> Về cửa hàng</a>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <mat-toolbar class="topbar">
          <span class="spacer"></span>
          <span class="who">{{ auth.user()?.fullName }}</span>
          <button class="logout" (click)="logout()"><mat-icon>logout</mat-icon></button>
        </mat-toolbar>
        <div class="page"><router-outlet /></div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell { height: 100vh; }
    .sidenav { width: 260px; background: var(--ink); color: var(--cream); border: none; padding: 1.5rem 0; display: flex; flex-direction: column; }
    .brand { font-family: var(--font-display); font-size: 1.5rem; letter-spacing: .16em; padding: 0 1.5rem 1.5rem; color: #fff; }
    .brand span { font-family: var(--font-body); font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; color: var(--accent); display: block; margin-top: .2rem; }
    .nav { display: flex; flex-direction: column; }
    .nav a { display: flex; align-items: center; gap: .9rem; padding: .9rem 1.5rem; color: var(--footer-ink); font-size: .95rem; border-left: 3px solid transparent; transition: all .2s; }
    .nav a:hover { color: #fff; background: rgba(255,255,255,.05); }
    .nav a.active { color: #fff; border-left-color: var(--accent); background: rgba(255,255,255,.06); }
    .store-link { margin-top: auto; display: flex; align-items: center; gap: .9rem; padding: .9rem 1.5rem; color: var(--footer-ink); font-size: .9rem; }
    .store-link:hover { color: #fff; }
    .content { background: var(--cream); }
    .topbar { background: var(--surface); border-bottom: 1px solid var(--line); color: var(--ink); position: sticky; top: 0; z-index: 5; }
    .who { font-size: .9rem; margin-right: .5rem; }
    .logout { border: none; background: none; cursor: pointer; color: var(--ink-soft); display: inline-grid; place-items: center; }
    .logout:hover { color: var(--sale); }
    .page { padding: 2rem; }
  `],
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
