export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string | null;
  isActive: boolean;
  isDeleted: boolean;
  roleName?: string[];
}
