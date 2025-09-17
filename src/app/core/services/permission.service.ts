import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Permission } from '../models/permission';
import { ApiResponse } from '../models/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private apiUrl = 'https://localhost:7277/api/Permission';
  private http = inject(HttpClient);
  private userDataSource = new BehaviorSubject<any[]>([]);

  userData$ = this.userDataSource.asObservable();

  updateUserData(data: any) {
    this.userDataSource.next(data);
  }

  getUserData() {
    return this.userDataSource.getValue();
  }

  getPermissions() {
    return this.http.get<ApiResponse<Permission[]>>(this.apiUrl).pipe(
      map((res) => res.data),
      tap((permissions) => {
        const permissionsWithGranted = permissions.map((p) => ({
          ...p,
          granted: false,
        }));
        this.userDataSource.next(permissionsWithGranted);
      })
    );
  }
}
