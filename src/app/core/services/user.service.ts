import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { UserDTO } from '../../features/admin/users/user.dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://localhost:7277/api'; // baseUrl chung
  private http = inject(HttpClient);

  private userDataSource = new BehaviorSubject({ username: '', email: '', password: '' });
  currentUserData = this.userDataSource.asObservable();

  changeData(newUserData: { username: string; email: string; password: string }) {
    this.userDataSource.next(newUserData);
  }

  // ========== AUTH ==========
  signUp(userData: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/register`, userData, { responseType: 'text' });
  }

  login(userData: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, userData, { responseType: 'json' });
  }

  // ========== USER ==========
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/User`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/User/${id}`);
  }

  getUsersPaged(params: {
    isActive?: boolean;
    email?: string;
    username?: string;
    phone?: string;
    fullName?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<any> {
    return this.http.get(`${this.apiUrl}/User/paged`, { params: params as any });
  }

  searchUsers(keyword: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/User/search?keyword=${keyword}`);
  }

  createUser(userData: UserDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User`, userData);
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/User/${id}`, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/User/${id}/DeleteUser`, {});
  }

  activateUser(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/User/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/User/${id}/deactivate`, {});
  }

  // ========== ROLE ==========
  /** Gán nhiều role cho user */
  assignRoles(userId: number, roleIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/${userId}/assign-roles`, { roleIds });
  }

  removeRole(userId: number, roleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/User/${userId}/remove-role/${roleId}`);
  }

  // ========== PERMISSION ==========
  getUserPermissions(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/User/${userId}/permissions`);
  }

  assignPermissions(userId: number, permissions: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/${userId}/assign-permissions`, { permissions });
  }
}
