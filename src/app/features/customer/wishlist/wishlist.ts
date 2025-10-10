import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteService } from '../../../core/services/favorite.service';
import { CartService } from '../../../core/services/cart.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Favorite } from '../../../core/models/domain/favorite';
import { Product } from '../../../core/models/domain/product';
import { ProductItemComponent } from '../product-item/product-item';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, ProductItemComponent],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistComponent implements OnInit {
  wishlistItems: Favorite[] = [];
  loading = false;
  selectedProduct: Product | null = null;

  constructor(
    private favoriteService: FavoriteService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites() {
    this.loading = true;
    this.favoriteService.getFavorites().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.wishlistItems = res.data.map(item => ({
            ...item,
            imageUrls: item.imageUrls?.length ? item.imageUrls : ['assets/default.jpg']
          }));
        } else {
          this.wishlistItems = [];
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách yêu thích:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  removeItem(productId: number) {
    this.favoriteService.removeFavorite(productId).subscribe({
      next: (res) => {
        if (res.success) {
          this.wishlistItems = this.wishlistItems.filter(i => i.productId !== productId);
          this.cdr.markForCheck();
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
        console.error('Lỗi khi xóa yêu thích:', err);
        this.cdr.markForCheck();
      }
    });
  }

  addToCart(item: Favorite) {
    this.cartService.addOrUpdateCart(item.productId, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.message.success(`Đã thêm "${item.productName}" vào giỏ hàng`, { nzDuration: 2000 });
        } else {
          this.message.error('Thêm vào giỏ hàng thất bại');
        }
      },
      error: (error) => {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
        this.message.error('Thêm vào giỏ hàng thất bại');
      }
    });
  }

  getProductImage(item: Favorite): string {
    return item.imageUrls?.[0] || 'assets/nen.jpg';
  }

viewDetails(p: Product) {
  this.selectedProduct = p;
  this.cdr.markForCheck();
}


  trackByProductId(index: number, item: Favorite) {
    return item.productId;
  }
}
