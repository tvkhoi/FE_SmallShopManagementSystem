import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { ApiResponse } from '../core/models/domain/ApiResponse';

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
  private readonly apiUrl = 'https://localhost:7277/api/Auth/refresh-token';
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
    if (!token) {
      console.warn('No access token found');
      return null;
    }

    // Kiểm tra JWT format cơ bản
    if (token.split('.').length !== 3) {
      console.error('Invalid JWT format - missing parts:', {
        token: token.substring(0, 50) + '...',
        parts: token.split('.').length,
      });
      this.clearTokens(); // Clear invalid token
      return null;
    }

    try {
      return jwtDecode<JwtPayload>(token);
    } catch (err) {
      console.error('Token decode failed:', {
        error: err,
        token: token.substring(0, 50) + '...',
      });
      this.clearTokens(); // Clear invalid token
      return null;
    }
  }

  getRoles(): string[] {
    const decoded = this.getDecodedToken();
    if (!decoded) return [];

    const msRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (!msRole) return [];

    return Array.isArray(msRole) ? msRole : [msRole];
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
    if (!decoded?.exp) return false;
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

    const payload = `"${refresh}"`; // backend expects raw string in body
    return this.http
      .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(this.apiUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(
        switchMap((res) => {
          if (!res.success || !res.data) return throwError(() => 'Invalid response');
          const { accessToken, refreshToken } = res.data;
          if (accessToken.split('.').length !== 3) return throwError(() => 'Invalid JWT');
          this.saveTokens(accessToken, refreshToken);
          return of({ accessToken, refreshToken });
        }),
        catchError((err) => {
          this.clearTokens();
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
  }

  async loadUserFromStorage() {
    if (!this.isBrowser()) return;

    const access = this.getAccessToken();
    const refresh = this.getRefreshToken();

    if (!access && !refresh) {
      this.loggedIn$.next(false);
      return;
    }

    if (access && this.isAccessTokenValid()) {
      this.loggedIn$.next(true);
      return;
    }

    if (refresh) {
      try {
        const tokens = await firstValueFrom(this.refreshToken());
        this.saveTokens(tokens.accessToken, tokens.refreshToken);
        this.loggedIn$.next(true);
      } catch {
        this.clearTokens();
        this.router.navigate(['/login']);
      }
    } else {
      this.clearTokens();
      this.loggedIn$.next(false);
    }
  }

  redirectByRole() {
    const roles = this.getRoles().map((r) => r.toLowerCase());
    const roleRoutes: { [key: string]: string } = {
      admin: '/admin/users',
      customer: '/customer/dashboard',
      seller: '/seller/dashboard',
    };

    for (const role of roles) {
      if (roleRoutes[role]) {
        this.ngZone.run(() => this.router.navigate([roleRoutes[role]]));
        return;
      }
    }

    this.ngZone.run(() => this.router.navigate(['/login']));
  }
}
