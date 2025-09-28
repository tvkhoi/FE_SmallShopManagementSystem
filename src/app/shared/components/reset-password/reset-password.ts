import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { finalize } from 'rxjs';

import { UserService } from '../../../core/services/user.service';
import { PasswordPolicyService } from '../../../core/services/passwordPolicy.service';
import { PasswordPolicy } from '../../../core/models/domain/PasswordPolicy';
import { getPendingPasswordRules, noWhitespaceValidator } from '../../../core/utils';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
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
  private readonly userService = inject(UserService);
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly policyService = inject(PasswordPolicyService);

  email: string = '';
  isLoading = false;

  showNewPassword = false;
  showConfirmPassword = false;

  policy!: PasswordPolicy;
  pendingRules: string[] = [];

  getPendingPasswordRules = getPendingPasswordRules;
  noWhitespaceValidator = noWhitespaceValidator;

  formGroup!: FormGroup;

  ngOnInit() {
    // Lấy email từ query string
    this.route.queryParams.subscribe((params) => {
      const encodedEmail = params['e'] || '';
      this.email = encodedEmail ? atob(encodedEmail) : '';
      if (!this.email) {
        this.message.error('Liên kết không hợp lệ hoặc thiếu email!');
        this.router.navigate(['/forgot-password']);
      }
    });

    // Khởi tạo form
    this.formGroup = this.fb.group(
      {
        code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
        newPassword: ['', [Validators.required, noWhitespaceValidator]],
        confirmPassword: ['', [Validators.required, noWhitespaceValidator]],
      },
      { validators: this.passwordsMatchValidator }
    );

    // Lấy policy để check password động
    this.policyService.getPolicy().subscribe({
      next: (res) => {
        this.policy = res;

        const passwordCtrl = this.formGroup.get('newPassword');
        if (passwordCtrl) {
          passwordCtrl.addValidators(this.createPasswordPolicyValidator(this.policy));
          passwordCtrl.updateValueAndValidity();
        }

        passwordCtrl?.valueChanges.subscribe((value) => {
          this.pendingRules = getPendingPasswordRules(value || '', this.policy).map((r) => r.label);
        });
      },
      error: () => this.message.error('Không thể tải chính sách mật khẩu'),
    });
  }

  // Validator: newPassword và confirmPassword phải khớp
  private readonly passwordsMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (!newPassword || !confirmPassword) return null;
    return newPassword === confirmPassword ? null : { mismatch: true };
  };

  // Validator: mật khẩu phải thỏa mãn policy
  private createPasswordPolicyValidator(policy: PasswordPolicy): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const pending = getPendingPasswordRules(value, policy);
      return pending.length === 0 ? null : { passwordPolicy: pending.map((r) => r.label) };
    };
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetPassword() {
    if (this.formGroup.invalid) {
      Object.values(this.formGroup.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      this.message.error('Vui lòng nhập đầy đủ thông tin hợp lệ!');
      return;
    }

    this.isLoading = true;
    const { code, newPassword } = this.formGroup.value;

    this.userService
      .resetPassword({
        email: this.email,
        code: code?.toString().trim() || '',
        newPassword: newPassword?.toString().trim() || '',
      })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          setTimeout(() => this.cdRef.detectChanges(), 2000);
        })
      )
      .subscribe({
        next: () => {
          this.message.success('Đặt lại mật khẩu thành công!');
          this.router.navigate(['/login']);
        },
        error: () => console.error('Đặt lại mật khẩu thất bại!'),
      });
  }
}
