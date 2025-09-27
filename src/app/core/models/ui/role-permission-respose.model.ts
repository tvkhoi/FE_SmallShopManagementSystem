import { Permission } from "../../../core/models/domain/permission";

export interface RolePermissionsResponse {
  roleId: number;
  permissions: Permission[];
}