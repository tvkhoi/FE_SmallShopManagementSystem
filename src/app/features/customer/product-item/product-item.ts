import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Product } from '../../../core/models/domain/product';
import { ProductService } from '../../../core/services/product.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-item.html',
  styleUrls: ['./product-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductItemComponent implements OnChanges {
  @Input() product: Product | null = null;
  @Output() closeModal = new EventEmitter<void>();

  // Quản lý ảnh chính
  selectedImage: string | null = null;

  constructor(
    public productService: ProductService,
    private cartService: CartService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    private favoriteService: FavoriteService,
    private authService: AuthService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && this.product) {
      // Khi product thay đổi, chọn ảnh đầu tiên
      this.selectedImage = this.getMainImage();
      this.cdr.markForCheck();
    }
  }

  close() {
    this.closeModal.emit();
  }

  getMainImage(): string {
    if (!this.product) return 'assets/default.jpg';
    // Nếu backend trả về mảng imageUrls cho nhiều ảnh
    if (this.product.imageUrls && this.product.imageUrls.length > 0) {
      return this.product.imageUrls[0];
    }
    return 'assets/default.jpg';
  }

  selectImage(url: string) {
    this.selectedImage = url;
    this.cdr.markForCheck();
  }

  addToCart() {
    if (!this.product) {
      this.message.error('Không tìm thấy thông tin sản phẩm');
      return;
    }

    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.message.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    this.cartService.addOrUpdateCart(this.product.id, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.message.success('Đã thêm sản phẩm vào giỏ hàng', { nzDuration: 2000 });
        } else {
          this.message.error('Thêm vào giỏ hàng thất bại');
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
        // this.message.error('Thêm vào giỏ hàng thất bại');
        this.cdr.markForCheck();
      }
    });
  }

  addToWishlist(product: Product) {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.message.warning('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích');
      return;
    }

    this.favoriteService.addFavorite(product.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.message.success(`Đã thêm "${product.name}" vào danh sách yêu thích`);
        } else {
          this.message.warning(res.message || 'Sản phẩm đã có trong danh sách yêu thích');
        }
        this.cdr.markForCheck();
      },
      // error: (error) => {
      //   console.error('Lỗi khi thêm vào yêu thích:', error);
      //   this.message.error('Không thể thêm sản phẩm vào yêu thích');
      //   this.cdr.markForCheck();
      // }
    });
  }
}
