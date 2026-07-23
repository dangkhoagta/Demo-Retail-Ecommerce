import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-wrap">
      <div class="auth-card surface">
        <p class="eyebrow text-center">Livora</p>
        <h1 class="text-center">Đăng nhập</h1>
        <p class="muted text-center sub">Chào mừng bạn quay lại</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
            @if (invalid('email')) { <mat-error>Email không hợp lệ.</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Mật khẩu</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="current-password" />
            @if (invalid('password')) { <mat-error>Vui lòng nhập mật khẩu.</mat-error> }
          </mat-form-field>

          @if (errorMsg()) { <p class="error-box">{{ errorMsg() }}</p> }

          <button type="submit" class="btn btn-accent btn-block" [disabled]="submitting()">
            {{ submitting() ? 'Đang đăng nhập…' : 'Đăng nhập' }}
          </button>
        </form>

        <p class="switch text-center muted">
          Chưa có tài khoản? <a routerLink="/dang-ky">Đăng ký ngay</a>
        </p>
        <div class="hint">
          <strong>Tài khoản demo</strong>
          <span>Admin: admin&#64;retail.local / Admin&#64;123</span>
          <span>Khách: khachhang&#64;retail.local / Customer&#64;123</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrap { display: grid; place-items: center; padding: 4rem 1.5rem; min-height: 70vh; }
    .auth-card { width: 100%; max-width: 440px; padding: 2.5rem; }
    .sub { margin-bottom: 1.75rem; }
    form { display: flex; flex-direction: column; }
    .error-box { background: #fbeaea; color: var(--sale); padding: .7rem 1rem; border-radius: var(--radius); font-size: .88rem; margin: 0 0 1rem; }
    .btn { margin-top: .5rem; }
    .switch { margin-top: 1.5rem; }
    .switch a { color: var(--accent); }
    .hint { margin-top: 1.5rem; padding: 1rem; background: var(--cream-deep); border-radius: var(--radius); display: flex; flex-direction: column; gap: .3rem; font-size: .82rem; color: var(--ink-soft); }
    .hint strong { color: var(--ink); }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly errorMsg = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMsg.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.detail || 'Email hoặc mật khẩu không đúng.');
        this.submitting.set(false);
      },
    });
  }
}
