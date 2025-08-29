import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { filter } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  standalone: true
})
export class AdminLayout implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private messageService = inject(NzMessageService);

  isCollapsed = false;
  sidebarOpen = false;

  currentTitle: string = 'Dashboard';
  currentIcon: string = 'dashboard';

  private routeMap: { [key: string]: { title: string; icon: string } } = {
    '/admin/dashboard': { title: 'Dashboard', icon: 'dashboard' },
    '/admin/users': { title: 'Users', icon: 'user' },
    '/admin/roles': { title: 'Roles', icon: 'role' },
    '/admin/audit_log': { title: 'Audit Log', icon: 'audit' }
  };

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const path = event.urlAfterRedirects;
        const config = this.routeMap[path];
        if (config) {
          this.currentTitle = config.title;
          this.currentIcon = config.icon;
        }
      });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  logout() {
    this.authService.clearToken();
    this.router.navigate(['/login']);
    this.messageService.success('Đăng xuất thành công');
  }
}
