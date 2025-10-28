export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  id: number;
  name: string;
}

export interface MoveProductsDto {
  fromCategoryId: number;
  toCategoryId: number;
}
