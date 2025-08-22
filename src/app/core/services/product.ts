import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://dummyjson.com/products';

  constructor(private http: HttpClient) {}

  // Lấy toàn bộ danh sách sản phẩm
  getProducts(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Lấy chi tiết sản phẩm theo id
  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
