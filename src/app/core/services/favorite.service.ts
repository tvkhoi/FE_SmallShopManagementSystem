import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/domain/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private baseUrl = 'https://localhost:7277/api/Favorite';

  constructor(private http: HttpClient) { }

  addFavorite(productId: number): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/${productId}`, {});
  }

  removeFavorite(productId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.baseUrl}/${productId}`);
  }

  getFavorites(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.baseUrl);
  }
}