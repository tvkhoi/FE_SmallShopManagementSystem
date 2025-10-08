import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, PagedResult } from '../models/domain/product';
import { ApiResponse } from '../models/domain/ApiResponse';

// Using shared ApiResponse from domain models

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productApiUrl = 'https://localhost:7277/api/Product';

  constructor(private http: HttpClient) { }

  //  Xử lý ảnh sản phẩm (nếu null thì gán ảnh mặc định)
  mapProductImage(product: any): Product {
    return {
      ...product,
      imageUrls: product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls
        : ['assets/default.jpg'],
      stock: product.stock ?? 0
    };
  }

  // Lấy ảnh đại diện (ảnh đầu tiên)
  getProductMainImage(product: Product): string {
    return product.imageUrls.length > 0 ? product.imageUrls[0] : 'assets/default.jpg';
  }

  //  Lấy sản phẩm phân trang + filter
  getPagedProducts(
    pageNumber = 1,
    pageSize = 10,
    minPrice?: number,
    maxPrice?: number,
    categoryId?: number
  ): Observable<ApiResponse<PagedResult<Product>>> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    if (minPrice !== undefined) params = params.set('minPrice', String(minPrice));
    if (maxPrice !== undefined) params = params.set('maxPrice', String(maxPrice));
    if (categoryId !== undefined && categoryId > 0) params = params.set('categoryId', String(categoryId));

    const url = `${this.productApiUrl}/paged`;
    console.log('🌐 ProductService - Making request:', {
      url,
      params: params.toString(),
      fullUrl: `${url}?${params.toString()}`
    });

    return this.http.get<ApiResponse<PagedResult<Product>>>(url, { params });
  }
  // Tìm kiếm sản phẩm theo từ khóa + phân trang
  searchProducts(
    keyword: string,
    pageNumber = 1,
    pageSize = 10
  ): Observable<ApiResponse<PagedResult<Product>>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));

    return this.http.get<ApiResponse<PagedResult<Product>>>(`${this.productApiUrl}/search`, { params });
  }
// Lấy danh sách sản phẩm nổi bật
getFeaturedProducts(): Observable<ApiResponse<Product[]>> {
  const url = `${this.productApiUrl}/featured`;
  return this.http.get<ApiResponse<Product[]>>(url);
}

}
