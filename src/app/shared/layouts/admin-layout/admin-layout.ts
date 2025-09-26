import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { filter } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { SidebarLeft } from "../sidebar-left/sidebar-left";
import { SidebarRight } from "../sidebar-right/sidebar-right";
import { Header } from "../header/header";

@Component({
  selector: 'app-admin-layout',
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
    SidebarLeft,
    SidebarRight,
    Header
],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  standalone: true,
})
export class AdminLayout {
  private router = inject(Router);
  private authService = inject(AuthService);
  private messageService = inject(NzMessageService);
  private cdj = inject(ChangeDetectorRef);

  isCollapsed = false;
  isProfileCardOpen = false;

  currentTitle: string = 'Trang chủ';
  currentIcon: string = 'dashboard';

   routeMap: { [key: string]: { title: string; icon: string } } = {
    '/admin/dashboard': { title: 'Trang chủ', icon: 'dashboard' },
    '/admin/users': { title: 'Quản lý người dùng', icon: 'user' },
    '/admin/roles': { title: 'Quản lý vai trò', icon: 'role' },
    '/admin/audit_log': { title: 'Nhật ký hệ thống', icon: 'audit' },
    '/admin/settings': { title: 'Cài đặt', icon: 'setting' },
  };

  menuItemsLeft = [
    { label: 'Trang chủ', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Quản lý người dùng', icon: 'user', route: '/admin/users' },
    { label: 'Quản lý vai trò', icon: 'team', route: '/admin/roles' },
    { label: 'Nhật ký hệ thống', icon: 'audit', route: '/admin/audit_log' },
    { label: 'Cài đặt', icon: 'setting', route: '/admin/settings' },
  ];

  menuItemsRight = [
    { label: 'Tài khoản của tôi', icon: 'user', route: '/admin/notifications' },
  ];

  onCollapse(collapsed: any): void {
    this.isCollapsed = collapsed;
    this.cdj.detectChanges();
  }

  onToggleProfileCard() {
    this.isProfileCardOpen = !this.isProfileCardOpen;
  }

}
