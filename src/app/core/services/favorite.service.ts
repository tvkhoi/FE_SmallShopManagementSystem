import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../models/domain/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private baseUrl = 'https://localhost:7277/api/Favorite';

  /** 🔔 Khi có thay đổi (thêm/xóa), Subject này sẽ phát tín hiệu */
  wishlistChanged$ = new Subject<void>();

  constructor(private http: HttpClient) { }

  /**thêm sản phẩm vào danh sách yêu thích */
  addFavorite(productId: number): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/${productId}`, {}).pipe(
      tap(() => this.wishlistChanged$.next()) // phát tín hiệu cập nhật
    );
  }

  /**Xóa sản phẩm khỏi danh sách yêu thích */
  removeFavorite(productId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.baseUrl}/${productId}`).pipe(
      tap(() => this.wishlistChanged$.next()) // phát tín hiệu cập nhật
    );
  }

  /**Lấy toàn bộ danh sách yêu thích */
  getFavorites(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.baseUrl);
  }
}
