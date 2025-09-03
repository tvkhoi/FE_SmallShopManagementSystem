import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private apiUrl = 'https://localhost:7277/api/Permission'; // baseUrl
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
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap((res) => {
        const permissionsWithSelected = res.map((p) => ({
          ...p,
          selected: false,
        }));
        this.userDataSource.next(permissionsWithSelected);
      }),
      catchError((err) => {
        console.error('Permission API error:', err);
        this.userDataSource.next([]); // fallback tránh trang trắng
        return of([]);
      })
    );
  }
}
