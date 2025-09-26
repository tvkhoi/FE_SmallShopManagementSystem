import { Router } from '@angular/router';
import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { UserService } from '../../../core/services/user.service';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PasswordPolicyService } from '../../../core/services/passwordPolicy.service';
import { PasswordPolicy } from '../../../core/models/PasswordPolicy';

@Component({
  selector: 'app-sign-up',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.scss'],
  imports: [
    ReactiveFormsModule,
    NzCardModule,
    NzAvatarModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    RouterModule,
    CommonModule,
    NzIconModule
  ],
  standalone: true,
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  isLoading = false;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private cdjf = inject(ChangeDetectorRef);
  private policyService = inject(PasswordPolicyService);

  passwordVisible = false;
  confirmPasswordVisible = false;

  policy!: PasswordPolicy; 

  ngOnInit(): void {
    this.policyService.getPolicy().subscribe({
      next: (res) => {
        this.policy = res;

        // Tạo form khi đã có policy
        this.signUpForm = this.fb.group(
          {
            fullname: [''],
            phoneNumber: ['', [Validators.pattern(/^0\d{9}$/)]],
            username: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, this.passwordPolicyValidator(this.policy)]],
            c_password: ['', [Validators.required]],
            address: [''],
          },
          { validators: this.passwordMatchValidator }
        );
      },
      error: () => {
        this.message.error('Không tải được password policy!');
      },
    });
  }

  passwordPolicyValidator(policy: PasswordPolicy): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = control.value as string;
      const errors: any = {};

      if (value.length < policy.requiredLength) {
        errors.requiredLength = true;
      }
      if (policy.requireUppercase && !/[A-Z]/.test(value)) {
        errors.uppercase = true;
      }
      if (policy.requireLowercase && !/[a-z]/.test(value)) {
        errors.lowercase = true;
      }
      if (policy.requireDigit && !/[0-9]/.test(value)) {
        errors.digit = true;
      }
      if (policy.requireNonAlphanumeric && !/[^a-zA-Z0-9]/.test(value)) {
        errors.nonAlphanumeric = true;
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  // Custom validator: check password trùng nhau
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('c_password')?.value;
    if (!password || !confirm) return null;
    return password === confirm ? null : { notSame: true };
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
      .pipe(finalize(() => { this.isLoading = false; setTimeout(() => this.cdjf.detectChanges(),2000); }))
      .subscribe({
        next: (res: any) => {
          console.log('Đăng ký thành công:', res);
          this.message.success('Đăng ký thành công');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Đăng ký thất bại:', err);
          //this.message.error(err.error?.message || 'Đăng ký thất bại, vui lòng thử lại!');
        },
      });
  }
}
