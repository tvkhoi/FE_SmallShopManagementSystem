import { PERMISSION_GROUPS } from '../constants/permission-groups';
import { PERMISSIONS } from '../constants/permission.constant';

export type UserInterfaceType = 'admin' | 'seller' | 'customer' | 'unknown';

export function getUserInterface(perms: string[]): UserInterfaceType {
  if (!perms?.length) return 'unknown';

  const hasAllAdmin = PERMISSION_GROUPS.ADMIN.every((p) => perms.includes(p));
  const hasAllSeller = PERMISSION_GROUPS.SELLER.every((p) => perms.includes(p));
  const hasAllCustomer = PERMISSION_GROUPS.CUSTOMER.every((p) => perms.includes(p));

  if (hasAllAdmin && hasAllSeller && hasAllCustomer) return 'admin';
  if (perms.some((p) => PERMISSION_GROUPS.ADMIN.includes(p))) return 'admin';
  if (perms.some((p) => PERMISSION_GROUPS.SELLER.includes(p))) return 'seller';
  if (perms.some((p) => PERMISSION_GROUPS.CUSTOMER.includes(p))) return 'customer';

  return 'unknown';
}

// Trang đầu tiên có quyền cho Admin
export function getFirstAccessibleAdminRoute(perms: string[]): string {
  if (perms.includes(PERMISSIONS.USERS_VIEW)) return '/admin/users';
  if (perms.includes(PERMISSIONS.ROLES_VIEW)) return '/admin/roles';
  if (perms.includes(PERMISSIONS.REPORTS_VIEW_DASHBOARD)) return '/admin/audit_log';
  if (perms.includes(PERMISSIONS.PERMISSIONS_VIEW)) return '/admin/settings';
  return '/forbidden';
}

// Trang đầu tiên có quyền cho Seller
export function getFirstAccessibleSellerRoute(perms: string[]): string {
  if (perms.includes(PERMISSIONS.PRODUCTS_VIEW)) return '/seller/products';
  if (perms.includes(PERMISSIONS.ORDERS_VIEW)) return '/seller/orders';
  if (perms.includes(PERMISSIONS.INVENTORY_VIEW)) return '/seller/inventory';
  return '/forbidden';
}

// Trang đầu tiên có quyền cho Customer
export function getFirstAccessibleCustomerRoute(perms: string[]): string {
  if (perms.includes(PERMISSIONS.ORDERS_VIEW)) return '/customer/orders';
  return '/';
}
