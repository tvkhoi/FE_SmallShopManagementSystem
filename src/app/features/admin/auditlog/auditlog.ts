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
  ],
  templateUrl: './auditlog.html',
  styleUrls: ['./auditlog.scss'],
})
export class Auditlog implements OnInit, OnDestroy {
  private logsService = inject(SystemLogsService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private message = inject(NzMessageService);
  private modal: NzModalService = inject(NzModalService);

  // === Filters ===
  userId: number | null = null;
  userName: string = '';
  action: string = '';
  method: string = '';
  statusCode: number | null = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  minDuration: number | null = null;
  maxDuration: number | null = null;

  // === Clear old logs ===
  isClearOldVisible = false;
  clearOldDays = 30;

  // === Selected Log for Detail View ===
  selectedLog: any = null;
  isViewAuditDetailVisible = false;

  // === Table data ===
  auditLogs: SystemLogDto[] = [];

  // === Pagination ===
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  // === Loading state ===
  loading = false;

  // === Unsubscribe subject ===
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLogs(): void {
    this.loading = true;

    const filters: SystemLogFilterRequest = {
      userName: this.userName || undefined,
      action: this.action || undefined,
      method: this.method || undefined,
      statusCode: this.statusCode ?? undefined,
      fromDate: this.fromDate ? this.fromDate.toISOString() : undefined,
      toDate: this.toDate ? this.toDate.toISOString() : undefined,
      minDuration: this.minDuration ?? undefined,
      maxDuration: this.maxDuration ?? undefined,
    };

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
          console.log('API response:', res);
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

  // Phương thức trả về màu dựa trên mã trạng thái
  getStatusColor(status: string | number): string {
    const code = typeof status === 'string' ? parseInt(status.replace(/[()]/g, ''), 10) : status;

    if (code >= 200 && code < 300) return '#4FBF67';
    if (code >= 300 && code < 400) return '#FF9F38';
    if (code >= 400 && code < 600) return '#C00D49';
    return 'transparent';
  }

  getMethodColor(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET':
        return '#4FBF67';
      case 'POST':
        return '#1E90FF';
      case 'PUT':
        return '#FF9F38';
      case 'DELETE':
        return '#C00D49';
      case 'PATCH':
        return '#8A2BE2';
      default:
        return '#808080';
    }
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
}
