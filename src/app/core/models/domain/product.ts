export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrls: string[];
  categoryName?: string;
  isActive: boolean; 
  isFeatured: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  totalPages: number;  
  pageSize: number;
}