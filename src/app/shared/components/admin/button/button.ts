import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-button',
  imports: [CommonModule, NzButtonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  standalone: true,
})
export class Button {
  private readonly authService = inject(AuthService);

  @Input() type: 'primary' | 'cancel' | 'secondary' | 'danger' | 'ghost' | 'link' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Input() isActive: boolean = false;
  @Input() customClass: string = '';
  @Input() isLoading: boolean = false;
  @Input() fullWidth = false;
  @Input() permissions?: string[];

  get hasPermission(): boolean {
    if (!this.permissions) return true;
    return this.permissions.every(permission => this.authService.hasPermission(permission));
  }
}
