import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/domain/cartItem';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, NzInputNumberModule, NzCheckboxModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  selectedItems: Set<number> = new Set<number>();
  isLoading = true;
  shipping = 30000;

  constructor(
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.cartService.cartChanged$.subscribe(() => this.loadCart());
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: items => {
        this.cartItems = items.data;
        this.selectedItems = new Set(this.cartItems.map(i => i.productId)); // mặc định chọn tất cả
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Lỗi load giỏ hàng:', err);
        this.isLoading = false;
      }
    });
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedItems = new Set(this.cartItems.map(i => i.productId));
    } else {
      this.selectedItems.clear();
    }
  }

  toggleSelectItem(productId: number, checked: boolean): void {
    checked ? this.selectedItems.add(productId) : this.selectedItems.delete(productId);
  }

  isItemSelected(productId: number): boolean {
    return this.selectedItems.has(productId);
  }

  get subtotal(): number {
    return this.cartItems
      .filter(i => this.selectedItems.has(i.productId))
      .reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  get total(): number {
    if (this.selectedItems.size === 0) return 0;
    return this.subtotal + this.shipping;
  }

  getProductImage(item: CartItem): string {
    return this.cartService.getCartItemMainImage(item);
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(item.productId);
      return;
    }
    this.cartService.addOrUpdateCart(item.productId, newQuantity).subscribe({
      next: res => {
        if (res.success) {
          item.quantity = newQuantity;
          this.cdr.markForCheck();
        }
      },
      error: err => console.error('Lỗi update số lượng:', err)
    });
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(i => i.productId !== productId);
        this.selectedItems.delete(productId);
      },
      error: err => console.error('Lỗi remove item:', err)
    });
  }

  trackByProductId(index: number, item: CartItem): number {
    return item.productId;
  }
}
