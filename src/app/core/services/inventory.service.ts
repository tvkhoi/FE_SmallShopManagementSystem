import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/domain/ApiResponse';
import { PagedResult } from '../models/ui/PagedResult';
import { InventoryHistory } from '../models/domain/inventory-history';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7277/api/InventoryHistory';

  // ================== GET PAGED ==================
  getHistories(
    pageNumber = 1,
    pageSize = 10,
    searchTerm = ''
  ): Observable<ApiResponse<PagedResult<InventoryHistory>>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    return this.http.get<ApiResponse<PagedResult<InventoryHistory>>>(this.apiUrl, { params });
  }

  // ================== GET BY PRODUCT ==================
  getHistoriesByProduct(productId: number): Observable<ApiResponse<InventoryHistory[]>> {
    return this.http.get<ApiResponse<InventoryHistory[]>>(`${this.apiUrl}/product/${productId}`);
  }

  // ================== IMPORT / NHẬP HÀNG ==================
  importStock(data: {
    productId?: number;
    productName?: string;
    quantityChanged: number;
    price?: number;
    categoryId?: number;
    description?: string;
    action?: string;
  }): Observable<ApiResponse<InventoryHistory>> {
    return this.http.post<ApiResponse<InventoryHistory>>(`${this.apiUrl}/import`, data);
  }
}
