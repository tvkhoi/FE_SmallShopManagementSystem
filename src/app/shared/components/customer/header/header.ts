import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CartService } from '../../../../core/services/cart.service';
import { FavoriteService } from '../../../../core/services/favorite.service';
import { AuthService } from '../../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../../../core/models/domain/cartItem';
import { Product } from '../../../../core/models/domain/product';
import { Favorite } from '../../../../core/models/domain/favorite';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, CommonModule, NzIconModule, NzDropDownModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit {
  searchText = '';
  cartCount = 0;
  wishlistCount = 0;
  cartPreview: CartItem[] = [];
  wishlistPreview: Favorite[] = [];

  constructor(
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
     private route: ActivatedRoute  
  ) {}

ngOnInit(): void {
  // ✅ Lấy keyword ngay khi khởi tạo (trước khi router event chạy)
  const params = new URLSearchParams(window.location.search);
  this.searchText = params.get('search') || '';

  this.loadCartPreview();
  this.loadWishlistPreview();

  // ✅ Theo dõi thay đổi query param để update ô tìm kiếm
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      const params = new URLSearchParams(window.location.search);
      const currentSearch = params.get('search') || '';
      if (currentSearch !== this.searchText) {
        this.searchText = currentSearch;
        this.cdr.detectChanges();
      }
    }
  });

  // ✅ Reload lại khi giỏ hàng hoặc wishlist thay đổi
  this.cartService.cartChanged$?.subscribe(() => this.loadCartPreview());
  this.favoriteService.wishlistChanged$?.subscribe(() => this.loadWishlistPreview());
}




  /**Tìm kiếm */
 onSearch() {
  const term = this.searchText.trim();
  if (term) {
    this.router.navigate(['/products'], { queryParams: { search: term, page: 1 } });
  }
}


  /**Giỏ hàng */
  loadCartPreview() {
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (res.success) {
          this.cartPreview = res.data.slice(0, 7);
          this.cartCount = res.data.reduce((sum, i) => sum + i.quantity, 0);
          this.cdr.markForCheck();
        }
      },
      error: (err) => console.error('Lỗi tải giỏ hàng:', err)
    });
  }

  /**Wishlist */
  loadWishlistPreview() {
    this.favoriteService.getFavorites().subscribe({
      next: (res) => {
        if (res.success) {
          this.wishlistPreview = res.data.slice(0, 7);
          this.wishlistCount = res.data.length;
          this.cdr.markForCheck();
        }
      },
      error: (err) => console.error('Lỗi tải wishlist:', err)
    });
  }

  /** Chuyển hướng */
  goToWishlist() {
    this.router.navigate(['/customer/wishlist']);
  }

  goToCart() {
    this.router.navigate(['/customer/cart']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
   getProductImage(item: Favorite): string {
      return item.imageUrls?.[0] || 'assets/nen.jpg';
    }
}
