import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7277/api/Auth'; // baseUrl
  private http = inject(HttpClient);
  private userDataSource = new BehaviorSubject({ username: '', email: '' , password: '' });
  // Observable để lấy dữ liệu người dùng hiện tại
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
