import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApiResponse } from '../models/domain/ApiResponse';
import { LoginResponse } from '../models/ui/LoginResponse';
import { UserDTO } from '../models/ui/user.dto';
import { PagedResult } from '../models/ui/PagedResult';
import { User } from '../models/domain/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = 'https://localhost:7277/api';
  private readonly http = inject(HttpClient);

  private readonly userDataSource = new BehaviorSubject<LoginResponse | null>(null);
  currentUserData = this.userDataSource.asObservable();

  changeData(newUserData: LoginResponse) {
    this.userDataSource.next(newUserData);
  }

  // ========== AUTH ==========
  signUp(userData: {
    fullname: string;
    phoneNumber: string;
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/Auth/register`, userData).pipe(
      map((res) => {
        if (res.success) return res.data;
        throw res;
      })
    );
  }

  login(userData: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/Auth/login`, userData).pipe(
      map((res) => {
        if (res.success && res.data) return res.data;
        throw res;
      })
    );
  }

  refreshToken(refreshToken: string): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.apiUrl}/Auth/refresh-token`, refreshToken)
      .pipe(
        map((res) => {
          if (res.success && res.data) return res.data;
          throw res;
        })
      );
  }

  logout(refreshToken: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/Auth/logout`, refreshToken).pipe(
      map((res) => {
        if (res.success) return res.data;
        throw res;
      })
    );
  }

  // ========== AUTH PASSWORD RESET ==========
  forgotPassword(email: string): Observable<string> {
    return this.http
      .post<ApiResponse<{ email: string }>>(`${this.apiUrl}/User/forgot-password`, { email })
      .pipe(
        map((res) => {
          if (res.success) {
            // BE trả về data.Email
            return res.data?.email || '';
          }
          throw new Error(res.message || 'Gửi email thất bại');
        })
      );
  }

  resetPassword(payload: { email: string; code: string; newPassword: string }): Observable<string> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/User/reset-password`, payload).pipe(
      map((res) => {
        if (res.success) return res.message || 'Đặt lại mật khẩu thành công';
        throw res;
      })
    );
  }

  // ========== USER ==========
  getAllUsers(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/User`).pipe(
      map((res) => {
        if (res.success) return res.data;
        throw res;
      })
    );
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/User/${id}`).pipe(
      map((res) => {
        if (res.success) return res.data;
        throw res;
      })
    );
  }

  getUsersPaged(params: any): Observable<PagedResult<User>> {
    return this.http
      .get<ApiResponse<PagedResult<User>>>(`${this.apiUrl}/User/paged`, { params })
      .pipe(
        map((res) => {
          if (res.success) return res.data;
          throw res;
        })
      );
  }

  getUsersPagedWithFilter(params: {
    isActive?: boolean;
    email?: string;
    username?: string;
    phone?: string;
    fullName?: string;
    atDress?: string;
    createdAt?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<PagedResult<User>> {
    return this.getUsersPaged(params);
  }

  searchUsers(
    keyword: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<PagedResult<User>> {
    return this.http
      .get<ApiResponse<PagedResult<User>>>(`${this.apiUrl}/User/search`, {
        params: { keyword, pageNumber, pageSize },
      })
      .pipe(
        map((res) => {
          if (res.success) return res.data;
          throw res;
        })
      );
  }

  createUser(userData: UserDTO): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/User`, userData).pipe(
      map((res) => {
        if (res.success) return res.data;
        throw res;
      })
    );
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/User/${id}`, userData).pipe(
      map((res) => {
        if (res.success) return res.data;
        throw res;
      })
    );
  }

  deleteUser(id: number): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/User/${id}/DeleteUser`, {}).pipe(
      map((res) => {
        if (res.success) return res.data;
        throw res;
      })
    );
  }

  activateUser(id: number): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/User/${id}/activate`, {}).pipe(
      map((res) => {
        if (res.success) return res.data;
        throw res;
      })
    );
  }

  deactivateUser(id: number): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/User/${id}/deactivate`, {}).pipe(
      map((res) => {
        if (res.success) return res.data;
        throw res;
      })
    );
  }

  // ========== ROLE ==========
  assignRoles(userId: number, roleIds: number[]): Observable<any> {
    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}/User/${userId}/assign-roles`, { roleIds })
      .pipe(
        map((res) => {
          if (res.success) return res.data;
          throw res;
        })
      );
  }

  removeRole(userId: number, roleId: number): Observable<any> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiUrl}/User/${userId}/remove-role/${roleId}`)
      .pipe(
        map((res) => {
          if (res.success) return res.data;
          throw res;
        })
      );
  }

  setPassword(
    userId: number,
    payload: { currentPassword?: string; newPassword: string }
  ): Observable<any> {
    return this.http
      .put<ApiResponse<any>>(`${this.apiUrl}/User/${userId}/set-password`, payload)
      .pipe(
        map((res) => {
          if (res.success) return res.data;
          throw res;
        })
      );
  }

  // ========== PERMISSION ==========
  getUserPermissions(userId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/User/${userId}/permissions`).pipe(
      map((res) => {
        if (res.success) return res.data;
        throw res;
      })
    );
  }

  assignPermissions(userId: number, permissions: any[]): Observable<any> {
    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}/User/${userId}/assign-permissions`, { permissions })
      .pipe(
        map((res) => {
          if (res.success) return res.data;
          throw res;
        })
      );
  }
}
