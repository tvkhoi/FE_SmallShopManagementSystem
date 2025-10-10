import { PERMISSION_GROUPS } from './../../../core/constants/permission-groups';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { Component, inject, NgZone, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  SystemLogsService,
  SystemLogDto,
  SystemLogFilterRequest,
} from '../../../core/services/system-logs.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ExcelExportService } from '../../../core/services/excel-export.service';
import { PaginationComponent } from '../../../shared/components/admin/pagination-component/pagination-component';
import { getMethodColor, getStatusColor } from '../../../core/utils/index';
import { Button } from '../../../shared/components/admin/button/button';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auditlog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzDatePickerModule,
    NzButtonModule,
    NzTableModule,
    NzPaginationModule,
    NzGridModule,
    NzTooltipModule,
    NzModalModule,
    NzIconDirective,
    NzSelectModule,
    NzDropDownModule,
    NzMenuModule,
    PaginationComponent,
    Button,
  ],
  templateUrl: './auditlog.html',
  styleUrls: ['./auditlog.scss'],
})
export class Auditlog implements OnInit, OnDestroy {
  private readonly logsService = inject(SystemLogsService);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly message = inject(NzMessageService);
  private readonly modal: NzModalService = inject(NzModalService);
  private readonly excelExportService = inject(ExcelExportService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  getStatusColor = getStatusColor;
  getMethodColor = getMethodColor;
  PERMISSION_GROUPS = PERMISSION_GROUPS;

  // Filters
  userId: number | null = null;
  userName: string = '';
  action: string = '';
  method: string = '';
  statusCode: number | null = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  minDuration: number | null = null;
  maxDuration: number | null = null;

  // Clear old logs
  isClearOldVisible = false;
  clearOldDays = 30;

  // Selected Log for Detail View
  selectedLog: any = null;
  isViewAuditDetailVisible = false;

  // Table data
  auditLogs: SystemLogDto[] = [];

  // Pagination
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  // Loading state
  loading = false;

  // Unsubscribe subject
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Kiểm tra nếu user có quyền ADMIN
    const hasAdminPermission = PERMISSION_GROUPS.ADMIN.every(p => this.auth.hasPermission(p));

    if (hasAdminPermission) {
      this.loadLogs();
    } else {
       this.router.navigate(['/forbidden']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLogs(): void {
    this.loading = true;

    const filters: SystemLogFilterRequest = {
      userName: this.userName?.trim() || undefined,
      action: this.action?.trim() || undefined,
      method: this.method?.trim() || undefined,
      statusCode: this.statusCode ?? undefined,
      fromDate: this.fromDate ? this.fromDate.toISOString() : undefined,
      toDate: this.toDate ? this.toDate.toISOString() : undefined,
      minDuration: this.minDuration ?? undefined,
      maxDuration: this.maxDuration ?? undefined,
    };

    // Bỏ các field null/undefined/chuỗi rỗng
    const filteredRequest: SystemLogFilterRequest = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        return true;
      })
    ) as SystemLogFilterRequest;

    this.logsService
      .getPaged(filteredRequest, this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.auditLogs = res.items || [];
            this.totalItems = res.totalCount || 0;
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('Error loading logs', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  filterLogs(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  resetFilters(): void {
    this.userId = null;
    this.userName = '';
    this.action = '';
    this.method = '';
    this.statusCode = null;
    this.fromDate = null;
    this.toDate = null;
    this.minDuration = null;
    this.maxDuration = null;
    this.currentPage = 1;
    this.loadLogs();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadLogs();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadLogs();
  }

  viewAuditDetail(log: any) {
    this.selectedLog = log;
    this.isViewAuditDetailVisible = true;
  }

  handleViewAuditDetailCancel() {
    this.isViewAuditDetailVisible = false;
    this.selectedLog = null;
  }

  onMethodChange(value: string | null): void {
    this.method = value || '';
    this.currentPage = 1;
    this.loadLogs();
  }

  clearAllLogs() {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc muốn xóa lịch sử hệ thống này?',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () =>
        this.logsService.clearAll().subscribe({
          next: (res: any) => {
            this.message.success(res.message || 'Đã xóa toàn bộ log');
            this.loadLogs();
          },
          error: () => this.message.error('Xóa log thất bại'),
        }),
      nzCancelText: 'Hủy',
      nzOnCancel: () => this.message.info('Hủy xóa log hệ thống'),
    });
  }

  openClearOldModal() {
    this.isClearOldVisible = true;
  }

  confirmClearOld() {
    this.logsService.clearOldLogs(this.clearOldDays).subscribe({
      next: (res: any) => {
        this.message.success(res.message || `Đã xóa log cũ hơn ${this.clearOldDays} ngày`);
        this.loadLogs();
      },
      error: (err) => {
        this.message.error(err.error || 'Không thể xóa log theo ngày');
      },
    });
    this.isClearOldVisible = false;
  }

  exportLogs(): void {
    if (this.auditLogs.length === 0) {
      this.message.warning('Không có log để xuất');
      return;
    }
    this.excelExportService.exportAsExcelFile(this.auditLogs, 'system_logs');
  }

  sortByRequest = (a: SystemLogDto, b: SystemLogDto): number => {
    if (a.statusCode !== b.statusCode) return a.statusCode - b.statusCode;
    if (a.method !== b.method) return a.method.localeCompare(b.method);
    return a.path.localeCompare(b.path);
  };

  sortByUserName = (a: SystemLogDto, b: SystemLogDto): number =>
    (a.userName || '').localeCompare(b.userName || '');

  sortByDate = (a: SystemLogDto, b: SystemLogDto): number =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

  sortByDuration = (a: SystemLogDto, b: SystemLogDto): number =>
    (a.duration || 0) - (b.duration || 0);

  sortByData = (a: SystemLogDto, b: SystemLogDto): number =>
    (a.data || '').localeCompare(b.data || '');

  sortByAppName = (a: SystemLogDto, b: SystemLogDto): number =>
    (a.applicationName || '').localeCompare(b.applicationName || '');
}
