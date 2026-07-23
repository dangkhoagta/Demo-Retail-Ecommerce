import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-wrap">
      <div class="auth-card surface">
        <p class="eyebrow text-center">Livora</p>
        <h1 class="text-center">Tạo tài khoản</h1>
        <p class="muted text-center sub">Đăng ký để mua sắm nhanh hơn</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline">
            <mat-label>Họ và tên</mat-label>
            <input matInput formControlName="fullName" />
            @if (invalid('fullName')) { <mat-error>Vui lòng nhập họ tên.</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
            @if (invalid('email')) { <mat-error>Email không hợp lệ.</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Số điện thoại (không bắt buộc)</mat-label>
            <input matInput formControlName="phoneNumber" />
          </mat-form-field>
          <div class="field-grid">
            <mat-form-field appearance="outline">
              <mat-label>Mật khẩu</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password" />
              @if (invalid('password')) { <mat-error>Tối thiểu 6 ký tự.</mat-error> }
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Xác nhận mật khẩu</mat-label>
              <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password" />
            </mat-form-field>
          </div>

          @if (form.errors?.['mismatch'] && form.get('confirmPassword')?.touched) {
            <p class="error-box">Mật khẩu xác nhận không khớp.</p>
          }
          @if (errorMsg()) { <p class="error-box">{{ errorMsg() }}</p> }

          <button type="submit" class="btn btn-accent btn-block" [disabled]="submitting()">
            {{ submitting() ? 'Đang tạo…' : 'Đăng ký' }}
          </button>
        </form>

        <p class="switch text-center muted">
          Đã có tài khoản? <a routerLink="/dang-nhap">Đăng nhập</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrap { display: grid; place-items: center; padding: 4rem 1.5rem; min-height: 70vh; }
    .auth-card { width: 100%; max-width: 480px; padding: 2.5rem; }
    .sub { margin-bottom: 1.75rem; }
    form { display: flex; flex-direction: column; }
    .error-box { background: #fbeaea; color: var(--sale); padding: .7rem 1rem; border-radius: var(--radius); font-size: .88rem; margin: 0 0 1rem; }
    .btn { margin-top: .5rem; }
    .switch { margin-top: 1.5rem; }
    .switch a { color: var(--accent); }
  `],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  readonly submitting = signal(false);
  readonly errorMsg = signal('');

  readonly form = this.fb.nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

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
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.notify.success('Đăng ký thành công! Chào mừng bạn đến với Livora.');
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.detail || 'Đăng ký thất bại. Vui lòng thử lại.');
        this.submitting.set(false);
      },
    });
  }
}
