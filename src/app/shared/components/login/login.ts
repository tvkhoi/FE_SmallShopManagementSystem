import { AuthService } from './../../../auth/auth.service';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    RouterModule,
    CommonModule,
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;

  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private message = inject(NzMessageService);

  ngOnInit() {
    // Tạo form reactive
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.loginForm.invalid) {
      this.message.warning('Vui lòng nhập email và mật khẩu');
      return;
    }

    this.isLoading = true;
    this.userService
      .login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          this.userService.changeData(res);
          console.log('Đăng nhập thành công, response:', res);

          // đồng bộ tên key token từ backend
          const accessToken = res.accessToken || res.token;
          const refreshToken = res.refreshToken;

          if (accessToken && refreshToken) {
            this.authService.saveTokens(accessToken, refreshToken);
            this.authService.redirectByRole();
          } else {
            console.error('Không tìm thấy accessToken/refreshToken trong response');
          }

          this.message.success('Đăng nhập thành công');
        },
        error: () => {
          this.message.error('Đăng nhập thất bại');
        },
      });
  }
}
