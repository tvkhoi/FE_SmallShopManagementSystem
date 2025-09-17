import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/ApiResponse';
import { Role } from '../models/role';
import { RolePermissionsResponse } from '../../features/admin/roles/role-permission-respose.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = 'https://localhost:7277/api/Role';
  private http = inject(HttpClient);

  // ====== Roles ======
  getAllRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(this.apiUrl);
  }

  getRoleById(id: number): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.apiUrl}/${id}`);
  }

  createRole(role: { name: string }): Observable<ApiResponse<{ id: number; name: string }>> {
    return this.http.post<ApiResponse<{ id: number; name: string }>>(this.apiUrl, role);
  }

  updateRole(id: number, role: { name: string }): Observable<ApiResponse<{ id: number; name: string }>> {
    return this.http.put<ApiResponse<{ id: number; name: string }>>(`${this.apiUrl}/${id}`, role);
  }

  deleteRole(id: number): Observable<ApiResponse<{ roleId: number }>> {
    return this.http.delete<ApiResponse<{ roleId: number }>>(`${this.apiUrl}/${id}`);
  }

  // ====== Permissions for Role ======
  getPermissionsByRole(roleId: number): Observable<ApiResponse<RolePermissionsResponse>> {
    return this.http.get<ApiResponse<RolePermissionsResponse>>(`${this.apiUrl}/${roleId}/permissions`);
  }

  assignPermissionsToRole(roleId: number, permissions: { id: number; granted: boolean }[]): Observable<ApiResponse<RolePermissionsResponse>> {
    return this.http.post<ApiResponse<RolePermissionsResponse>>(`${this.apiUrl}/${roleId}/assign-permissions`, { permissions });
  }

  // ====== Search Roles ======
  searchRoles(keyword: string): Observable<ApiResponse<Role[]>> {
    let params = new HttpParams().set('keyword', keyword);
    return this.http.get<ApiResponse<Role[]>>(`${this.apiUrl}/search`, { params });
  }

  // ====== Paged Roles ======
  getPagedRoles(pageNumber: number = 1, pageSize: number = 10): Observable<ApiResponse<{ items: Role[]; totalItems: number }>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<{ items: Role[]; totalItems: number }>>(`${this.apiUrl}/paged`, { params });
  }
}