import { Permission } from "../../../core/models/permission";

export interface RolePermissionsResponse {
  roleId: number;
  permissions: Permission[];
}