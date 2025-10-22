// Kiểu trạng thái đơn hàng
export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

// Chi tiết từng sản phẩm trong đơn hàng
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

// Thông tin đơn hàng
export interface Order {
  id: number;
  userId: number;
  userName: string;
  orderDate: string;
  status: OrderStatus;   // đổi từ string sang OrderStatus
  totalAmount: number;
  items: OrderItem[];
}

// Lịch sử đơn hàng
export interface OrderHistory {
  id: number;
  orderDate: string;
  status: OrderStatus;   // đổi từ string sang OrderStatus
  totalAmount: number;
  items: OrderItem[];
}
