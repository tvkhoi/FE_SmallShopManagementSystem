import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

// 🟢 Import interface ApiResponse
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  errors?: any[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7277/api/Dashboard';

  private readonly summarySubject = new BehaviorSubject<any>(null);
  private readonly overviewSubject = new BehaviorSubject<any>(null);
  private readonly revenueVsCostSubject = new BehaviorSubject<any>(null);
  private readonly topProductsSubject = new BehaviorSubject<any[]>([]);
  private readonly orderSummarySubject = new BehaviorSubject<any[]>([]);

  summary$ = this.summarySubject.asObservable();
  overview$ = this.overviewSubject.asObservable();
  revenueVsCost$ = this.revenueVsCostSubject.asObservable();
  topProducts$ = this.topProductsSubject.asObservable();
  orderSummary$ = this.orderSummarySubject.asObservable();

  constructor() {
    this.refreshAll();
  }

  // Tổng quan
  loadSummary() {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/summary`).pipe(
      tap({
        next: (res) => {
          console.log('✅ Summary:', res.data);
          this.summarySubject.next(res.data);
        },
        error: (err) => console.error('Lỗi summary:', err),
      })
    ).subscribe();
  }

  // Biểu đồ tổng quan
  loadOverview(range: string = 'month') {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/overview?range=${range}`).pipe(
      tap({
        next: (res) => this.overviewSubject.next(res.data),
        error: (err) => console.error('Lỗi overview:', err),
      })
    ).subscribe();
  }

  // Doanh thu vs Chi phí
  loadRevenueVsCost(range: string = 'month') {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/revenue-vs-cost?range=${range}`).pipe(
      tap({
        next: (res) => this.revenueVsCostSubject.next(res.data),
        error: (err) => console.error('Lỗi revenue vs cost:', err),
      })
    ).subscribe();
  }

  // Top sản phẩm bán chạy
  loadTopProducts() {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/top-products`).pipe(
      tap({
        next: (res) => {
          console.log('📦 Top products:', res.data);
          this.topProductsSubject.next(res.data || []);
        },
        error: (err) => console.error('Lỗi top-products:', err),
      })
    ).subscribe();
  }

  // Tóm tắt đơn hàng
  loadOrderSummary() {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/order-summary`).pipe(
      tap({
        next: (res) => this.orderSummarySubject.next(res.data || []),
        error: (err) => console.error('Lỗi order-summary:', err),
      })
    ).subscribe();
  }

  // Refresh toàn bộ dashboard
  refreshAll(range: string = 'month') {
    this.loadSummary();
    this.loadOverview(range);
    this.loadRevenueVsCost(range);
    this.loadTopProducts();
    this.loadOrderSummary();
  }
}
