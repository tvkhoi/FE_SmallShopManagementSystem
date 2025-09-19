import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemLogDto {
  id: number;
  userId: number | null;
  userName: string | null;
  action: string;
  createdAt: string;
  duration?: number;
  applicationName?: string;
  data?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface SystemLogFilterRequest {
  userId?: number | null;
  userName?: string | null;
  action?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  minDuration?: number | null;
  maxDuration?: number | null;
  pageNumber?: number | null;
  pageSize?: number;
}


@Injectable({ providedIn: 'root' })
export class SystemLogsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7277/api/SystemLogs';

  // Lấy tất cả logs
  getAll(): Observable<SystemLogDto[]> {
    return this.http.get<SystemLogDto[]>(this.apiUrl);
  }

  // Lấy log theo id
  getById(id: number): Observable<SystemLogDto> {
    return this.http.get<SystemLogDto>(`${this.apiUrl}/${id}`);
  }

  // Lấy logs phân trang & lọc
  getPaged(
    filters: SystemLogFilterRequest = {},
    pageNumber = 1,
    pageSize = 10
  ): Observable<PagedResult<SystemLogDto>> {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<PagedResult<SystemLogDto>>(`${this.apiUrl}/paged`, { params });
  }

  // Xóa nhiều logs theo ids
  deleteRange(ids: number[]): Observable<any> {
    return this.http.request('delete', `${this.apiUrl}/xóa 1 hoặc nhiều theo id`, { body: ids });
  }

  // Xóa tất cả logs
  clearAll(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear-all`);
  }

  // Xóa logs cũ
  clearOldLogs(days: number = 30): Observable<any> {
    let params = new HttpParams().set('days', days.toString());
    return this.http.delete(`${this.apiUrl}/clear-old`, { params });
  }
}
