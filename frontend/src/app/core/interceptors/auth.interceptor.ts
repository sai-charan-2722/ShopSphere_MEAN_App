import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Attaches the Clerk session token as `Authorization: Bearer <token>` to every
 * outgoing API request. Non-API requests pass through untouched.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);

  const auth = inject(AuthService);

  return from(auth.getToken()).pipe(
    switchMap((token) => {
      if (!token) return next(req);
      const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next(authReq);
    }),
  );
};
