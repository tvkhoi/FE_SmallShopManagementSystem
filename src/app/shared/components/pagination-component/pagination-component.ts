import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, NzPaginationModule],
  template: `
    <div class="pagination-container">
      <span>Total: {{ total }}</span>
      <nz-pagination
        [nzTotal]="total"
        [(nzPageIndex)]="pageIndex"
        [nzPageSize]="pageSize"
        (nzPageIndexChange)="onPageChange($event)"
        nzShowSizeChanger="false"
      ></nz-pagination>
    </div>
  `,
})
export class PaginationComponent {
  @Input() total = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 1;

  @Output() pageChange = new EventEmitter<number>();

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.pageChange.emit(page);
  }
}
