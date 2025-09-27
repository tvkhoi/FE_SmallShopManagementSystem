import { Component, OnInit, ViewEncapsulation, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../../core/services/user.service';
import { PasswordPolicyService } from '../../../core/services/passwordPolicy.service';
import { PasswordPolicy } from '../../../core/models/domain/PasswordPolicy';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzAvatarModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    RouterLink,
  ],
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  isLoading = false;

  passwordFocused = false;
  passwordVisible = false;
  confirmPasswordVisible = false;
  policy!: PasswordPolicy;

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly cdjf = inject(ChangeDetectorRef);
  private readonly policyService = inject(PasswordPolicyService);

  // Mảng điều kiện password
  get passwordRules() {
    return [
      { key: 'requiredLength', label: `Ít nhất ${this.policy?.requiredLength || 8} ký tự` },
      { key: 'uppercase', label: 'Chữ hoa (A-Z)' },
      { key: 'lowercase', label: 'Chữ thường (a-z)' },
      { key: 'digit', label: 'Số (0-9)' },
      { key: 'nonAlphanumeric', label: 'Ký tự đặc biệt (!@#$...)' },
    ];
  }

  // Validator kiểm tra password match
  private readonly passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('c_password')?.value;
    if (!password || !confirm) return null;
    return password === confirm ? null : { notSame: true };
  };

  // Validator chính sách password
  private passwordPolicyValidator(policy: PasswordPolicy): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = control.value as string;
      const errors: any = {};
      if (value.length < policy.requiredLength) errors.requiredLength = true;
      if (policy.requireUppercase && !/[A-Z]/.test(value)) errors.uppercase = true;
      if (policy.requireLowercase && !/[a-z]/.test(value)) errors.lowercase = true;
      if (policy.requireDigit && !/\d/.test(value)) errors.digit = true;
      if (policy.requireNonAlphanumeric && !/[^a-zA-Z0-9]/.test(value)) errors.nonAlphanumeric = true;
      return Object.keys(errors).length ? errors : null;
    };
  }

  ngOnInit(): void {
    this.signUpForm = this.fb.group(
      {
        fullname: ['', Validators.required],
        phoneNumber: ['', [Validators.pattern(/^0\d{9}$/)]],
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        c_password: ['', Validators.required],
        address: [''],
      },
      { validators: this.passwordMatchValidator }
    );

    this.policyService.getPolicy().subscribe({
      next: (res) => {
        this.policy = res;
        const passwordControl = this.signUpForm.get('password');
        if (passwordControl) {
          passwordControl.setValidators([
            Validators.required,
            this.passwordPolicyValidator(this.policy),
          ]);
          passwordControl.updateValueAndValidity();
        }
      },
      error: () => console.error('Không thể lấy chính sách mật khẩu'),
    });
  }

  signUp(): void {
    if (this.signUpForm.invalid) {
      Object.values(this.signUpForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      this.message.error('Vui lòng nhập đầy đủ thông tin hợp lệ!');
      return;
    }

    this.isLoading = true;
    const { fullname, phoneNumber, username, email, password } = this.signUpForm.value;

    this.userService.signUp({ fullname, phoneNumber, username, email, password })
      .pipe(finalize(() => {
        this.isLoading = false;
        setTimeout(() => this.cdjf.detectChanges(), 2000);
      }))
      .subscribe({
        next: () => {
          this.message.success('Đăng ký thành công');
          this.router.navigate(['/login']);
        },
        error: () => this.message.error('Đăng ký thất bại'),
      });
  }
}
