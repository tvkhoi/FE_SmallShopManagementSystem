import { Product } from "./product";

export interface InventoryHistory {
  id: number;
  productId: number;
  quantityChanged: number;
  action: string;
  createdAt: string;
  product?: Product;
}
