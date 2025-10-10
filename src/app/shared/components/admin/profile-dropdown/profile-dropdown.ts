import { Component, inject, Input } from '@angular/core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../../../auth/auth.service';
import { Button } from '../button/button';

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [CommonModule, NzDropDownModule, NzIconModule, Button, RouterLink],
  templateUrl: './profile-dropdown.html',
  styleUrls: ['./profile-dropdown.scss']
})
export class ProfileDropdown {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(NzMessageService);

  @Input() menuItems: Array<{ label: string; icon: string; route: string }> = [];

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

  onNavigate() {
    localStorage.setItem('hideMobileMenuOnNewTab', 'true');
  }

}

