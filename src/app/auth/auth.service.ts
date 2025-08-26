import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import  { jwtDecode }  from 'jwt-decode';


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

  private isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  // Lưu token sau khi login
  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  // Lấy token
  getToken(): string | null {
    if (this.isBrowser()) return localStorage.getItem(this.tokenKey);
    return null; // SSR: không có token trong localStorage
  }

  // Xoá token khi logout
  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  // Giải mã token để lấy payload
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

  // Lấy role/roles từ token
   getRoles(): string[] {
    const decoded = this.getDecodedToken();
    if (!decoded) return [];

    const msRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (msRole) return Array.isArray(msRole) ? msRole : [msRole];

    return [];
  }

// Kiểm tra đã login chưa
  isLoggedIn(): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded) return false;

    const now = Date.now().valueOf() / 1000;
    return decoded.exp > now;
  }

  // Kiểm tra có role nào đó
  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  redirectByRole() {
    const roles = this.getRoles().map(r => r.toLowerCase());

    if (roles.includes('admin')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (roles.includes('customer')) {
      this.router.navigate(['/customer/dashboard']);
    } else if (roles.includes('seller')) {
      this.router.navigate(['/seller/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
