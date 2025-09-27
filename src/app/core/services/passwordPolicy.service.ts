import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../models/domain/ApiResponse';
import { PasswordPolicy } from '../models/domain/PasswordPolicy';

@Injectable({
  providedIn: 'root',
})
export class PasswordPolicyService {
  private readonly apiUrl = 'https://localhost:7277/api/PasswordPolicy';
  private readonly http = inject(HttpClient);

  // GET: lấy password policy hiện tại
  getPolicy(): Observable<PasswordPolicy> {
    return this.http.get<ApiResponse<PasswordPolicy>>(this.apiUrl).pipe(
      map((res) => {
        if (res.success && res.data) return res.data;
        throw res;
      })
    );
  }

  // PUT: cập nhật password policy
  updatePolicy(policy: PasswordPolicy): Observable<PasswordPolicy> {
    return this.http.put<ApiResponse<PasswordPolicy>>(this.apiUrl, policy).pipe(
      map((res) => {
        if (res.success && res.data) return res.data;
        throw res;
      })
    );
  }

  // POST: validate mật khẩu
  validatePassword(password: string): Observable<string> {
    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}/validate`, password, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(
        map((res) => {
          if (res.success) return res.message || 'Mật khẩu hợp lệ';
          throw res;
        })
      );
  }
}
