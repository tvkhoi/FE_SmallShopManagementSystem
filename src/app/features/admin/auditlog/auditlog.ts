import { Component, inject, NgZone, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

import {
  SystemLogsService,
  SystemLogDto,
  SystemLogFilterRequest,
} from '../../../core/services/system-logs.service';
import { NzModalModule } from 'ng-zorro-antd/modal';

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
    NzModalModule
  ],
  templateUrl: './auditlog.html',
  styleUrls: ['./auditlog.scss'],
})
export class Auditlog implements OnInit {
  private logsService = inject(SystemLogsService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  // === Filters ===
  userId: number | null = null;
  userName: string = '';
  action: string = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  minDuration: number | null = null;
  maxDuration: number | null = null;

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

  ngOnInit(): void {
    this.loadLogs();
  }

  private loadLogs(): void {
    this.loading = true;

    const filters: SystemLogFilterRequest = {
      userId: this.userId ?? undefined,
      userName: this.userName || undefined,
      action: this.action || undefined,
      fromDate: this.fromDate ? this.fromDate.toISOString() : undefined,
      toDate: this.toDate ? this.toDate.toISOString() : undefined,
      minDuration: this.minDuration ?? undefined,
      maxDuration: this.maxDuration ?? undefined,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
    };

    this.logsService.getPaged(filters).subscribe({
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
}
