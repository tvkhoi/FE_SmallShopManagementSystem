import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: string;
  nameid: string;
  unique_name: string;
  email: string;
  exp: number;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string | null;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string | null;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly refreshTokenKey = 'refreshToken';
  private readonly accessTokenKey = 'accessToken';
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  private readonly loggedIn$ = new BehaviorSubject<boolean>(false);
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
    const roles = msRole ? (Array.isArray(msRole) ? msRole : [msRole]) : [];
    return roles;
  }

  getEmail(): string | null {
    const decoded = this.getDecodedToken();
    if (!decoded) return null;
    return (
      decoded.email ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      decoded.unique_name ||
      null
    );
  }

  getName(): string | null {
    const decoded = this.getDecodedToken();
    if (!decoded) return null;
    return (
      decoded.nameid ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      null
    );
  }

  getId(): string | null {
    const decoded = this.getDecodedToken();
    if (!decoded) return null;
    return (
      decoded.id ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      null
    );
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
      .post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
        refreshToken: refresh,
      })
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
