import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { getUserInterface } from '../../../core/utils/permission.utils';
import { PERMISSION_GROUPS } from '../../../core/constants/permission-groups';
import { Button } from "../admin/button/button";

@Component({
  selector: 'app-layout-switcher',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './layout-switcher-component.html',
  styleUrls: ['./layout-switcher-component.scss']
})
export class LayoutSwitcherComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  availableRoles: string[] = [];
  currentRole: string = 'unknown';

  ngOnInit() {
    const permissions = this.auth.getPermissions();

    // Xác định giao diện hiện tại
    this.currentRole = getUserInterface(permissions);

    // Kiểm tra xem user có quyền truy cập giao diện nào
    const roles: string[] = [];

    if (permissions.some(p => PERMISSION_GROUPS.ADMIN.includes(p))) {
      roles.push('admin');
    }
    if (permissions.some(p => PERMISSION_GROUPS.SELLER.includes(p))) {
      roles.push('seller');
    }
      roles.push('customer');

    this.availableRoles = roles;
  }

  navigateTo(role: string) {
    switch (role.toLowerCase()) {
      case 'admin':
        this.router.navigate(['/admin/users']);
        break;
      case 'seller':
        this.router.navigate(['/seller/dashboard']);
        break;
      case 'customer':
        this.router.navigate(['/customer/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
