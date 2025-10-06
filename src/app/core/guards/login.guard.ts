import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (auth.isLoggedIn()) {
    // Nếu đã đăng nhập → chặn vào login/signup và chuyển hướng sang users
    router.navigate(['/admin/users']);
    return false;
  }
  return true; // chưa login thì cho vào login/signup
};
