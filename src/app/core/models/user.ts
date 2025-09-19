export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string | null;
  address: string;
  createdAt: Date;
  isActive: boolean;
  isDeleted: boolean;
  roleName?: string[];
}
