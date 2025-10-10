import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/domain/cartItem';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
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
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Lỗi load giỏ hàng:', err);
        this.isLoading = false;
      }
    });
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  get total(): number {
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
      next: () => this.cartItems = this.cartItems.filter(i => i.productId !== productId),
      error: err => console.error('Lỗi remove item:', err)
    });
  }

  trackByProductId(index: number, item: CartItem): number {
    return item.productId;
  }
}
