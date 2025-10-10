import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { CartItem } from '../models/domain/cartItem';
import { ApiResponse } from '../models/domain/ApiResponse';

@Injectable({ providedIn: 'root' })
export class CartService {
  private baseUrl = 'https://localhost:7277/api/Cart';
  private cartChangedSource = new BehaviorSubject<void>(undefined);
  cartChanged$ = this.cartChangedSource.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ Chuẩn hóa ảnh cho CartItem
  mapCartItemImage(item: any): CartItem {
    return {
      ...item,
      imageUrls: item.imageUrls && item.imageUrls.length > 0
        ? item.imageUrls
        : item.imageUrl
          ? [item.imageUrl]
          : ['assets/default.jpg']
    };
  }

  // ✅ Lấy ảnh chính
  getCartItemMainImage(item: CartItem): string {
    return item.imageUrls && item.imageUrls.length > 0
      ? item.imageUrls[0]
      : 'assets/default.jpg';
  }

getCart(): Observable<ApiResponse<CartItem[]>> {
  return this.http.get<ApiResponse<CartItem[]>>(this.baseUrl);
}

  // ✅ Thêm hoặc cập nhật sản phẩm
  addOrUpdateCart(productId: number, quantity: number): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/${productId}?quantity=${quantity}`, {}
    ).pipe(tap(() => this.cartChangedSource.next()));
  }

  // ✅ Xóa khỏi giỏ hàng
  removeFromCart(productId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.baseUrl}/${productId}`
    ).pipe(tap(() => this.cartChangedSource.next()));
  }
}
