import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

export function roleGuard(requiredRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const userRoles = auth.getRoles();
    if (userRoles && requiredRoles.some(role => userRoles.includes(role))) {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
  };
}
