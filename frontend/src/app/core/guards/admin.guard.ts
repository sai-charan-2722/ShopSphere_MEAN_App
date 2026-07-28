import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  await auth.ready();
  if (auth.role() === 'admin') return true;
  toast.error('Admin access required');
  return router.parseUrl('/');
};
