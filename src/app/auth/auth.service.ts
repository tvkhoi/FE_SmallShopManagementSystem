import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  nameid: string; // user.Id
  unique_name: string; // user.Username
  email: string;
  exp: number;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'authToken';
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private loggedIn$ = new BehaviorSubject<boolean>(this.isLoggedIn());

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  private isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  // Lưu token sau khi login
  saveToken(token: string) {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
      this.loggedIn$.next(true);
    }
  }

  // Lấy token
  getToken(): string | null {
    if (this.isBrowser()) return localStorage.getItem(this.tokenKey);
    return null;
  }

  // Xoá token khi logout
  clearToken() {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
    }
    this.loggedIn$.next(false);
  }

  // Giải mã token
  getDecodedToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<JwtPayload>(token);
    } catch (err) {
      console.error('Token không hợp lệ', err);
      return null;
    }
  }

  // Lấy roles từ token
  getRoles(): string[] {
    const decoded = this.getDecodedToken();
    if (!decoded) return [];
    const msRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    return msRole ? (Array.isArray(msRole) ? msRole : [msRole]) : [];
  }

  // Kiểm tra login
  isLoggedIn(): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded || !decoded.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  }

  // Kiểm tra role
  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  // Điều hướng theo role
  redirectByRole() {
    const roles = this.getRoles().map(r => r.toLowerCase());

    const roleRoutes: { [key: string]: string } = {
      admin: '/admin/dashboard',
      customer: '/customer/dashboard',
      seller: '/seller/dashboard',
    };

    for (const role of roles) {
      if (roleRoutes[role]) {
        this.router.navigate([roleRoutes[role]]);
        return;
      }
    }
    this.router.navigate(['/login']);
  }

  // Logout tiện dụng
  logout() {
    this.clearToken();
    this.router.navigate(['/login']);
  }
}
