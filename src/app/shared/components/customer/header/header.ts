import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CartService } from '../../../../core/services/cart.service'; 
import { ProductService } from '../../../../core/services/product.service'; 
import { CartItem } from '../../../../core/models/domain/cartItem';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NzIconModule, RouterLinkActive, FormsModule,CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit {
  searchText = '';
  cartCount = 0;  

  constructor(
    private cartService: CartService, 
    public productService: ProductService, 
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCartCount();
    // Lắng nghe sự kiện thay đổi giỏ hàng và cập nhật badge
    this.cartService.cartChanged$.subscribe(() => this.loadCartCount());

    // Lấy giá trị search từ URL nếu có
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const searchParam = urlSearchParams.get('search');
        if (searchParam) {
          this.searchText = searchParam;
        }
      }
    });
  }

  onSearch() {
    const searchTerm = this.searchText.trim();
    if (searchTerm) {
      // Điều hướng đến trang products với search query
      this.router.navigate(['/products'], {
        queryParams: { 
          search: searchTerm,
          page: 1 // Reset về trang 1 khi search mới
        }
      });
    }
  }

  private loadCartCount(): void {
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (res.success) {
          this.cartCount = res.data.reduce((sum, item) => sum + item.quantity, 0);
          this.cdr.markForCheck();
        }
      },
      error: (err) => console.error(' Lỗi lấy giỏ hàng:', err)
    });
  }
}
