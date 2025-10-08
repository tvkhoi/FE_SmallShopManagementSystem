import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // SSR fallback
  if (!isPlatformBrowser(platformId)) {
    return router.parseUrl('/login');
  }

  const accessToken = auth.getAccessToken();
  const refreshToken = auth.getRefreshToken();

  // Không có token => chưa đăng nhập
  if (!accessToken && !refreshToken) {
    auth.clearTokens();
    return router.parseUrl('/login');
  }

  // Token hết hạn → thử refresh trước khi logout
  if (!auth.isAccessTokenValid()) {
    if (refreshToken) {
      try {
        const tokens = await firstValueFrom(auth.refreshToken());
        auth.saveTokens(tokens.accessToken, tokens.refreshToken);
      } catch (err) {
        console.warn('[AuthGuard] Refresh token failed:', err);
        auth.clearTokens();
        return router.parseUrl('/login');
      }
    } else {
      auth.clearTokens();
      return router.parseUrl('/login');
    }
  }

  //  Nếu đến đây là token đã hợp lệ
  const requiredPermissions = route.data?.['permissions'] as string[] | undefined;

  if (!requiredPermissions?.length) return true;

  const userPermissions = auth.getPermissions();
  const hasPermission = requiredPermissions.some((p) => userPermissions.includes(p));

  if (!hasPermission) {
    return router.parseUrl('/forbidden');
  }

  return true;
};
