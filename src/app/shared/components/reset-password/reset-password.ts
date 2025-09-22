import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    RouterLink,
  ],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss'],
})
export class ResetPassword implements OnInit {
  private userService = inject(UserService);
  private message = inject(NzMessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email: string = '';

  // state toggle con mắt
  showNewPassword = false;
  showConfirmPassword = false;

  formGroup = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.message.error('Liên kết không hợp lệ hoặc thiếu email!');
        this.router.navigate(['/forgot-password']);
      }
    });
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetPassword() {
    if (this.formGroup.invalid) {
      this.message.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const code = this.formGroup.get('code')?.value?.toString().trim() || '';
    const newPassword = this.formGroup.get('newPassword')?.value?.toString().trim() || '';
    const confirmPassword = this.formGroup.get('confirmPassword')?.value?.toString().trim() || '';

    if (newPassword !== confirmPassword) {
      this.message.error('Mật khẩu xác nhận không khớp');
      return;
    }

    this.userService.resetPassword({
      email: this.email,
      code: code,
      newPassword: newPassword
    }).subscribe({
      next: () => {
        this.message.success('Đặt lại mật khẩu thành công!');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.message.error(err.error?.message || 'Lỗi khi đặt lại mật khẩu!');
      }
    });
  }
}
