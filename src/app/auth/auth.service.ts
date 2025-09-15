import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  nameid: string;
  unique_name: string;
  email: string;
  exp: number;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessTokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  private loggedIn$ = new BehaviorSubject<boolean>(false);
  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  private isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  saveTokens(accessToken: string, refreshToken: string) {
    if (this.isBrowser()) {
      localStorage.setItem(this.accessTokenKey, accessToken);
      localStorage.setItem(this.refreshTokenKey, refreshToken);
      this.loggedIn$.next(true);
    }
  }

  getAccessToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.accessTokenKey) : null;
  }

  getRefreshToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.refreshTokenKey) : null;
  }

  clearTokens() {
    if (this.isBrowser()) {
      localStorage.removeItem(this.accessTokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    }
    this.loggedIn$.next(false);
  }

  getDecodedToken(): JwtPayload | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      return jwtDecode<JwtPayload>(token);
    } catch (err) {
      console.error('Token không hợp lệ', err);
      return null;
    }
  }

  getRoles(): string[] {
    const decoded = this.getDecodedToken();
    if (!decoded) return [];
    const msRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return msRole ? (Array.isArray(msRole) ? msRole : [msRole]) : [];
  }

  isAccessTokenValid(): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded || !decoded.exp) return false;
    return Math.floor(Date.now() / 1000) < decoded.exp;
  }

  isLoggedIn(): boolean {
    return this.isAccessTokenValid();
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  logout() {
    this.clearTokens();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    const refresh = this.getRefreshToken();
    if (!refresh) return throwError(() => 'No refresh token');
    return this.http
      .post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', { refreshToken: refresh })
      .pipe(
        switchMap((resp) => {
          this.saveTokens(resp.accessToken, resp.refreshToken);
          return of(resp);
        }),
        catchError((err) => {
          this.clearTokens();
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
  }

  loadUserFromStorage(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isBrowser()) {
        const token = this.getAccessToken();
        this.loggedIn$.next(!!token && this.isAccessTokenValid());
      }
      resolve();
    });
  }

  redirectByRole() {
    const roles = this.getRoles().map((r) => r.toLowerCase());

    const roleRoutes: { [key: string]: string } = {
      admin: '/admin/dashboard',
      customer: '/customer/dashboard',
      seller: '/seller/dashboard',
    };

    for (const role of roles) {
      if (roleRoutes[role]) {
        this.ngZone.run(() => {
          setTimeout(() => this.router.navigate([roleRoutes[role]]), 0);
        });
        return;
      }
    }

    this.ngZone.run(() => {
      setTimeout(() => this.router.navigate(['/login']), 0);
    });
  }
}
