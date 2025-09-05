import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = 'https://localhost:7277/api/Role';
  private http = inject(HttpClient);

  // ====== Roles ======

  getAllRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getRoleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createRole(role: { name: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, role);
  }

  updateRole(id: number, role: { name: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, role);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // ====== Permissions for Role ======

  getPermissionsByRole(roleId: number): Observable<any> {
    console.log(
      'Fetching permissions for roleId:',
      this.http.get<any>(`${this.apiUrl}/${roleId}/permissions`)
    );
    return this.http.get<any>(`${this.apiUrl}/${roleId}/permissions`);
  }

  assignPermissionsToRole(
    roleId: number,
    permissions: { id: number; granted: boolean }[]
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${roleId}/assign-permissions`, { permissions });
  }

  // ====== Search Roles ======
  searchRoles(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: { keyword },
    });
  }
}
