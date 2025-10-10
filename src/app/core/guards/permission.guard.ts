import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const required = route.data?.['permissions'] as string[] || [];
  const hasAll = required.every((p) => auth.hasPermission(p));

  if (!hasAll) {
    router.navigate(['/forbidden']);
    return false;
  }
  return true;
};
