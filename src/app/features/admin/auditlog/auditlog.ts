import { Component } from '@angular/core';
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
export class Auditlog {
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

  // dữ liệu mẫu
  auditLogs = [
    { action: 'POST /connect/token', status: 200, user: 'admin', ip: '113.160.10.154', date: '8/29/2025 9:52 SA', duration: 27, app: 'Volo.AbpCommercia mo.HttpApi.Host' },
    { action: 'POST /connect/token', status: 200, user: 'admin', ip: '113.160.10.154', date: '8/29/2025 9:37 SA', duration: 30, app: 'Volo.AbpCommercia mo.HttpApi.Host' },
    { action: 'POST /connect/token', status: 200, user: 'admin', ip: '113.160.10.154', date: '8/29/2025 9:22 SA', duration: 27, app: 'Volo.AbpCommercia mo.HttpApi.Host' },
    { action: 'POST /connect/token', status: 200, user: 'admin', ip: '113.160.10.154', date: '8/29/2025 9:07 SA', duration: 30, app: 'Volo.AbpCommercia mo.HttpApi.Host' }
  ];

  // phân trang
  totalItems = this.auditLogs.length; 
  pageSize = 5; 
  currentPage = 1; 

  // trạng thái loading
  loading = false;

  filterLogs() {
    this.loading = true;
    console.log('Filtering logs with:', {
      startDate: this.startDate,
      endDate: this.endDate,
      userName: this.userName,
      url: this.url,
      minDuration: this.minDuration,
      maxDuration: this.maxDuration,
      httpMethod: this.httpMethod,
      httpStatusCode: this.httpStatusCode,
      clientIp: this.clientIp,
      correlationId: this.correlationId,
      hasException: this.hasException,
      applicationName: this.applicationName
    });

    // mô phỏng API call
    setTimeout(() => {
      this.loading = false;
      console.log('Filter done');
    }, 1000);
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
