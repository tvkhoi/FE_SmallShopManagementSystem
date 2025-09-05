import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from '../../auth/auth.service';


export interface AdminUserDto {
    id: number;
    username: string;
    email: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminUserService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    private apiUrl = 'https://localhost:7277/api/User';

    // ================= User CRUD =================
    getAllUsers(): Observable<AdminUserDto[]> {
        return this.http.get<AdminUserDto[]>(this.apiUrl);
    }

    getUserById(id: number): Observable<AdminUserDto> {
        return this.http.get<AdminUserDto>(`${this.apiUrl}/${id}`);
    }

    createUser(payload: { username: string; email: string; password?: string }): Observable<AdminUserDto> {
        return this.http.post<AdminUserDto>(this.apiUrl, payload);
    }

    updateUser(id: number, payload: { username?: string; email?: string; password?: string }): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // ================= Search =================
    searchUsers(query: string): Observable<AdminUserDto[]> {
        // Try common param names; backend will use the relevant one
        return this.http.get<AdminUserDto[]>(`${this.apiUrl}/search`, {
            params: { q: query, keyword: query, search: query }
        });
    }

    // ================= Permissions =================
    getPermissionsOfUser(userId: number): Observable<{ id: number; name: string; module: string; description: string }[]> {
        return this.http.get<{ id: number; name: string; module: string; description: string }[]>(`${this.apiUrl}/${userId}/permissions`);
    }

    assignPermissionsToUser(userId: number, permissions: { id: number; granted: boolean }[]): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${userId}/assign-permissions`, { permissions });
    }

    // ================= Auth (Register / Login) =================
    private userDataSource = new BehaviorSubject({ username: '', email: '', password: '' });
    currentUserData = this.userDataSource.asObservable();

    changeData(newUserData: { username: string; email: string; password: string }) {
        this.userDataSource.next(newUserData);
    }

    signUp(userData: { username: string; email: string; password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData, { responseType: 'text' });
    }

    login(userData: { username: string; password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, userData, { responseType: 'json' });
    }
}


