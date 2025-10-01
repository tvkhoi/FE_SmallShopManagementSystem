import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.scss']
})
export class WishlistComponent {
  wishlistItems = [
    { name: 'Pizza phô mai', category: 'Đồ ăn nhanh', price: 99000, image: 'assets/pizza1.jpg' },
    { name: 'Nước ép cam', category: 'Đồ uống', price: 29000, image: 'assets/pizza1.jpg' },
  ];

  removeItem(index: number) {
    this.wishlistItems.splice(index, 1);
  }

  addToCart(item: any) {
    // ở đây bạn có thể gọi service để thêm item vào giỏ hàng
    alert(`Đã thêm ${item.name} vào giỏ hàng!`);
  }
}
