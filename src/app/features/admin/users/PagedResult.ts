export interface PagedResult<T> {
  totalItems: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  items: T[];
}
