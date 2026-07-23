import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { AdminUser } from '../../../core/models/auth.model';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-admin-list',
  imports: [FormsModule, MatPaginatorModule, MatSelectModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="head"><h1>Người dùng</h1><p class="muted">{{ total() }} tài khoản</p></header>

    <div class="toolbar surface">
      <input type="text" placeholder="Tìm theo tên hoặc email…" [(ngModel)]="search" (keyup.enter)="applySearch()" />
      <button class="btn btn-dark btn-sm" (click)="applySearch()">Tìm</button>
    </div>

    <div class="surface tbl-wrap">
      @if (loading()) {
        <div class="full-bleed-loading"><span class="muted">Đang tải…</span></div>
      } @else {
        <table class="tbl">
          <thead>
            <tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th></th></tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr>
                <td><strong>{{ u.fullName }}</strong></td>
                <td>{{ u.email }}</td>
                <td class="mono">{{ u.phoneNumber || '—' }}</td>
                <td class="roles-cell">
                  <mat-select multiple [ngModel]="u.roles" (ngModelChange)="saveRoles(u, $event)" class="role-select">
                    @for (r of roles(); track r) { <mat-option [value]="r">{{ r }}</mat-option> }
                  </mat-select>
                </td>
                <td>
                  @if (u.isLockedOut) { <span class="status locked">Đã khoá</span> }
                  @else { <span class="status ok">Hoạt động</span> }
                </td>
                <td>{{ u.createdAt | date: 'dd/MM/yyyy' }}</td>
                <td class="r">
                  <button class="act" [class.del]="!u.isLockedOut" (click)="toggleLock(u)">
                    {{ u.isLockedOut ? 'Mở khoá' : 'Khoá' }}
                  </button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="empty muted">Không có người dùng.</td></tr>
            }
          </tbody>
        </table>
        <mat-paginator [length]="total()" [pageSize]="pageSize" [pageIndex]="page() - 1"
                       [pageSizeOptions]="[10, 20, 50]" (page)="onPage($event)" />
      }
    </div>
  `,
  styles: [`
    .head { margin-bottom: 1.5rem; }
    .toolbar { display: flex; gap: .5rem; padding: 1rem; margin-bottom: 1.25rem; }
    .toolbar input { flex: 1; padding: .6rem .8rem; border: 1px solid var(--line); border-radius: var(--radius); font-family: inherit; }
    .tbl-wrap { padding: .5rem 1rem 1rem; overflow-x: auto; }
    .tbl { width: 100%; border-collapse: collapse; min-width: 820px; }
    .tbl th { text-align: left; font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-soft); padding: .75rem .5rem; border-bottom: 1px solid var(--line); }
    .tbl td { padding: .7rem .5rem; border-bottom: 1px solid var(--line); font-size: .9rem; }
    .mono { font-family: ui-monospace, monospace; font-size: .84rem; }
    .roles-cell { min-width: 180px; }
    .role-select { border: 1px solid var(--line); border-radius: var(--radius); padding: .35rem .6rem; background: #fff; }
    .status { padding: .2rem .6rem; border-radius: 999px; font-size: .74rem; }
    .status.ok { background: #dcecdf; color: var(--success); }
    .status.locked { background: #f6dede; color: var(--sale); }
    .r { text-align: right; }
    .act { border: none; background: none; cursor: pointer; color: var(--accent); font-family: inherit; font-size: .85rem; padding: .2rem .5rem; }
    .act.del { color: var(--sale); }
    .empty { text-align: center; padding: 2rem; }
  `],
})
export class UserAdminListComponent {
  private readonly userService = inject(UserService);
  private readonly notify = inject(NotificationService);

  readonly users = signal<AdminUser[]>([]);
  readonly roles = signal<string[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly pageSize = 20;
  search = '';

  constructor() {
    this.userService.getRoles().subscribe((r) => this.roles.set(r));
    this.load();
  }

  applySearch(): void {
    this.page.set(1);
    this.load();
  }

  onPage(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.load();
  }

  saveRoles(user: AdminUser, roles: string[]): void {
    if (roles.length === 0) {
      this.notify.error('Người dùng phải có ít nhất một vai trò.');
      this.load();
      return;
    }
    this.userService.updateRoles(user.id, roles).subscribe((updated) => {
      this.notify.success(`Đã cập nhật vai trò cho ${updated.fullName}.`);
      this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
    });
  }

  toggleLock(user: AdminUser): void {
    const lock = !user.isLockedOut;
    this.userService.setLockout(user.id, lock).subscribe(() => {
      this.notify.success(lock ? 'Đã khoá tài khoản.' : 'Đã mở khoá tài khoản.');
      this.users.update((list) =>
        list.map((u) => (u.id === user.id ? { ...u, isLockedOut: lock } : u)),
      );
    });
  }

  private load(): void {
    this.loading.set(true);
    this.userService
      .getPaged({ page: this.page(), pageSize: this.pageSize, search: this.search || undefined })
      .subscribe({
        next: (result) => {
          this.users.set(result.items);
          this.total.set(result.totalCount);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
