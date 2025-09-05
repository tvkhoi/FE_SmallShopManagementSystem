import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemLogDto {
    id: number;
    userId: number | null;
    userName: string | null;
    action: string;
    createdAt: string;
    data: string | null;
}

@Injectable({ providedIn: 'root' })
export class SystemLogsService {
    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7277/api/SystemLogs';

    getLogs(filters: Record<string, any> = {}): Observable<SystemLogDto[]> {
        let params = new HttpParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params = params.set(key, String(value));
            }
        });
        return this.http.get<SystemLogDto[]>(this.apiUrl, { params });
    }
}



