import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { type HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

/**
 * Global HTTP error handling:
 *  401 → redirect to /sign-in
 *  403 → redirect home with "Access denied"
 *  0   → "Connection lost"
 *  5xx → global error toast
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const serverMessage = (error.error as { message?: string } | undefined)?.message;

      if (error.status === 401) {
        void router.navigate(['/sign-in']);
      } else if (error.status === 403) {
        toast.error(serverMessage ?? 'Access denied');
        void router.navigate(['/']);
      } else if (error.status === 0) {
        toast.error('Connection lost. Please check your network.');
      } else if (error.status >= 500) {
        toast.error(serverMessage ?? 'Something went wrong. Please try again.');
      } else if (serverMessage) {
        toast.error(serverMessage);
      }

      return throwError(() => error);
    }),
  );
};
