import { Permission } from "../domain/permission";

export interface UserPermissionsResponse {
  userId: number;
  permissions: Permission[];
}