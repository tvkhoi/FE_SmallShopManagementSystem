import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/domain/ApiResponse';
import { Category } from '../models/domain/category';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  MoveProductsDto,
} from '../models/request/category.dto';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = 'https://localhost:7277/api/Category';
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  // BehaviorSubject giữ danh sách category hiện tại
  readonly categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  constructor() {
    // Khi service khởi tạo, load dữ liệu
    if(this.auth.hasPermission('CATEGORIES_VIEW')) {
      this.loadCategories();
    }
  }

  // Load category mới nhất từ server và cập nhật BehaviorSubject
  loadCategories(): void {
    this.http.get<ApiResponse<Category[]>>(this.apiUrl).subscribe({
      next: (res) => this.categoriesSubject.next(res.data),
      error: () => console.error('Không thể tải danh sách category.'),
    });
  }

  // Lấy tất cả category (observable trực tiếp từ BehaviorSubject)
  getAllCategories(): Observable<Category[]> {
    return this.categories$;
  }

  // Tạo category mới và tự động update danh sách
  createCategory(dto: CreateCategoryDto): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(this.apiUrl, dto).pipe(
      tap(() => this.loadCategories()) // Tự load lại dữ liệu
    );
  }

  // Update category và tự động update danh sách
  updateCategory(id: number, dto: UpdateCategoryDto): Observable<ApiResponse<Category>> {
    return this.http
      .put<ApiResponse<Category>>(`${this.apiUrl}/${id}`, dto)
      .pipe(tap(() => this.loadCategories()));
  }

  // Kiểm tra category còn sản phẩm không
  checkCategoryProducts(
    id: number
  ): Observable<ApiResponse<{ hasProducts: boolean; productCount: number }>> {
    return this.http.get<ApiResponse<{ hasProducts: boolean; productCount: number }>>(
      `${this.apiUrl}/${id}/check-products`
    );
  }

  // Chuyển sản phẩm sang category khác và tự load lại danh sách
  moveProducts(dto: MoveProductsDto): Observable<ApiResponse<string>> {
    return this.http
      .post<ApiResponse<string>>(`${this.apiUrl}/move-products`, dto)
      .pipe(tap(() => this.loadCategories()));
  }

  // Xóa category và tự động load lại danh sách
  deleteCategory(id: number): Observable<ApiResponse<string>> {
    return this.http
      .delete<ApiResponse<string>>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.loadCategories()));
  }
}
