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
  if (perms.some((p) => PERMISSION_GROUPS.ADMIN.includes(p))) {
    return '/admin/users';
  }
  return '/forbidden';
}

export function getFirstAccessibleSellerRoute(perms: string[]): string {
  if (perms.some((p) => PERMISSION_GROUPS.SELLER.includes(p))) {
    return '/seller/dashboard';
  }
  return '/forbidden';
}

export function getFirstAccessibleCustomerRoute(perms: string[]): string {
  if (perms.some((p) => PERMISSION_GROUPS.CUSTOMER.includes(p))) {
    return '/';
  }
  return '/forbidden';
}
