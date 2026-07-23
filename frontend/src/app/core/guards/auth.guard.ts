import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Requires an authenticated user; redirects to login otherwise. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/dang-nhap'], { queryParams: { returnUrl: state.url } });
};

/** Requires the Admin role; redirects home otherwise. */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated() && auth.isAdmin()) return true;
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/dang-nhap'], { queryParams: { returnUrl: state.url } });
  }
  return router.createUrlTree(['/']);
};
