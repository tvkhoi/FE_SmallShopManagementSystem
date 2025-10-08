import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { PagedResult, Product } from '../../../core/models/domain/product';
import { FavoriteService } from '../../../core/services/favorite.service'
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProductItemComponent } from '../product-item/product-item';
import { PaginationComponent } from "../../../shared/components/admin/pagination-component/pagination-component";
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/domain/ApiResponse';


@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
    ProductItemComponent,
    PaginationComponent
  ],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit {
    @Input() isFeatured: boolean = false;
  products: Product[] = [];
  filteredProducts: Product[] = [];

  categories: string[] = [];
  selectedCategory: string = 'Tất cả';

  minPrice = 0;
  maxPrice = 100000000;

  pageNumber = 1;
  pageSize = 12;
  totalPages = 1;

  isLoading = true;
  selectedProduct: Product | null = null;
  searchTerm: string = '';

  // Removed unnecessary ViewChild to avoid extra change detection work

  constructor(
    public productService: ProductService,
    private cartService: CartService,
    private message: NzMessageService,
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Subscribe to query params
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';
      this.pageNumber = Number(params['page']) || 1;

      if (this.searchTerm) {
        // Nếu có search term thì gọi API search
        this.searchProducts();
      } else {
        // Không có search term thì load tất cả sản phẩm
        this.loadProducts();
      }
    });
  }

loadProducts(): void {
  this.isLoading = true;

  if (this.isFeatured) {
    // Sản phẩm nổi bật
    this.productService.getFeaturedProducts().subscribe({
      next: (res) => {
        this.products = (res.data || []).map(p => this.productService.mapProductImage(p));
        this.filteredProducts = this.products;
        this.totalPages = 1;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Lỗi khi load sản phẩm nổi bật:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });

  } else {
    // Sản phẩm phân trang
    this.productService.getPagedProducts(this.pageNumber, this.pageSize, this.minPrice, this.maxPrice)
      .subscribe({
        next: (res) => {
          this.products = (res.data.items || []).map(p => this.productService.mapProductImage(p));
          this.filteredProducts = this.products;
          this.totalPages = res.data.totalPages || 1;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Lỗi khi load sản phẩm phân trang:', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }
}


searchProducts(): void {
  this.isLoading = true;
  this.productService
    .searchProducts(this.searchTerm, this.pageNumber, this.pageSize)
    .subscribe({
      next: (response: ApiResponse<PagedResult<Product>>) => {
        if (response.success) {
          this.products = (response.data.items || []).map((p: Product) =>
            this.productService.mapProductImage(p)
          );
          this.filteredProducts = this.products;
          this.totalPages = response.data.totalPages;

          const categorySet = new Set(
            this.products.map((p: Product) => (p.categoryName ?? '').trim() || 'Khác')
          );
          this.categories = ['Tất cả', ...Array.from(categorySet)];
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error);
        if (error.status === 403) {
          console.warn('API yêu cầu đăng nhập. Vui lòng đăng nhập để tìm kiếm sản phẩm.');
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
}



  filterProducts() {
    const normalize = (name?: string) => {
      const n = (name ?? '').trim();
      return n.length > 0 ? n : 'Khác';
    };

    this.filteredProducts = this.products.filter(p => {
      const productCat = normalize(p.categoryName);
      const matchCategory = this.selectedCategory === 'Tất cả' || productCat === this.selectedCategory;
      const matchPrice = p.price >= this.minPrice && p.price <= this.maxPrice;
      return matchCategory && matchPrice;
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.loadProducts();
  }

  changePageSize(size: number) {
    if (!size || size <= 0) return;
    this.pageSize = size;
    this.pageNumber = 1;
    this.loadProducts();
  }

  addToCart(product: Product) {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.message.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    this.cartService.addOrUpdateCart(product.id, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.message.success('Thêm vào giỏ hàng thành công');
        } else {
          this.message.error('Thêm vào giỏ hàng thất bại');
        }
      },
      error: (error) => {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
        // this.message.error('Thêm vào giỏ hàng thất bại');
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
      },
      // error: (error) => {
      //   console.error('Lỗi khi thêm vào yêu thích:', error);
      //   this.message.error('Không thể thêm sản phẩm vào yêu thích');
      // }
    });
  }


  viewDetails(p: Product) {
    this.selectedProduct = p;
  }

  trackByProductId(index: number, item: Product) {
    return item.id;
  }
}
