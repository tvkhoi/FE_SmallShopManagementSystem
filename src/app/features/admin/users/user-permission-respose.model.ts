import { Permission } from "../../../core/models/permission";

export interface UserPermissionsResponse {
  userId: number;
  permissions: Permission[];
}