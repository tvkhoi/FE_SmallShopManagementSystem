import { PERMISSION_GROUPS } from '../constants/permission-groups';
import { PERMISSIONS } from '../constants/permission.constant';

export type UserInterfaceType = 'admin' | 'seller' | 'customer' | 'unknown';


// Xác định giao diện người dùng dựa trên quyền

export function getUserInterface(perms: string[]): UserInterfaceType {
  if (!perms?.length) return 'unknown';

  const hasAllAdmin = PERMISSION_GROUPS.ADMIN.every((p) => perms.includes(p));
  const hasAllSeller = PERMISSION_GROUPS.SELLER.every((p) => perms.includes(p));
  const hasAllCustomer = PERMISSION_GROUPS.CUSTOMER.every((p) => perms.includes(p));

  // Ưu tiên cấp cao nhất
  if (hasAllAdmin) return 'admin';
  if (hasAllSeller) return 'seller';
  if (hasAllCustomer) return 'customer';

  // Kiểm tra quyền riêng lẻ
  if (perms.some((p) => PERMISSION_GROUPS.ADMIN.includes(p))) return 'admin';
  if (perms.some((p) => PERMISSION_GROUPS.SELLER.includes(p))) return 'seller';
  if (perms.some((p) => PERMISSION_GROUPS.CUSTOMER.includes(p))) return 'customer';

  return 'unknown';
}

export function getFirstAccessibleAdminRoute(perms: string[]): string {
  if (perms.includes(PERMISSIONS.USERS_VIEW)) return '/admin/users';
  if (perms.includes(PERMISSIONS.ROLES_VIEW)) return '/admin/roles';
  if (perms.includes(PERMISSIONS.REPORTS_VIEW)) return '/admin/audit_log';
  if (perms.includes(PERMISSIONS.PERMISSIONS_VIEW)) return '/admin/settings';
  if (perms.includes(PERMISSIONS.DASHBOARD_VIEW)) return '/admin/account';
  return '/forbidden';
}

export function getFirstAccessibleSellerRoute(perms: string[]): string {
  if (perms.includes(PERMISSIONS.DASHBOARD_VIEW)) return '/seller/dashboard';
  if (perms.includes(PERMISSIONS.PRODUCTS_VIEW)) return '/seller/products';
  if (perms.includes(PERMISSIONS.ORDERS_VIEW)) return '/seller/orders';
  if (perms.includes(PERMISSIONS.INVENTORY_VIEW)) return '/seller/inventory-management';
  return '/forbidden';
}

export function getFirstAccessibleCustomerRoute(perms: string[]): string {
  if (perms.includes(PERMISSIONS.CART_VIEW)) return '/customer/cart';
  if (perms.includes(PERMISSIONS.FAVORITES_VIEW)) return '/customer/wishlist';
  if (perms.includes(PERMISSIONS.PRODUCTS_VIEW)) return '/products';
  return '/';
}