import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { getFirstAccessibleAdminRoute, getFirstAccessibleCustomerRoute, getFirstAccessibleSellerRoute, getUserInterface } from '../utils/permission.utils'

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Nếu user đã đăng nhập -> điều hướng dựa theo quyền
  if (auth.isLoggedIn()) {
    const perms = auth.getPermissions();
    const ui = getUserInterface(perms);

    const redirectMap: Record<string, string> = {
      admin: getFirstAccessibleAdminRoute(perms),
      seller: getFirstAccessibleSellerRoute(perms),
      customer: getFirstAccessibleCustomerRoute(perms),
      unknown: '/',
    };

    const target = redirectMap[ui] || '/';
    router.navigate([target]);
    return false; // chặn vào login/sign-up
  }

  // Chưa đăng nhập thì cho vào trang login
  return true;
};
