import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent {
  // Giả dữ liệu cart
  cartItems = [
    { name: 'Bánh mì sandwich', category: 'Đồ ăn nhanh', price: 25000, quantity: 2, image: 'assets/pizza1.jpg' },
    { name: 'Trà sữa', category: 'Đồ uống', price: 35000, quantity: 1, image: 'assets/pizza1.jpg' }
  ];

  shipping = 15000;

  getSubtotal() {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getTotal() {
    return this.getSubtotal() + this.shipping;
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
  }
}
