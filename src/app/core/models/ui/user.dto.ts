export interface UserDTO {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  password: string;
  address?: string;
  createdAt: Date;
  isActive: boolean;
  isDeleted: boolean;
  RoleName?: string[];
}
