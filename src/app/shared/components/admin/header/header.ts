import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzHeaderComponent } from 'ng-zorro-antd/layout';
import { filter } from 'rxjs';
import { AuthService } from '../../../../auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProfileDropdown } from "../profile-dropdown/profile-dropdown";

@Component({
  selector: 'app-header',
  imports: [
    NzHeaderComponent,
    NzIconModule,
    RouterModule,
    CommonModule,
    ProfileDropdown
],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(NzMessageService);
  @Input() routeMap: { [key: string]: { title: string; icon: string } } = {};
  @Input() currentTitle: string = '';
  @Input() currentIcon: string = '';
  @Input() isMenuVisible: boolean = true;
  @Input() menuItems: Array<{ label: string; icon: string; route: string }> = [];

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const path = event.urlAfterRedirects;
        const config = this.routeMap[path];
        if (config) {
          this.currentTitle = config.title;
          this.currentIcon = config.icon;
        }
      });
  }

  getEmail(): string {
    return this.authService.getEmail() || 'Chưa có email';
  }

  getName(): string {
    return this.authService.getName() || 'Chưa có tên';
  }

  logout() {
    this.authService.clearTokens();
    this.router.navigate(['/login']);
    this.messageService.success('Đăng xuất thành công');
  }
}
