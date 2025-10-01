import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class ProductsComponent {
  categories = ['Tất cả', 'Mì tôm', 'Bánh mì', 'Nước', 'Sữa'];
  selectedCategory = 'Tất cả';
  selectedPrice = 'all'; // 🔥 thêm lọc giá

  products: Product[] = [
    { id: 1, name: 'Delicious Mì tôm', category: 'Mì tôm', description: '...', price: 20, image: 'assets/pizza1.jpg' },
    { id: 2, name: 'Delicious Burger', category: 'Bánh mì', description: '...', price: 15, image: 'assets/pizza1.jpg' },
    { id: 3, name: 'Delicious Pizza', category: 'Bánh mì', description: '...', price: 17, image: 'assets/pizza1.jpg' },
    { id: 4, name: 'Delicious Pasta', category: 'Sữa', description: '...', price: 12, image: 'assets/pizza1.jpg' },
    { id: 5, name: 'Crispy Fries', category: 'Nước', description: '...', price: 8, image: 'assets/pizza1.jpg' }
  ];

  // ✅ Lọc sản phẩm theo category + giá
  get filteredProducts() {
    return this.products.filter(p => {
      const matchCategory = this.selectedCategory === 'Tất cả' || p.category === this.selectedCategory;

      let matchPrice = true;
      if (this.selectedPrice === 'low') matchPrice = p.price < 10;
      else if (this.selectedPrice === 'mid') matchPrice = p.price >= 10 && p.price <= 20;
      else if (this.selectedPrice === 'high') matchPrice = p.price > 20;

      return matchCategory && matchPrice;
    });
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
  }

  filterByPrice(range: string) {
    this.selectedPrice = range;
  }

  addToCart(product: Product) {
    console.log('Add to cart', product);
  }
}
