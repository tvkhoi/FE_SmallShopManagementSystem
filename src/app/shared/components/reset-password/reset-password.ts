import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  Validators,
  FormGroup,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserService } from '../../../core/services/user.service';
import { NzTabLinkTemplateDirective } from 'ng-zorro-antd/tabs';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { finalize } from 'rxjs';

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
    NzTabLinkTemplateDirective,
    NzTooltipDirective,
  ],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss'],
})
export class ResetPassword implements OnInit {
  private userService = inject(UserService);
  private message = inject(NzMessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdRef = inject(ChangeDetectorRef);

  email: string = '';

  showNewPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  formGroup = new FormGroup(
    {
      code: new FormControl('', [Validators.required, Validators.pattern(/^\d{6}$/)]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordsMatchValidator.bind(this) } // gán validator cho cả FormGroup
  );

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const encodedEmail = params['e'] || '';
      this.email = encodedEmail ? atob(encodedEmail) : '';
      if (!this.email) {
        this.message.error('Liên kết không hợp lệ hoặc thiếu email!');
        this.router.navigate(['/forgot-password']);
      }
    });
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) return null;

    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetPassword() {
    if (this.formGroup.invalid) {
      this.message.error('Vui lòng điền đầy đủ thông tin hợp lệ!');
      return;
    }

    const { code, newPassword } = this.formGroup.value;

    this.userService
      .resetPassword({
        email: this.email,
        code: code?.toString().trim() || '',
        newPassword: newPassword?.toString().trim() || '',
      })
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.isLoading = false;
            this.cdRef.detectChanges();
          }, 2000);
        })
      )
      .subscribe({
        next: () => {
          this.message.success('Đặt lại mật khẩu thành công!');
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          console.error('Error occurred while resetting password:', err);
        },
      });
  }
}
