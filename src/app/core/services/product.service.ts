import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, PagedResult } from '../models/domain/product';
import { ApiResponse } from '../models/domain/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // 🔧 API gốc của Product Controller
  private productApiUrl = 'https://localhost:7277/api/Product';

  constructor(private http: HttpClient) {}

  /** Xử lý ảnh sản phẩm (nếu null thì gán ảnh mặc định) */
  mapProductImage(product: any): Product {
    return {
      ...product,
      imageUrls:
        product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : ['assets/nen.jpg'],
      stock: product.stock ?? 0,
    };
  }

  /** Lấy ảnh đại diện (ảnh đầu tiên) */
  getProductMainImage(product: Product): string {
    return product.imageUrls.length > 0 ? product.imageUrls[0] : 'assets/nen.jpg';
  }

  /** Lấy danh sách sản phẩm phân trang */
  getPagedProducts(
    pageNumber = 1,
    pageSize = 10,
    minPrice?: number,
    maxPrice?: number,
    categoryId?: number
  ): Observable<ApiResponse<PagedResult<Product>>> {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    if (minPrice != null) params = params.set('minPrice', String(minPrice));
    if (maxPrice != null) params = params.set('maxPrice', String(maxPrice));
    if (categoryId && categoryId > 0) params = params.set('categoryId', String(categoryId));

    const url = `${this.productApiUrl}/paged`;
    return this.http.get<ApiResponse<PagedResult<Product>>>(url, { params });
  }

  addProduct(formData: FormData): Observable<ApiResponse<Product>> {
    const url = `${this.productApiUrl}`;
    return this.http.post<ApiResponse<Product>>(url, formData);
  }

  /** ✅ Tìm kiếm sản phẩm theo từ khóa + phân trang */
  searchProducts(
    keyword: string,
    pageNumber = 1,
    pageSize = 10
  ): Observable<ApiResponse<PagedResult<Product>>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    const url = `${this.productApiUrl}/search`;
    return this.http.get<ApiResponse<PagedResult<Product>>>(url, { params });
  }

  /** Lấy danh sách sản phẩm nổi bật */
  getFeaturedProducts(): Observable<ApiResponse<Product[]>> {
    const url = `${this.productApiUrl}/featured`;
    return this.http.get<ApiResponse<Product[]>>(url);
  }

  activateProduct(id: number) {
    return this.http.put<ApiResponse<any>>(`${this.productApiUrl}/${id}/activate`, {});
  }

  deactivateProduct(id: number) {
    return this.http.put<ApiResponse<any>>(`${this.productApiUrl}/${id}/deactivate`, {});
  }

  getLockedProducts(pageNumber = 1, pageSize = 10): Observable<ApiResponse<PagedResult<Product>>> {
    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    const url = `${this.productApiUrl}/locked`;
    return this.http.get<ApiResponse<PagedResult<Product>>>(url, { params });
  }

  
}
