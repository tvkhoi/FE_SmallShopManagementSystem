import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { SidebarLeft } from '../../components/admin/sidebar-left/sidebar-left';
import { SidebarRight } from '../../components/admin/sidebar-right/sidebar-right';
import { Header } from '../../components/admin/header/header';

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
    Header,
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  standalone: true,
})
export class AdminLayout implements OnInit {
  private readonly router = inject(Router);
  private readonly cdj = inject(ChangeDetectorRef);

  isCollapsed = false;
  isProfileCardOpen = false;
  isMobileMenuHidden = false;

  currentTitle: string = '';
  currentIcon: string = '';

  routeMap: { [key: string]: { title: string; icon: string } } = {
    '/admin/users': { title: 'Quản lý người dùng', icon: 'user' },
    '/admin/roles': { title: 'Quản lý vai trò', icon: 'team' },
    '/admin/audit_log': { title: 'Nhật ký hệ thống', icon: 'audit' },
    '/admin/settings': { title: 'Cài đặt', icon: 'setting' },
    '/admin/account': { title: 'Tài khoản của tôi', icon: 'user' },
  };

  private readonly originalMenuItemsLeft = [
    { label: 'Quản lý người dùng', icon: 'user', route: '/admin/users' },
    { label: 'Quản lý vai trò', icon: 'team', route: '/admin/roles' },
    { label: 'Nhật ký hệ thống', icon: 'audit', route: '/admin/audit_log' },
    { label: 'Cài đặt', icon: 'setting', route: '/admin/settings' },
  ];

  menuItemsLeft = [...this.originalMenuItemsLeft];

  menuItemsRight = [{ label: 'Tài khoản của tôi', icon: 'user', route: '/admin/account' }];

  ngOnInit(): void {
    const hideMenu = localStorage.getItem('hideMobileMenuOnNewTab');
    this.isMobileMenuHidden = hideMenu === 'true';
    if (this.isMobileMenuHidden) {
      localStorage.removeItem('hideMobileMenuOnNewTab');
    }
    this.router.events.subscribe(() => {
      this.cdj.detectChanges();
    });
  }

  get menuItemsForSidebar() {
    const url = this.router.url;
    if (url.startsWith('/admin/account')) {
      return [];
    }
    return this.menuItemsLeft;
  }

  get currentPage() {
    const url = this.router.url;
    return this.routeMap[url] ?? { title: 'Quản lí người dùng', icon: 'user' };
  }

  onCollapse(collapsed: any): void {
    this.isCollapsed = collapsed;
    this.cdj.detectChanges();
  }

  onToggleProfileCard() {
    this.isProfileCardOpen = !this.isProfileCardOpen;
  }
  handleCollapseChange(hidden: boolean) {
    this.isMobileMenuHidden = hidden; 
  }
}
