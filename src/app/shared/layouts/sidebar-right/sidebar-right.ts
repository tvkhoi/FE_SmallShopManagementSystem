import { routes } from './../../../app.routes';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-sidebar-right',
  standalone: true,
  imports: [NzLayoutModule, CommonModule, NzDropDownModule, NzIconModule],
  templateUrl: './sidebar-right.html',
  styleUrls: ['./sidebar-right.scss'],
})
export class SidebarRight {
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(NzMessageService);

  @Input() isProfileCardOpen: boolean = false;
  @Input() menuItems: Array<{ label: string, icon: string, route: string }> = [];
  @Output() toggleProfileCard = new EventEmitter<boolean>();

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

  onToggleProfileCard(toggle: boolean) {
    this.isProfileCardOpen = toggle;
    this.toggleProfileCard.emit(this.isProfileCardOpen);
  }
}
