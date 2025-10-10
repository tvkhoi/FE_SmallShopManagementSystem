import { Product } from "./product";

export interface CartItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    product?: Product;
    imageUrls: string[];
  }
interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}