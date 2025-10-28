import { PERMISSIONS } from './../../../../core/constants/permission.constant';
import {
  Component,
  Output,
  EventEmitter,
  Input,
  inject,
  signal,
  OnInit,
  OnChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Button } from '../../admin/button/button';
import { Product } from '../../../../core/models/domain/product';
import { NzSwitchComponent } from 'ng-zorro-antd/switch';
import { InventoryService } from '../../../../core/services/inventory.service';
import { AuthService } from '../../../../auth/auth.service';
import e from 'express';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzInputNumberModule,
    NzUploadModule,
    NzIconModule,
    Button,
    NzSwitchComponent,
  ],
  templateUrl: './add-product-modal-component.html',
  styleUrls: ['./add-product-modal-component.scss'],
})
export class AddProductModalComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() selectedProduct?: Product;
  @Output() isVisibleChange = new EventEmitter<boolean>();
  @Output() productSaved = new EventEmitter<void>();

  form!: FormGroup;
  fileList: NzUploadFile[] = [];
  categories: { id: number; name: string }[] = [];
  loading = signal(false);
  isCategoryModalVisible = false;
  categoryForm!: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly inventoryService = inject(InventoryService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly auth = inject(AuthService);
  PERMISSIONS = PERMISSIONS;

  ngOnInit() {
    this.form = this.fb.group({
      productName: ['', Validators.required],
      description: [''],
      categoryName: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      isActive: [true],
      isFeatured: [false],
    });

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });

    if (this.auth.hasPermission(PERMISSIONS.CATEGORIES_VIEW)) {
      this.loadCategories();
    }
    else {
      console.log('User does not have permission to view categories.');
    }
  }

  ngOnChanges() {
    if (this.selectedProduct && this.form) {
      this.form.patchValue({
        productName: this.selectedProduct.name,
        description: this.selectedProduct.description ?? '',
        categoryName: this.selectedProduct.categoryName,
        price: this.selectedProduct.price,
        stock: this.selectedProduct.stock,
        isActive: !!this.selectedProduct.isActive,
        isFeatured: !!this.selectedProduct.isFeatured,
      });

      this.fileList = (this.selectedProduct.imageUrls || []).map((url, i) => ({
        uid: `-${i}`,
        name: `image-${i}.jpg`,
        status: 'done',
        url,
      }));
    } else if (this.form) {
      this.form.reset({ isActive: true });
      this.fileList = [];
    }
  }

  loadCategories() {
    // Dùng observable trực tiếp từ service
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories; // luôn được cập nhật mới nhất
      },
      error: (err) => console.error(err),
    });
  }

  openCategoryModal() {
    this.categoryForm.reset();
    this.isCategoryModalVisible = true;
  }

  handleCancelCategory() {
    this.isCategoryModalVisible = false;
  }

  submitCategory() {
    if (this.categoryForm.invalid) return;
    const data = this.categoryForm.value;

    this.loading.set(true);
    this.categoryService.createCategory({ name: data.name }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.message.success('Thêm danh mục thành công!');
          this.isCategoryModalVisible = false;
          this.loadCategories();
          this.form.patchValue({ categoryName: data.name }); // Chọn luôn danh mục vừa thêm
        } else {
          this.message.error(res.message || 'Thêm danh mục thất bại');
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  beforeUpload = (file: NzUploadFile) => {
    const reader = new FileReader();
    reader.readAsDataURL(file as any);
    reader.onload = () => {
      file.thumbUrl = reader.result as string;
      file.originFileObj = file as any;
      this.fileList = [...this.fileList, file];
      this.cdr.detectChanges();
    };
    return false;
  };

  onUploadChange(event: { fileList: NzUploadFile[] }) {
    this.fileList = event.fileList.map((f) => ({
      ...f,
      originFileObj: f.originFileObj || (f as any),
    }));
  }

  saveProduct() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message.error('Vui lòng nhập đầy đủ thông tin hợp lệ');
      return;
    }

    const { productName, description, categoryName, price, stock, isActive } = this.form.value;
    const category = this.categories.find((c) => c.name === categoryName);
    if (!category) {
      this.message.error('Danh mục không hợp lệ');
      return;
    }

    const formData = new FormData();
    formData.append('Name', productName);
    formData.append('Description', description ?? '');
    formData.append('CategoryName', category.name);
    formData.append('Price', price.toString());
    formData.append('Stock', '0');
    formData.append('IsActive', isActive.toString());
    formData.append('IsFeatured', this.form.value.isFeatured.toString());

    for (const f of this.fileList) {
      if (f.originFileObj) formData.append('Files', f.originFileObj);
    }

    this.loading.set(true);
    const request = this.selectedProduct
      ? this.productService.updateProduct(this.selectedProduct.id, formData)
      : this.productService.addProduct(formData);

    request.subscribe({
      next: (res) => {
        if (res.success) {
          if (this.selectedProduct) {
            this.loading.set(false);
            this.message.success('Cập nhật sản phẩm thành công');
            this.productSaved.emit();
            this.close();
          } else {
            // Tạo bản ghi tồn kho với số lượng người dùng nhập
            this.inventoryService
              .importStock({
                productId: res.data.id,
                quantityChanged: stock, // Lấy từ form
                action: 'Import',
              })
              .subscribe({
                next: (stockRes) => {
                  this.loading.set(false);
                  if (stockRes.success) {
                    this.message.success('Thêm sản phẩm và nhập kho thành công!');
                  } else {
                    this.message.error(stockRes.message || 'Nhập kho thất bại');
                  }
                  this.productSaved.emit();
                  this.close();
                },
                error: (err) => {
                  this.loading.set(false);
                  console.error(err);
                },
              });
          }
        } else {
          this.loading.set(false);
          this.message.error(res.message || 'Lưu sản phẩm thất bại');
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  close() {
    this.form.reset({ isActive: true });
    this.fileList = [];
    this.isVisible = false;
    this.isVisibleChange.emit(false);
  }
}
