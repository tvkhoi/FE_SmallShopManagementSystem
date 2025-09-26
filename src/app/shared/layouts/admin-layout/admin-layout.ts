import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
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
export class AdminLayout implements OnInit {
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
  };

  menuItemsLeft = [
    { label: 'Trang chủ', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Quản lý người dùng', icon: 'user', route: '/admin/users' },
    { label: 'Quản lý vai trò', icon: 'team', route: '/admin/roles' },
    { label: 'Nhật ký hệ thống', icon: 'audit', route: '/admin/audit_log' },
    { label: 'Cài đặt', icon: 'setting', route: '/admin/settings' },
  ];

  menuItemsRight = [
    { label: 'Thông báo', icon: 'notification', route: '/admin/notifications' },
    { label: 'Hỗ trợ', icon: 'support', route: '/admin/support' },
  ];

  ngOnInit(): void {
    // this.router.events
    //   .pipe(filter((event) => event instanceof NavigationEnd))
    //   .subscribe((event: any) => {
    //     const path = event.urlAfterRedirects;
    //     const config = this.routeMap[path];
    //     if (config) {
    //       this.currentTitle = config.title;
    //       this.currentIcon = config.icon;
    //     }
    //   });
  }

  onCollapse(collapsed: any): void {
    this.isCollapsed = collapsed;
    this.cdj.detectChanges();
  }

  // logout() {
  //   this.authService.clearTokens();
  //   this.router.navigate(['/login']);
  //   this.messageService.success('Đăng xuất thành công');
  // }

  onToggleProfileCard() {
    this.isProfileCardOpen = !this.isProfileCardOpen;
  }
  // getEmail(): string {
  //   return this.authService.getEmail() || 'Chưa có email';
  // }

  // getName(): string {
  //   return this.authService.getName() || 'Chưa có tên';
  // }
}
