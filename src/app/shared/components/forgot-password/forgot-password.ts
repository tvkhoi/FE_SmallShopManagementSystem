import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
  private readonly userService = inject(UserService);
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);
  private readonly cdj = inject(ChangeDetectorRef);

  isLoading = false;

  formGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  sendResetLink() {
    if (this.isLoading) return;
    const email = this.formGroup.get('email')?.value?.toString().trim() || '';
    this.isLoading = true;
    this.userService.forgotPassword(email).subscribe({
      next: (res: any) => {
        this.message.success('Đã gửi email đặt lại mật khẩu!');
        const encodedEmail = btoa(email);
        this.router.navigate(['/reset-password'], { queryParams: { e: encodedEmail } });
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error occurred while sending reset link:', err);
        this.cdj.markForCheck();
      },
    });
  }
}
