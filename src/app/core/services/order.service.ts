import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/domain/ApiResponse';
import { Order, OrderHistory } from '../models/domain/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7277/api/Order';

  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSubject.asObservable();

  // Lấy tất cả đơn hàng
  getOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(this.apiUrl).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.ordersSubject.next(res.data);
        } else {
          console.warn('API response success=false or no data');
        }
      })
    );
  }

  // Lấy lịch sử đơn hàng theo userId
  getOrderHistory(userId: number): Observable<ApiResponse<OrderHistory[]>> {
    return this.http.get<ApiResponse<OrderHistory[]>>(
      `${this.apiUrl}/history/${userId}`
    );
  }

  // Lấy chi tiết đơn hàng
  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`);
  }

  // Checkout đơn hàng
  checkout(): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/checkout`, {});
  }

  // Cập nhật trạng thái đơn hàng
  updateStatus(orderId: number, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${orderId}/status`,
      `"${status}"`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Xóa đơn hàng
  deleteOrder(orderId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${orderId}`);
  }
}
