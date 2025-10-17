import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { Product } from '../../../core/models/domain/product';
import { ProductService } from '../../../core/services/product.service';
import { PaginationComponent } from '../../../shared/components/admin/pagination-component/pagination-component';
import { CategoryService } from '../../../core/services/category.service';
import { ActionDropdown } from '../../../shared/components/admin/action-dropdown/action-dropdown';
import { ProductFilterComponent } from '../../../shared/components/seller/product-filter-component/product-filter-component';
import { ProductTabsComponent } from '../../../shared/components/seller/product-tabs-component/product-tabs-component';
import { ProductTableComponent } from '../../../shared/components/seller/product-table-component/product-table-component';
import { AddProductModalComponent } from '../../../shared/components/seller/add-product-modal-component/add-product-modal-component';
import { NzCardModule } from "ng-zorro-antd/card";

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzTableModule,
    NzTagModule,
    NzGridModule,
    NzSpinModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    NzImageModule,
    PaginationComponent,
    ProductFilterComponent,
    ProductTabsComponent,
    ProductTableComponent,
    AddProductModalComponent,
    NzCardModule
],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class Products implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(false);
  totalItems = signal(0);

  searchName = '';
  minPrice?: number;
  maxPrice?: number;
  activeTab = signal<'active' | 'locked'>('active');
  pageSize = 10;
  currentPage = 1;
  isAddModalVisible = false;

  private readonly productService = inject(ProductService);

  ngOnInit(): void {
    this.filterProducts(1);
  }

  switchTab(tab: 'active' | 'locked') {
    if (this.activeTab() !== tab) {
      this.activeTab.set(tab);
      this.currentPage = 1;
      this.filterProducts(1);
    }
  }

  onFilter(filters: any) {
    this.searchName = filters.searchName;
    this.minPrice = filters.minPrice;
    this.maxPrice = filters.maxPrice;
    this.filterProducts(1);
  }

  resetFilters() {
    this.searchName = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.filterProducts(1);
  }

  filterProducts(page: number = 1) {
    this.loading.set(true);
    this.currentPage = page;

    const hasKeyword = this.searchName.trim() !== '';

    if (this.activeTab() === 'locked') {
      this.productService.getLockedProducts(this.currentPage, this.pageSize).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const paged = res.data;
            this.products.set(paged.items);
            this.totalItems.set(paged.totalItems);
          }
          this.loading.set(false);
        },
        error: (err) => this.loading.set(false),
      });
      return;
    }

    if (hasKeyword) {
      this.productService
        .searchProducts(this.searchName.trim(), this.currentPage, this.pageSize)
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              const paged = res.data;
              this.products.set(paged.items);
              this.totalItems.set(paged.totalItems);
            }
            this.loading.set(false);
          },
          error: (err) => this.loading.set(false),
        });
    } else {
      this.productService
        .getPagedProducts(this.currentPage, this.pageSize, this.minPrice, this.maxPrice)
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              const paged = res.data;
              this.products.set(paged.items);
              this.totalItems.set(paged.totalItems);
            }
            this.loading.set(false);
          },
          error: (err) => this.loading.set(false),
        });
    }
  }

  onPageChange(page: number) {
    this.filterProducts(page);
  }
  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.filterProducts(1);
  }

  toggleActive(p: Product) {
    const apiCall = p.isActive
      ? this.productService.deactivateProduct(p.id)
      : this.productService.activateProduct(p.id);
    this.loading.set(true);
    apiCall.subscribe({
      next: (res) => {
        if (res.success) {
          const updatedList = this.products().map((item) =>
            item.id === p.id ? { ...item, isActive: !item.isActive } : item
          );
          this.products.set(updatedList);
          this.filterProducts(this.currentPage);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAddProduct() {
    this.isAddModalVisible = true;
  }
  editProduct(p: Product) {
    console.log('Edit product', p);
  }

  handleAction(event: { action: string; data: Product }) {
    switch (event.action) {
      case 'edit':
        this.editProduct(event.data);
        break;
      case 'toggle':
        this.toggleActive(event.data);
        break;
    }
  }

  showAddModal() {
    this.isAddModalVisible = true;
  }
}
