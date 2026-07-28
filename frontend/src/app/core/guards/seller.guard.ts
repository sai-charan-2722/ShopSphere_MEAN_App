import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const sellerGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  await auth.ready();
  const role = auth.role();
  if (['seller', 'admin'].includes(role)) return true;
  toast.error('Seller access required');
  return router.parseUrl('/');
};
