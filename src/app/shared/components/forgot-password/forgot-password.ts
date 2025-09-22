import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { UserService } from '../../../core/services/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    RouterLink,
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
})
export class ForgotPassword {
  private userService = inject(UserService);
  private message = inject(NzMessageService);
  private router = inject(Router); // inject Router

  formGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  sendResetLink() {
    if (this.formGroup.invalid) {
      this.message.error('Vui lòng nhập email hợp lệ');
      return;
    }

    const email = this.formGroup.get('email')?.value?.toString().trim() || '';

    this.userService.forgotPassword(email).subscribe({
      next: (res: any) => {
        this.message.success('Đã gửi email đặt lại mật khẩu!');
        this.router.navigate(['/reset-password'], { queryParams: { email } });
      },
      error: (err: any) => this.message.error(err.error?.message || 'Lỗi!'),
    });
  }
}
