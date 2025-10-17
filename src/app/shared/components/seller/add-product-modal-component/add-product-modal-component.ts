import { Component, Output, EventEmitter, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzInputNumberModule,
    NzUploadModule,
    NzIconModule,
    Button,
  ],
  templateUrl: './add-product-modal-component.html',
  styleUrls: ['./add-product-modal-component.scss'],
})
export class AddProductModalComponent implements OnInit {
  @Input() isVisible = false;
  @Output() isVisibleChange = new EventEmitter<boolean>();
  @Output() productAdded = new EventEmitter<void>();

  productName = '';
  categoryName?: string;
  price?: number;
  stock?: number;
  isActive = true;

  fileList: NzUploadFile[] = [];
  loading = signal(false);

  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly message = inject(NzMessageService);

  categories: { id: number; name: string }[] = [];

  ngOnInit() {
    this.categoryService.getAllCategories().subscribe((res) => {
      if (res.success) this.categories = res.data;
    });
  }

  // Preview ảnh trước khi upload
  beforeUpload = (file: NzUploadFile) => {
    const reader = new FileReader();
    reader.readAsDataURL(file as any);
    reader.onload = () => {
      file.thumbUrl = reader.result as string;
      file.originFileObj = file as any; // Ensure originFileObj is set
      this.fileList = [...this.fileList, file];
    };
    return false; // Prevent auto upload
  };

  // Update fileList khi xóa hoặc thêm file
  onUploadChange(event: { fileList: NzUploadFile[] }) {
    this.fileList = event.fileList.map((f) => ({
      ...f,
      originFileObj: f.originFileObj || (f as any),
    }));
  }

  saveProduct() {
    if (!this.productName || !this.categoryName || this.price == null || this.stock == null) {
      this.message.error('Vui lòng điền đầy đủ thông tin sản phẩm');
      return;
    }

    const selectedCategory = this.categories.find((c) => c.name === this.categoryName);
    if (!selectedCategory) {
      this.message.error('Danh mục không hợp lệ');
      return;
    }

    const formData = new FormData();
    formData.append('Name', this.productName);
    formData.append('CategoryName', selectedCategory.name);
    formData.append('Price', this.price.toString());
    formData.append('Stock', this.stock.toString());
    formData.append('IsActive', this.isActive.toString());

    this.fileList.forEach((f) => {
      if (f.originFileObj) {
        formData.append('Files', f.originFileObj);
      }
    });

    this.loading.set(true);

    this.productService.addProduct(formData).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.message.success('Thêm sản phẩm thành công');
          // Update fileList with new image URLs from the response
          this.fileList = res.data.imageUrls.map((url: string, index: number) => ({
            uid: `-${index}`,
            name: `image-${index}.jpg`,
            status: 'done',
            url: url,
          }));
          this.productAdded.emit();
          // Optionally, keep the modal open to show the images
          // this.close(); // Comment out if you want to keep the modal open
        } else {
          this.message.error(res.message || 'Thêm sản phẩm thất bại');
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
        this.message.error('Có lỗi xảy ra khi thêm sản phẩm');
      },
    });
  }

  close() {
    this.resetForm();
    this.isVisible = false;
    this.isVisibleChange.emit(false);
  }

  private resetForm() {
    this.productName = '';
    this.categoryName = undefined;
    this.price = undefined;
    this.stock = undefined;
    this.isActive = true;
    this.fileList = [];
  }
}
