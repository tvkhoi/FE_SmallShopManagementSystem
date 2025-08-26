import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return router.parseUrl('/login');
  }

  if (!auth.isLoggedIn()) {
    // Chưa đăng nhập → chuyển về login
    router.navigate(['/login']);
    return false;
  }

  // Nếu route có yêu cầu role cụ thể (data.roles)
  const requiredRoles = route.data?.['roles'] as string[] | undefined;
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = auth.getRoles().map(r => r.toLowerCase());

    const hasRole = requiredRoles.some(role =>
      userRoles.includes(role.toLowerCase())
    );

    if (!hasRole) {
      // Nếu không có quyền → chuyển về login hoặc trang lỗi
      router.navigate(['/login']);
      return false;
    }
  }

  return true;
};
