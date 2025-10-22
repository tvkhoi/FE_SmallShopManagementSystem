import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Button } from '../../admin/button/button';
import { CategoryModalComponent } from '../category-modal-component/category-modal-component';

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, CategoryModalComponent],
  template: `
    <div class="filter-container mb-4 p-3 border rounded bg-light">
      <form class="row g-3 align-items-end">
        <!-- Tên sản phẩm -->
        <div class="col-12 col-md-6 col-lg-3">
          <label class="form-label">Tên sản phẩm</label>
          <input
            type="text"
            class="form-control"
            [(ngModel)]="filters.searchName"
            name="searchName"
            placeholder="Nhập tên sản phẩm"
            [ngModelOptions]="{ standalone: true }"
            (keyup.enter)="applyFilter()"
          />
        </div>

        <!-- Giá tối thiểu -->
        <div class="col-6 col-md-3 col-lg-2">
          <label class="form-label">Giá tối thiểu</label>
          <input
            type="number"
            class="form-control"
            [(ngModel)]="filters.minPrice"
            name="minPrice"
            placeholder="0 VNĐ"
            [ngModelOptions]="{ standalone: true }"
          />
        </div>

        <!-- Giá tối đa -->
        <div class="col-6 col-md-3 col-lg-2">
          <label class="form-label">Giá tối đa</label>
          <input
            type="number"
            class="form-control"
            [(ngModel)]="filters.maxPrice"
            name="maxPrice"
            placeholder="1.000.000 VNĐ"
            [ngModelOptions]="{ standalone: true }"
          />
        </div>

        <!-- Nút chức năng -->
        <div class="col-12 col-lg-5">
          <div
            class="d-flex flex-wrap gap-2 justify-content-start justify-content-lg-end align-items-end"
          >
            <app-button type="primary" size="large" (click)="reset()">
              <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
            </app-button>

            <app-button type="primary" size="large" (click)="applyFilter()">
              <i class="bi bi-search me-1"></i> Lọc
            </app-button>

            <app-button type="primary" size="large" (click)="add()">
              <i class="bi bi-plus me-1"></i> Thêm sản phẩm
            </app-button>

            <app-button type="primary" size="large" (click)="openDeleteCategory()">
              <i class="bi bi-trash me-1"></i> Xóa danh mục
            </app-button>

            <app-category-modal
              [(visible)]="isCategoryModalVisible"
              (deleted)="onCategoryDeleted()"
            ></app-category-modal>
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
  @Output() categoryDeleted = new EventEmitter<void>();

  isCategoryModalVisible = false;
  selectedCategoryId: number = 0; // Gán category cần xóa từ dropdown hoặc danh sách
  selectedCategoryName: string = ''; // Gán tên tương ứng

  applyFilter() {
    this.filter.emit(this.filters);
  }

  reset() {
    this.resetFilters.emit();
  }

  add() {
    this.addProduct.emit();
  }

  openDeleteCategory() {
    this.isCategoryModalVisible = true;
  }

  onCategoryDeleted() {
    this.isCategoryModalVisible = false;
    this.categoryDeleted.emit(); // Trigger parent reload danh sách
  }
}
