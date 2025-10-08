export interface Category {
  id: number;
  name: string;
}
interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}