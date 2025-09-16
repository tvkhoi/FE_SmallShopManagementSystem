import { Router } from '@angular/router';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
    CommonModule
  ],
  standalone: true
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  isLoading = false;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  ngOnInit(): void {
    this.signUpForm = this.fb.group(
      {
        fullname: ['', [Validators.required]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^0[0-9]{9}$/)]],
        username: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        c_password: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );
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
      Object.values(this.signUpForm.controls).forEach(control => {
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
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          console.log('Đăng ký thành công:', res);
          this.message.success('Đăng ký thành công');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Đăng ký thất bại:', err);
          this.message.error(err.error?.message || 'Đăng ký thất bại, vui lòng thử lại!');
        }
      });
  }
}
