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
import { getPendingPasswordRules, noWhitespaceValidator } from '../../../core/utils';

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

  getPendingPasswordRules = getPendingPasswordRules;
  noWhitespaceValidator = noWhitespaceValidator;

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly cdjf = inject(ChangeDetectorRef);
  private readonly policyService = inject(PasswordPolicyService);

  pendingRules: string[] = [];

  // Validator kiểm tra password match
  private readonly passwordMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('c_password')?.value;
    if (!password || !confirm) return null;
    return password === confirm ? null : { notSame: true };
  };

  // validator động dựa theo policy
  private createPasswordPolicyValidator(policy: PasswordPolicy): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const pending = getPendingPasswordRules(value, policy);
      return pending.length === 0 ? null : { passwordPolicy: pending.map((r) => r.label) };
    };
  }

  ngOnInit(): void {
    this.signUpForm = this.fb.group(
      {
        fullname: [''],
        phoneNumber: ['', [Validators.pattern(/^0\d{9}$/)]],
        username: ['', [Validators.required, noWhitespaceValidator]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, noWhitespaceValidator]],
        c_password: ['', [Validators.required]],
        address: [''],
      },
      { validators: this.passwordMatchValidator }
    );

    this.policyService.getPolicy().subscribe({
      next: (res) => {
        this.policy = res;

        const passwordCtrl = this.signUpForm.get('password');
        if(passwordCtrl){
          passwordCtrl.addValidators(this.createPasswordPolicyValidator(this.policy));
          passwordCtrl.updateValueAndValidity();
        }

        passwordCtrl?.valueChanges.subscribe((value) => {
          this.pendingRules = getPendingPasswordRules(value || '', this.policy).map((r) => r.label);
        });
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

    this.userService
      .signUp({ fullname, phoneNumber, username, email, password })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          setTimeout(() => this.cdjf.detectChanges(), 2000);
        })
      )
      .subscribe({
        next: () => {
          this.message.success('Đăng ký thành công');
          this.router.navigate(['/login']);
        },
        error: () => this.message.error('Đăng ký thất bại'),
      });
  }
}
