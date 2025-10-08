import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/domain/category';
import { ApiResponse } from '../models/domain/ApiResponse';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoryApiUrl = 'https://localhost:7277/api/categories';

  constructor(private http: HttpClient) {}

  // ✅ Lấy tất cả category
  getAllCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(this.categoryApiUrl);
  }

  // ✅ Lấy category theo id
  getCategoryById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.categoryApiUrl}/${id}`);
  }
}
