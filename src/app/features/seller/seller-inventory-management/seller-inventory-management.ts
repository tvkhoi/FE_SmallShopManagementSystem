import { PERMISSIONS } from './../../../core/constants/permission.constant';
import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InventoryService } from '../../../core/services/inventory.service';
import { InventoryHistory } from '../../../core/models/domain/inventory-history';
import { PaginationComponent } from '../../../shared/components/admin/pagination-component/pagination-component';
import { NzColDirective } from 'ng-zorro-antd/grid';
import { Button } from '../../../shared/components/admin/button/button';
import { AddProductModalComponent } from '../../../shared/components/seller/add-product-modal-component/add-product-modal-component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Product } from '../../../core/models/domain/product';
import { NzImageModule } from 'ng-zorro-antd/image';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AuthService } from '../../../auth/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-seller-inventory-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzInputModule,
    NzInputNumberModule,
    NzTagModule,
    NzIconModule,
    PaginationComponent,
    NzColDirective,
    Button,
    NzSelectModule,
    AddProductModalComponent,
    NzImageModule,
  ],
  templateUrl: './seller-inventory-management.html',
  styleUrls: ['./seller-inventory-management.scss'],
})
export class SellerInventoryManagement implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);

  histories: InventoryHistory[] = [];
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 1;
  searchTerm = '';

  isModalVisible = false;
  isNewProduct = false;
  isAddModalVisible = false;
  isProductDetailVisible = false;
  selectedProduct: Product | null = null;
  PERMISSIONS = PERMISSIONS;

  importForm!: FormGroup;

  ngOnInit() {
    this.importForm = this.fb.group({
      productId: [0],
      productName: [''],
      description: [''],
      price: [null],
      categoryId: [null],
      quantityChanged: [null, [Validators.required, Validators.min(1)]],
    });

    if (this.auth.hasPermission(PERMISSIONS.INVENTORYHISTORY_VIEW)) {
      this.loadHistory();
    } else {
      console.log('User does not have permission to view inventory histories.');
      this.cdr.detectChanges();
    }
  }

  loadHistory() {
    this.loading.set(true);
    this.inventoryService
      .getHistories(this.pageIndex, this.pageSize, this.searchTerm)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            console.log('Inventory histories loaded:', res.data.items);
            this.histories = res.data.items;
            this.totalItems = res.data.totalItems;
          } else {
            this.histories = [];
          }
        },
        error: () => {
          this.message.error('Không thể tải dữ liệu kho hàng!');
        },
      });
  }

  applyFilter() {
    this.pageIndex = 1;
    this.loadHistory();
  }

  resetFilter() {
    this.searchTerm = '';
    this.applyFilter();
  }

  onPageChange(page: number) {
    this.pageIndex = page;
    this.loadHistory();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadHistory();
  }

  openImportModal(newProduct: boolean) {
    this.isNewProduct = newProduct;
    this.isModalVisible = true;
    this.importForm.reset();

    if (newProduct) {
      this.importForm.get('productId')?.clearValidators();
    } else {
      this.importForm.get('productId')?.setValidators([Validators.required]);
    }
    this.importForm.get('productId')?.updateValueAndValidity();
  }

  handleCancel() {
    this.isModalVisible = false;
    this.importForm.reset();
  }

  submitImport() {
    if (this.importForm.invalid) return;

    const data = this.importForm.value;

    if (!this.isNewProduct && data.productId > 0) {
      this.inventoryService
        .importStock({
          productId: data.productId,
          quantityChanged: data.quantityChanged,
          action: 'Import',
        })
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.message.success('Nhập hàng thành công!');
              this.loadHistory();
              this.handleCancel();
            } else {
              this.message.error(res.message || 'Thất bại');
            }
          },
        });
    } else {
      const payload = {
        productName: data.productName,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        quantityChanged: data.quantityChanged,
        action: 'Import',
      };
      this.inventoryService.importStock(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.message.success('Thêm và nhập hàng thành công!');
            this.loadHistory();
            this.handleCancel();
          } else {
            this.message.error(res.message || 'Thất bại');
          }
        },
      });
    }
  }

  openAddProductModal() {
    this.isAddModalVisible = true;
  }

  handleProductSaved() {
    this.isAddModalVisible = false;
    this.message.success('Cập nhật danh sách kho hàng');
    this.loadHistory();
  }

  openProductDetail(product: Product | undefined) {
    if (!product) return;
    this.selectedProduct = product;
    this.isProductDetailVisible = true;
  }

  closeProductDetail() {
    this.selectedProduct = null;
    this.isProductDetailVisible = false;
  }

  exportExcel() {
    if (!this.histories || this.histories.length === 0) {
      this.message.warning('Không có dữ liệu để xuất!');
      return;
    }

    // 1. Chuyển dữ liệu sang dạng object
    const exportData = this.histories.map((h) => ({
      Mã: h.id,
      'Sản phẩm': h.product?.name || h.productId,
      'Số lượng': h.quantityChanged,
      'Hành động': h.action,
      'Thời gian': new Date(h.createdAt).toLocaleString(),
    }));

    // 2. Tạo worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    // 3. Tạo workbook
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Kho hàng': worksheet },
      SheetNames: ['Kho hàng'],
    };

    // 4. Xuất file
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `KhoHang_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}
