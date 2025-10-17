import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzGridModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
  ],
  template: `
    <div class="filter-container mb-4">
      <form nz-form nzLayout="vertical">
        <div nz-row [nzGutter]="16">
          <!-- Tên sản phẩm -->
          <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6">
            <nz-form-item>
              <nz-form-label>Tên sản phẩm</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  [(ngModel)]="filters.searchName"
                  name="searchName"
                  placeholder="Nhập tên sản phẩm"
                  [ngModelOptions]="{ standalone: true }"
                  (keyup.enter)="applyFilter()"
                />
              </nz-form-control>
            </nz-form-item>
          </div>
          <!-- Giá tối thiểu -->
          <div nz-col [nzXs]="12" [nzSm]="12" [nzMd]="8" [nzLg]="6">
            <nz-form-item>
              <nz-form-label>Giá tối thiểu</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="number"
                  [(ngModel)]="filters.minPrice"
                  name="minPrice"
                  placeholder="0 VNĐ"
                  [ngModelOptions]="{ standalone: true }"
                />
              </nz-form-control>
            </nz-form-item>
          </div>
          <!-- Giá tối đa -->
          <div nz-col [nzXs]="12" [nzSm]="12" [nzMd]="8" [nzLg]="6">
            <nz-form-item>
              <nz-form-label>Giá tối đa</nz-form-label>
              <nz-form-control>
                <input
                  nz-input
                  type="number"
                  [(ngModel)]="filters.maxPrice"
                  name="maxPrice"
                  placeholder="1000000 VNĐ"
                  [ngModelOptions]="{ standalone: true }"
                />
              </nz-form-control>
            </nz-form-item>
          </div>
          <!-- Buttons -->
          <div nz-col [nzSpan]="24" class="text-end mt-3">
            <button nz-button nzType="default" class="me-2" (click)="reset()">
              <i nz-icon nzType="reload" class="me-1"></i> Làm mới
            </button>
            <button nz-button nzType="primary" nzSize="large" (click)="applyFilter()">
              <i nz-icon nzType="search" class="me-1"></i> Lọc
            </button>
            <button nz-button nzType="primary" nzSize="large" class="ms-2" (click)="add()">
              <i nz-icon nzType="plus" class="me-1"></i> Thêm sản phẩm
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
})
export class ProductFilterComponent {
  @Input() filters: { searchName: string; minPrice?: number | null; maxPrice?: number | null } = {
    searchName: '',
    minPrice: null,
    maxPrice: null,
  };
  @Output() filter = new EventEmitter<any>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() addProduct = new EventEmitter<void>();

  applyFilter() {
    this.filter.emit(this.filters);
  }
  reset() {
    this.resetFilters.emit();
  }
  add() {
    this.addProduct.emit();
  }
}
