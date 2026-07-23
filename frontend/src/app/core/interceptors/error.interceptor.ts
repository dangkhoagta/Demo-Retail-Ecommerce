import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/** Central HTTP error handling: 401 → sign out, network/server errors → toast. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  const isAuthAttempt = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthAttempt) {
        auth.logout();
        router.navigate(['/dang-nhap'], { queryParams: { returnUrl: router.url } });
      } else if (error.status === 0) {
        notify.error('Không thể kết nối tới máy chủ. Vui lòng kiểm tra API đang chạy.');
      } else if (error.status !== 400) {
        // 400 (validation) is surfaced inline by the forms; everything else toasts.
        const message = error.error?.detail || error.error?.title || 'Đã xảy ra lỗi.';
        notify.error(message);
      }
      return throwError(() => error);
    }),
  );
};
