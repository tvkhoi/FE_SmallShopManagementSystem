import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApiResponse } from '../models/ApiResponse';
import { Role } from '../models/role';
import { Permission } from '../models/permission';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = 'https://localhost:7277/api/Role';
  private http = inject(HttpClient);

  // BehaviorSubjects
  private rolesSource = new BehaviorSubject<Role[]>([]);
  roles$ = this.rolesSource.asObservable();

  private rolePermissionsSource = new BehaviorSubject<{
    roleId: number;
    permissions: Permission[];
  } | null>(null);
  rolePermissions$ = this.rolePermissionsSource.asObservable();

  // ===== HELPER =====
  private handleResponse<T>(res: ApiResponse<T>): T {
    if (res.success && res.data !== null && res.data !== undefined) return res.data;
    throw res;
  }

  // ===== ROLES =====
  getAllRoles(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(this.apiUrl).pipe(
      map((res) => this.handleResponse(res)),
      map((data) => {
        this.rolesSource.next(data);
        return data;
      })
    );
  }

  getRoleById(id: number): Observable<Role> {
    return this.http
      .get<ApiResponse<Role>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => this.handleResponse(res)));
  }

  createRole(role: { name: string }): Observable<{ id: number; name: string }> {
    return this.http.post<ApiResponse<{ id: number; name: string }>>(this.apiUrl, role).pipe(
      map((res) => {
        const data = this.handleResponse(res);
        const currentRoles = this.rolesSource.value ?? [];
        this.rolesSource.next([...currentRoles, { id: data.id, name: data.name, userCount: 0 }]);
        return data;
      })
    );
  }

  updateRole(id: number, role: { name: string }): Observable<{ id: number; name: string }> {
    return this.http
      .put<ApiResponse<{ id: number; name: string }>>(`${this.apiUrl}/${id}`, role)
      .pipe(
        map((res) => {
          const data = this.handleResponse(res);
          const currentRoles = this.rolesSource.value ?? [];
          const index = currentRoles.findIndex((r) => r.id === id);
          if (index !== -1) currentRoles[index].name = data.name;
          this.rolesSource.next([...currentRoles]);
          return data;
        })
      );
  }

  deleteRole(id: number): Observable<{ roleId: number }> {
    return this.http.delete<ApiResponse<{ roleId: number }>>(`${this.apiUrl}/${id}`).pipe(
      map((res) => {
        const data = this.handleResponse(res);
        const currentRoles = this.rolesSource.value ?? [];
        this.rolesSource.next(currentRoles.filter((r) => r.id !== id));
        return data;
      })
    );
  }

  // ===== PERMISSIONS =====
  getPermissionsByRole(roleId: number): Observable<{ roleId: number; permissions: Permission[] }> {
    return this.http
      .get<ApiResponse<{ roleId: number; permissions: Permission[] }>>(
        `${this.apiUrl}/${roleId}/permissions`
      )
      .pipe(
        map((res) => {
          const data = this.handleResponse(res);
          this.rolePermissionsSource.next(data);
          return data;
        })
      );
  }

  assignPermissionsToRole(
    roleId: number,
    permissions: { id: number; granted: boolean }[]
  ): Observable<{ roleId: number; permissions: Permission[] }> {
    return this.http
      .post<ApiResponse<{ roleId: number; permissions: Permission[] }>>(
        `${this.apiUrl}/${roleId}/assign-permissions`,
        { permissions }
      )
      .pipe(
        map((res) => {
          const data = this.handleResponse(res);
          this.rolePermissionsSource.next(data);
          return data;
        })
      );
  }

  // ===== SEARCH ROLES =====
  searchRoles(
    keyword: string,
    pageNumber: number,
    pageSize: number
  ): Observable<{ items: Role[]; totalItems: number }> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/search`, { params }).pipe(
      map((res) => {
        const data = this.handleResponse(res);
        return {
          items: data.items,
          totalItems: data.totalCount, 
        };
      })
    );
  }

  // ===== PAGED ROLES =====
  getPagedRoles(
    pageNumber: number = 1,
    pageSize: number = 7
  ): Observable<{ items: Role[]; totalItems: number }> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/paged`, { params }).pipe(
      map((res) => {
        const data = this.handleResponse(res);
        return {
          items: data.items,
          totalItems: data.totalCount, 
        };
      })
    );
  }
}
