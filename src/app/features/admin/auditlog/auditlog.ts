import { Component, inject, NgZone, ChangeDetectorRef, OnInit } from '@angular/core';
import { SystemLogsService, SystemLogDto } from '../../../core/services/system-logs.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzGridModule } from 'ng-zorro-antd/grid';
@Component({
  selector: 'app-auditlog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzDatePickerModule,
    NzButtonModule,
    NzSelectModule,
    NzTableModule,
    NzPaginationModule,
    NzGridModule
  ],
  templateUrl: './auditlog.html',
  styleUrls: ['./auditlog.scss']
})
export class Auditlog implements OnInit {
  private logsService = inject(SystemLogsService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  // bộ lọc
  startDate: Date | null = null;
  endDate: Date | null = null;
  userName: string = '';
  url: string = '';
  minDuration: number | null = null;
  maxDuration: number | null = null;
  httpMethod: string = '';
  httpStatusCode: string = '';
  clientIp: string = '';
  correlationId: string = '';
  hasException: string = '';
  applicationName: string = '';

  auditLogs: any[] = [];

  // phân trang
  totalItems = 0;
  pageSize = 5;
  currentPage = 1;

  // trạng thái loading
  loading = false;

  ngOnInit(): void {
    this.loadLogs();
  }

  private loadLogs(): void {
    this.loading = true;
    const filters: Record<string, string | number | boolean | undefined> = {
      userName: this.userName,
      url: this.url,
      minDuration: this.minDuration ?? undefined,
      maxDuration: this.maxDuration ?? undefined,
      httpMethod: this.httpMethod,
      httpStatusCode: this.httpStatusCode,
      clientIp: this.clientIp,
      correlationId: this.correlationId,
      hasException: this.hasException,
      applicationName: this.applicationName,
      startDate: this.startDate ? this.startDate.toISOString() : undefined,
      endDate: this.endDate ? this.endDate.toISOString() : undefined
    };
    this.logsService.getLogs(filters).subscribe({
      next: (data: SystemLogDto[]) => {
        this.zone.run(() => {
          // Map to current table format if needed
          this.auditLogs = (data || []).map((x: SystemLogDto) => {
            const dataStr = x.data ?? '';
            const ip = dataStr.includes('IP: ')
              ? (dataStr.split('\n')[0] || '').replace('IP: ', '')
              : '';
            return {
              action: x.action,
              status: 200,
              user: x.userName,
              ip,
              date: x.createdAt,
              duration: undefined,
              app: undefined
            };
          });
          this.totalItems = this.auditLogs.length;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (e: unknown) => {
        console.error('Lỗi tải SystemLogs:', e);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterLogs() {
    this.loadLogs();
  }

  exportToExcel() {
    this.loading = true;
    console.log('Exporting logs to Excel');

    // mô phỏng xuất file
    setTimeout(() => {
      this.loading = false;
      console.log('Export done (fake)');
      // sau này có thể gọi service export thực tế
    }, 1000);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    console.log('Page changed to:', page);
  }
}
