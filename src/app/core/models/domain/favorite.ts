import { Product } from "./product";

export interface Favorite {
  productId: number;
  productName: string;
  imageUrls: string[];
  createdAt: string;
  product: Product; 
}
interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}